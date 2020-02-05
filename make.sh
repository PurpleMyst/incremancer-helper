#!/usr/bin/env bash

set -euo pipefail

trap "rm -f /tmp/userscript.js" EXIT
tsc --out /tmp/userscript.js

{
    printf '// ==UserScript==\n'
    jq -r '
        . as $in
        | keys
        | map("// @" + tostring +  " " + ($in[.] | tostring))
        | join("\n")
    ' < header.json
    printf '// ==/UserScript==\n'

    cat /tmp/userscript.js
} | xclip -sel c
