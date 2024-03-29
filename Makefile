compile:
	tsc -p tsconfig.build.json
	ncc build index.js --license licenses.txt