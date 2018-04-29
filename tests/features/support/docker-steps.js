const assert = require('assert');
const { defineStep, After } = require('cucumber');
const { DockerHelper } = require('./docker-helper');

const docker = new DockerHelper();
let containerRunning = false;

defineStep('container is running', { timeout: DockerHelper.execTimeout }, function(callback) {
  docker.stop(() => {
    containerRunning = false;
    docker.run(err => {
      containerRunning = true;
      callback(err);
    });
  });
});

defineStep('container logs has {string}', { timeout: DockerHelper.waitTimeout }, function(
  substring,
  callback
) {
  assert.ok(containerRunning, 'Container is not running');
  docker.onLogsContains(substring, err => callback(err));
});

defineStep('container health status is changed', { timeout: DockerHelper.waitTimeout }, function(
  callback
) {
  assert.ok(containerRunning, 'Container is not running');
  docker.onEventHealthStatusChange(err => callback(err));
});

defineStep('container health status is {string}', { timeout: DockerHelper.execTimeout }, function(
  status,
  callback
) {
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

defineStep(
  'container health failing streak is {int}',
  { timeout: DockerHelper.execTimeout },
  function(count, callback) {
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
  }
);

After({ timeout: DockerHelper.execTimeout }, function(_, callback) {
  docker.stop(() => {
    containerRunning = false;
    callback();
  });
});
