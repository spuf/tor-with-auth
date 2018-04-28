const assert = require('assert');
const { setDefaultTimeout, defineStep, AfterAll } = require('cucumber');
const { DockerHelper } = require('./docker-helper');

setDefaultTimeout(3 * 60 * 1000);

const docker = new DockerHelper();
let containerRunning = false;

defineStep('container is running', function(callback) {
  docker.stop(() => {
    containerRunning = false;
    docker.run(err => {
      containerRunning = true;
      callback(err);
    });
  });
});

defineStep('container logs has {string}', function(substring, callback) {
  assert.ok(containerRunning, 'Container is not running');
  docker.onLogsContains(substring, err => callback(err));
});

defineStep('container health status is changed', function(callback) {
  assert.ok(containerRunning, 'Container is not running');
  docker.onEventHealthStatusChange(err => callback(err));
});

defineStep('container health status is {string}', function(status, callback) {
  assert.ok(containerRunning, 'Container is not running');
  docker.inspectHealthState((err, res) => {
    try {
      if (err) {
        throw err;
      }
      assert.strictEqual(res.Status, status);
      callback();
    } catch (err) {
      callback(err);
    }
  });
});

defineStep('container health failing streak is {int}', function(count, callback) {
  assert.ok(containerRunning, 'Container is not running');
  docker.inspectHealthState((err, res) => {
    try {
      if (err) {
        throw err;
      }
      assert.strictEqual(res.FailingStreak, count);
      callback();
    } catch (err) {
      callback(err);
    }
  });
});

AfterAll(function(callback) {
  docker.stop(() => {
    containerRunning = false;
    callback();
  });
});
