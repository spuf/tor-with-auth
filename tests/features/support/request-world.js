const path = require('path');
const child_process = require('child_process');
const debug = require('debug');
const { setWorldConstructor } = require('cucumber');

const logExec = debug('request:exec');
const logStdout = debug('request:stdout');
const logStderr = debug('request:stderr');
function exec(command, callback = (err, stdout, stderr)) {
  logExec(command);
  child_process.exec(command, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (stdout) {
      logStdout(stdout);
    }
    if (stderr) {
      logStderr(stderr.trim());
    }
    callback(err, stdout, stderr);
  });
}

class RequestWorld {
  constructor() {
    this.isUseProxy = false;
    this.proxyAuth = null;
    this.response = null;
    this.responseError = null;
  }

  sendRequest(url, callback = err => {}) {
    const args = ['-fsSL'];
    if (this.isUseProxy) {
      const auth = this.proxyAuth ? `${this.proxyAuth}@` : '';
      args.push(`-x 'socks5h://${auth}127.0.0.1:1080'`);
    }
    const command = `curl ${args.join(' ')} '${url}'`;
    exec(command, (err, stdout, stderr) => {
      this.response = stdout;
      this.responseError = err;
      callback();
    });
  }
}

setWorldConstructor(RequestWorld);
