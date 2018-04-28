build-image:
	docker build --no-cache -t tor-with-auth .

install-deps: install-goss install-modules

test-image: test-internal test-external

install-goss:
	true

test-internal:
	true

install-modules:
	npm i

test-external:
	npx cucumber-js tests/features
