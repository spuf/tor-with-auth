const path = require('path');
const debug = require('debug');
const { exec } = require('./lib');

class RequestHelper {
  constructor(proxyAddr = '127.0.0.1:1080') {
    this.proxyAddr = proxyAddr;
    this.logger = {
      exec: debug('request:exec'),
      stdout: debug('request:stdout'),
      stderr: debug('request:stderr')
    };
    this.reset();
  }

  reset() {
    this.useProxy = false;
    this.proxyAuth = null;
    this.responseBody = null;
    this.responseError = null;
  }

  exec(command, callback = (err, stdout, stderr) => {}) {
    this.logger.exec(command);
    exec(command, (err, stdout, stderr) => {
      if (stdout) {
        this.logger.stdout(stdout);
      }
      if (stderr) {
        this.logger.stderr(stderr.trim());
      }
      callback(err, stdout, stderr);
    });
  }

  send(url, callback = () => {}) {
    const cmd = ['curl', '-fsSL'];
    if (this.useProxy) {
      cmd.push('-x');
      const proxyUri = ['socks5h://'];
      if (this.proxyAuth) {
        proxyUri.push(this.proxyAuth);
        proxyUri.push('@');
      }
      proxyUri.push(this.proxyAddr);
      cmd.push(`'${proxyUri.join('')}'`);
    }
    cmd.push(`'${url}'`);
    this.exec(cmd.join(' '), (err, stdout, stderr) => {
      this.responseBody = stdout;
      this.responseError = err;
      callback();
    });
  }

  setUseProxy(use) {
    this.useProxy = use;
  }

  setProxyAuth(auth) {
    this.proxyAuth = auth;
  }

  getResponseBody() {
    return this.responseBody;
  }

  getResponseError() {
    return this.responseError;
  }
}

module.exports = {
  RequestHelper
};
