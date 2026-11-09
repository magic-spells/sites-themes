#!/bin/sh
# Publishes every tagged theme release (<name>/v<version>, minimal excepted) to
# the Sites registry, oldest version first per theme, and prints one line per
# version. A package the registry does not have yet is created with the listing
# copy from the last catalog.json. A version already published (or yanked) is
# skipped. A failed version is recorded and the run goes on; the summary at the
# end lists every version, and the exit is non-zero if any failed.
# Usage: SITES_TOKEN=... [SITES_WORKSPACE=<uuid>] sh scripts/publish-history.sh [--dry-run]
set -eu

api=${SITES_API:-https://sites-api.magicspells.io}/v1/theme-packages
dry=${1:-}
semver='^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$'
repo=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
# The last commit on main that still had catalog.json.
listings=$(git -C "$repo" show 1ca0fb7:catalog.json)

# call <method> <url> [curl args...]: the body lands in $tmp/body, the status is printed.
call() {
  m=$1 u=$2
  shift 2
  curl -sS -o "$tmp/body" -w '%{http_code}' -X "$m" -H "Authorization: Bearer $SITES_TOKEN" "$@" "$u"
}

# record <outcome> [<detail>]: prints the version's line and keeps it for the summary.
record() { printf '%s\t%s\t%s\n' "$tag" "$1" "${2:-}" | tee -a "$tmp/summary"; }

[ "$dry" = --dry-run ] || : "${SITES_TOKEN:?set SITES_TOKEN, or pass --dry-run}"

current=
for tag in $(git -C "$repo" tag -l '*/v*' --sort=version:refname); do
  name=${tag%/v*}
  version=${tag#*/v}
  [ "$name" = minimal ] && continue
  echo "$name" | grep -Eq '^[a-z0-9][a-z0-9-]*$' && echo "$version" | grep -Eq "$semver" ||
    { echo "$tag: not <name>/v<semver>" >&2; exit 1; }
  # zip.sh names the zip after the version in the tag's theme.json.
  zip=$(cd "$tmp" && sh "$repo/scripts/zip.sh" "$name" "$tag")
  [ "$zip" = "$name-v$version.zip" ] || { echo "$tag: its theme.json says $zip" >&2; exit 1; }
  git -C "$repo" show "$tag:$name/CHANGELOG.md" |
    awk -v v="$version" '/^## / { on = ($2 == v); next } on' >"$tmp/notes"

  if [ "$dry" = --dry-run ]; then
    [ "$name" = "$current" ] || echo "GET $api/$name, then POST $api if it is missing"
    echo "POST $api/$name/releases version=$version archive=$zip ($(wc -c <"$tmp/$zip" | tr -d ' ') bytes) notes=$(wc -c <"$tmp/notes" | tr -d ' ') bytes"
    current=$name
    continue
  fi

  if [ "$name" != "$current" ] && [ "$(call GET "$api/$name")" = 404 ]; then
    # Creation names the workspace; every later route finds it from the package.
    echo "$listings" | jq --arg n "$name" --arg w "${SITES_WORKSPACE:-}" '.themes[] | select(.name == $n) |
      {name, listing: {label, description, category, vertical, license, publisher, screenshots}} +
      if $w == "" then {} else {workspace_id: $w} end' >"$tmp/package"
    status=$(call POST "$api" -H 'Content-Type: application/json' --data-binary "@$tmp/package")
    [ "$status" = 201 ] || { echo "$name: create failed ($status): $(cat "$tmp/body")" >&2; exit 1; }
  fi
  current=$name

  release=$api/$name/releases/$version
  state=$( [ "$(call GET "$release")" = 200 ] && jq -r .status "$tmp/body" || echo none)
  case $state in
    published | yanked)
      record skipped "$state"
      continue
      ;;
    pending) ;;
    *)
      status=$(call POST "$api/$name/releases" -F "archive=@$tmp/$zip;type=application/zip" \
        --form-string "version=$version" --form-string "notes=$(cat "$tmp/notes")")
      if [ "$status" != 202 ]; then
        record failed "upload $status: $(tr -d '\n' <"$tmp/body")"
        continue
      fi
      state=pending
      ;;
  esac

  # The worker validates and compiles the archive; wait up to five minutes.
  i=0
  while [ "$state" = pending ] && [ "$i" -lt 150 ]; do
    sleep 2
    call GET "$release" >/dev/null
    state=$(jq -r .status "$tmp/body")
    i=$((i + 1))
  done
  if [ "$state" = published ]; then
    record published
  else
    # The first diagnostic, or the state a release still pending was left in.
    record failed "$(jq -r '.diagnostics[0].message // .status' "$tmp/body")"
  fi
done

# The summary, then a non-zero exit if any version failed.
[ -f "$tmp/summary" ] || exit 0
echo
column -t -s '	' "$tmp/summary"
! grep -q '	failed	' "$tmp/summary"
