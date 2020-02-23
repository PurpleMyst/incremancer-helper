userscript.js: userscript_header.js userscript_code.js
	cat $^ > $@

.INTERMEDIATE: userscript_code.js
userscript_code.js: userscript.ts tsconfig.json
	tsc --out $@

.INTERMEDIATE: userscript_header.js
userscript_header.js: header.json
	printf '// ==UserScript==\n' > $@
	jq -r '. as $$in | keys | map("// @" + tostring +  " " + ($$in[.] | tostring)) | join("\n") ' < $< >> $@
	printf '// ==/UserScript==\n' >> $@

tsconfig.json:
	printf '{ "compilerOptions": { "target": "es6", "strict": true }, "files": [ "userscript.ts" ] }' > $@
