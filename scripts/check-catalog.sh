#!/bin/sh
# Checks catalog.json, the feed the Sites theme store reads. Run from the repo
# root: sh scripts/check-catalog.sh. Prints one line per problem and exits 1.
set -eu

catalog=catalog.json
base=https://github.com/magic-spells/sites-themes/releases/download
semver='^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$'
keys='name label description category vertical license publisher version zip sha256 screenshots'
fail=0

problem() {
  echo "$1: $2" >&2
  fail=1
}

if ! jq -e '.themes | type == "array"' "$catalog" >/dev/null 2>&1; then
  echo "$catalog: not JSON with a themes array" >&2
  exit 1
fi

dupes=$(jq -r '[.themes[].name] | group_by(.) | map(select(length > 1) | .[0]) | .[]' "$catalog")
for d in $dupes; do
  problem "$catalog" "theme $d is listed more than once"
done

count=$(jq '.themes | length' "$catalog")
i=0
while [ "$i" -lt "$count" ]; do
  at="$catalog .themes[$i]"
  entry=$(jq -c ".themes[$i]" "$catalog")
  for k in $keys; do
    echo "$entry" | jq -e --arg k "$k" 'has($k)' >/dev/null || problem "$at" "missing $k"
  done

  name=$(echo "$entry" | jq -r '.name // ""')
  version=$(echo "$entry" | jq -r '.version // ""')
  category=$(echo "$entry" | jq -r '.category // ""')
  zip=$(echo "$entry" | jq -r '.zip // ""')
  at="$catalog .themes[$i] ($name)"

  case "$category" in
    content | commerce) ;;
    *) problem "$at" "category is \"$category\", want content or commerce" ;;
  esac

  if [ "$name" = minimal ]; then
    problem "$at" "minimal is the engine's scaffold and is never in the catalog"
  fi

  if [ -z "$name" ] || [ ! -f "$name/theme.json" ]; then
    problem "$at" "no theme folder $name/ with a theme.json"
  else
    folder_version=$(jq -r '.version // ""' "$name/theme.json")
    if [ "$version" != "$folder_version" ]; then
      problem "$at" "version $version, but $name/theme.json says $folder_version"
    fi
  fi

  if ! echo "$version" | grep -Eq "$semver"; then
    problem "$at" "version \"$version\" is not semver"
  fi

  want="$base/$name/v$version/$name-v$version.zip"
  if [ "$zip" != "$want" ]; then
    problem "$at" "zip is $zip, want $want"
  fi

  echo "$entry" | jq -e '.sha256 == null or (.sha256 | type == "string" and test("^[0-9a-f]{64}$"))' >/dev/null ||
    problem "$at" "sha256 must be null or 64 lowercase hex"

  i=$((i + 1))
done

exit "$fail"
