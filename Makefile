build:
	docker build --no-cache -t tor-with-auth .
test-external:
	DEBUG=* node_modules/.bin/cucumber-js --format progress-bar tests/features
