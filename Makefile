.PHONY: dist deps \
	lint lint-md lint-ts \
	lint-fix lint-fix-md lint-fix-ts

dist:
	npm run build

deps:
	npm install

lint: lint-md lint-ts
lint-fix: lint-fix-md lint-fix-ts

lint-md:
	npx remark . .github

lint-fix-md:
	npx remark . .github -o

lint-ts:
	npx eslint .

lint-fix-ts:
	npx eslint --fix .
