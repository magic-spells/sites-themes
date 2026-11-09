#!/bin/sh
# Publishes every tagged theme release (<name>/v<version>, minimal excepted) to
# the Sites registry, oldest version first per theme, and prints one line per
# version. A package the registry does not have yet is created with the listing
# copy from the last catalog.json. A version already published (or yanked) is
# skipped, so a rerun picks up where a failure stopped it.
# Usage: SITES_TOKEN=... [SITES_WORKSPACE=<uuid>] sh scripts/publish-history.sh [--dry-run]
set -eu

api=${SITES_API:-https://sites-api.magicspells.io}/v1/theme-packages
query=${SITES_WORKSPACE:+?workspace_id=$SITES_WORKSPACE}
dry=${1:-}
repo=$(cd "$(dirname "$0")/.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
# The last commit on main that still had catalog.json.
listings=$(git -C "$repo" show 1ca0fb7:catalog.json)

# call <method> <url> [curl args...]: the body lands in $tmp/body, the status is printed.
call() {
  m=$1 u=$2
  shift 2
  curl -sS -o "$tmp/body" -w '%{http_code}' -X "$m" -H "Authorization: Bearer $SITES_TOKEN" "$@" "$u$query"
}

[ "$dry" = --dry-run ] || : "${SITES_TOKEN:?set SITES_TOKEN, or pass --dry-run}"

current=
for tag in $(git -C "$repo" tag -l '*/v*' --sort=version:refname); do
  name=${tag%/v*}
  version=${tag#*/v}
  [ "$name" = minimal ] && continue
  zip=$(cd "$tmp" && sh "$repo/scripts/zip.sh" "$name" "$tag")
  git -C "$repo" show "$tag:$name/CHANGELOG.md" |
    awk -v v="$version" '/^## / { on = ($2 == v); next } on' >"$tmp/notes"

  if [ "$dry" = --dry-run ]; then
    [ "$name" = "$current" ] || echo "GET $api/$name, then POST $api if it is missing"
    echo "POST $api/$name/releases version=$version archive=$zip ($(wc -c <"$tmp/$zip" | tr -d ' ') bytes) notes=$(wc -c <"$tmp/notes" | tr -d ' ') bytes"
    current=$name
    continue
  fi

  if [ "$name" != "$current" ] && [ "$(call GET "$api/$name")" = 404 ]; then
    echo "$listings" | jq --arg n "$name" '.themes[] | select(.name == $n) |
      {name, listing: {label, description, category, vertical, license, publisher, screenshots}}' >"$tmp/package"
    status=$(call POST "$api" -H 'Content-Type: application/json' --data-binary "@$tmp/package")
    [ "$status" = 201 ] || { echo "$name: create failed ($status): $(cat "$tmp/body")" >&2; exit 1; }
  fi
  current=$name

  release=$api/$name/releases/$version
  state=$( [ "$(call GET "$release")" = 200 ] && jq -r .status "$tmp/body" || echo none)
  case $state in
    published | yanked)
      echo "$tag $state, skipped"
      continue
      ;;
    pending) ;;
    *)
      status=$(call POST "$api/$name/releases" -F "archive=@$tmp/$zip;type=application/zip" \
        -F "version=$version" -F "notes=<$tmp/notes")
      [ "$status" = 202 ] || { echo "$tag: upload failed ($status): $(cat "$tmp/body")" >&2; exit 1; }
      ;;
  esac

  # The worker validates and compiles the archive; wait up to five minutes.
  i=0
  while [ "$state" != published ] && [ "$state" != failed ] && [ "$i" -lt 150 ]; do
    sleep 2
    call GET "$release" >/dev/null
    state=$(jq -r .status "$tmp/body")
    i=$((i + 1))
  done
  echo "$tag $state"
  [ "$state" = published ] || { jq -c .diagnostics "$tmp/body" >&2; exit 1; }
done
