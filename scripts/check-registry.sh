#!/bin/sh
# Checks every theme folder but minimal: its settings/theme.json version is
# semver, and the Sites registry lists that version as published. Without
# SITES_TOKEN (a fork's CI) the registry half is skipped. Run from the repo
# root: sh scripts/check-registry.sh. Prints one line per problem and exits 1.
set -eu

semver='^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$'
catalog=
fail=0

if [ -n "${SITES_TOKEN:-}" ]; then
  catalog=$(curl -fsS -H "Authorization: Bearer $SITES_TOKEN" \
    "${SITES_API:-https://sites-api.magicspells.io}/v1/themes/catalog")
  if echo "$catalog" | jq -e '.data[] | select(.name == "minimal")' >/dev/null; then
    echo "registry: minimal is the engine's scaffold and is never in the store" >&2
    fail=1
  fi
else
  echo "registry check skipped: no SITES_TOKEN"
fi

for f in */settings/theme.json; do
  name=${f%%/*}
  [ "$name" = minimal ] && continue
  version=$(jq -r '.version // ""' "$f")
  if ! echo "$version" | grep -Eq "$semver"; then
    echo "$name: version \"$version\" in $f is not semver" >&2
    fail=1
  elif [ -n "$catalog" ]; then
    listed=$(echo "$catalog" | jq -r --arg n "$name" '.data[] | select(.name == $n) | .version')
    if [ "$listed" != "$version" ]; then
      echo "$name: $version is not published in the registry (it lists ${listed:-none})" >&2
      fail=1
    fi
  fi
done

exit "$fail"
