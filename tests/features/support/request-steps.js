const assert = require('assert');
const util = require('util');
const { defineStep } = require('cucumber');

let containerRunning = false;

defineStep('I send request to {string}', function(url, callback) {
  this.sendRequest(url, err => callback(err));
});

defineStep('request is successful', function() {
  assert.ifError(this.responseError);
  assert.ok(typeof this.response === 'string', 'Response should be string type.');
  assert.ok(this.response.length > 0, 'Response should be not empty string.');
});

defineStep('request is failed', function() {
  assert.ok(util.types.isNativeError(this.responseError), 'Request should return error.');
});

defineStep('response contains {string}', function(substring) {
  assert.ok(typeof this.response === 'string', 'Response should be string type.');
  assert.ok(this.response.length > 0, 'Response should be not empty string.');
  assert.ok(this.response.includes(substring), 'Response does not contains.');
});

defineStep('proxy is used', function() {
  this.isUseProxy = true;
});

defineStep('proxy auth is {string}', function(auth) {
  this.proxyAuth = auth;
});
