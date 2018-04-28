const child_process = require('child_process');
const path = require('path');
const debug = require('debug');

const rootDir = path.resolve(__dirname, '../../..');

const imageName = 'tor-with-auth';
const containerName = 'tor-with-auth-test';
const listenAddr = '127.0.0.1:1088';

const logExec = debug('exec');
const logStdout = debug('stdout');
const logStderr = debug('stderr');

const exec = (command, callback = () => {}) => {
  logExec(command);
  return child_process.exec(command, { cwd: rootDir }, (error, stdout, stderr) => {
    logStdout(stdout);
    logStderr(stderr);
    callback(error);
  });
};

let logProc;
const stopLogs = () => {
  if (logProc) {
    logProc.kill();
    logProc = null;
  }
};
const logLogs = debug('logs');
const streamLogs = (command, callback = data => {}) => {
  stopLogs();
  logExec(command);
  logProc = child_process.exec(command, { cwd: rootDir });
  logProc.stdout.on('data', data => {
    const str = data.toString();
    logLogs(str);
    callback(str);
  });
  logProc.stderr.on('data', data => {
    const str = data.toString();
    logLogs(str);
    callback(str);
  });
};

module.exports = {
  imageName,
  containerName,
  listenAddr,
  exec,
  streamLogs,
  stopLogs
};
