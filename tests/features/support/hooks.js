const { AfterAll, Before } = require('cucumber');
const { exec, containerName, stopLogs } = require('./lib');

Before(function(opts, callback) {
  exec(`docker stop ${containerName}`, () => {
    callback();
  });
});

AfterAll(function(callback) {
  stopLogs();
  exec(`docker stop ${containerName}`, () => {
    callback();
  });
});
