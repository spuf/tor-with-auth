build-image:
	docker build --no-cache -t tor-with-auth .

install-deps: install-goss install-modules

test-image: test-internal test-external

install-goss:
	docker build --no-cache -t goss-in-docker -f tests/goss/Dockerfile tests/goss

test-internal:
	docker run --rm \
		-v /var/run/docker.sock:/var/run/docker.sock \
		-v ${PWD}/tests/goss:/goss:ro \
		-e GOSS_FILES_PATH=/goss \
		goss-in-docker

install-modules:
	npm i

test-external:
	npx cucumber-js tests/features
