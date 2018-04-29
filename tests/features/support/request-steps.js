const assert = require('assert');
const util = require('util');
const { defineStep, Before } = require('cucumber');
const { RequestHelper } = require('./request-helper');

const request = new RequestHelper();

Before(function() {
  request.reset();
});

defineStep('I send request to {string}', function(url, callback) {
  request.send(url, err => callback(err));
});

defineStep('request is successful', function() {
  assert.ifError(request.getResponseError());
  const body = request.getResponseBody();
  assert.ok(typeof body === 'string', 'Response should be string type.');
  assert.ok(body.length > 0, 'Response should be not empty string.');
});

defineStep('request is failed', function() {
  assert.ok(util.types.isNativeError(request.getResponseError()), 'Request should return error.');
});

defineStep('response contains {string}', function(substring) {
  const body = request.getResponseBody();
  assert.ok(typeof body === 'string', 'Response should be string type.');
  assert.ok(body.length > 0, 'Response should be not empty string.');
  assert.ok(body.includes(substring), 'Response does not contains.');
});

defineStep('proxy is used', function() {
  request.setUseProxy(true);
});

defineStep('proxy auth is {string}', function(auth) {
  request.setProxyAuth(auth);
});
