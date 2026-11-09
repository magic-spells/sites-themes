#!/bin/sh
# Builds <name>-v<version>.zip in the current directory from the committed
# <name>/ folder at <ref> (default HEAD) and prints its file name. The release
# workflow builds with this script, so a zip built here at a tag is
# byte-identical to that tag's release asset. Usage: sh scripts/zip.sh <name> [<ref>]
set -eu
name=$1
ref=${2:-HEAD}
repo=$(dirname "$0")/..
# Tags from before settings/ existed keep theme.json at the folder root.
version=$({ git -C "$repo" show "$ref:$name/settings/theme.json" 2>/dev/null ||
  git -C "$repo" show "$ref:$name/theme.json"; } | jq -er .version)
file=$name-v$version.zip
# git archive takes exactly the committed tree, so nothing a local install or
# build left behind can reach the zip. <ref>:<name> is the folder's own tree, so
# settings/ and data/ land at the zip root. A tree has no date of its own:
# --mtime pins the commit's, and zip entry times are local time, so TZ=UTC too;
# then the same commit always gives the same bytes and the same hash.
TZ=UTC git -C "$repo" archive --format=zip --mtime="$(git -C "$repo" log -1 --format=%cI "$ref")" \
  -o "$PWD/$file" "$ref:$name"
echo "$file"
