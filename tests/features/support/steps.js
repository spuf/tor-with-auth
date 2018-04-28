const { defineStep } = require('cucumber');
const assert = require('assert');
const child_process = require('child_process');
const path = require('path');
const { shell, containerName, streamLogs } = require('./lib');

const rootDir = path.resolve(__dirname, '../../..');

defineStep('wait {string} in logs', function(str, callback) {
  this.dockerLogsContain(str, () => {
    callback();
  });
});

defineStep('run container', function(callback) {
  this.dockerRun(callback);
});
