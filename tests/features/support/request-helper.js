const child_process = require('child_process');
const debug = require('debug');

class RequestHelper {
  static get sendTimeout() {
    return 30 * 1000;
  }

  constructor() {
    this.proxyAddr = '127.0.0.1:1080';
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
    child_process.exec(
      command,
      { maxBuffer: 1 * 1024 * 1024, timeout: RequestHelper.sendTimeout },
      (err, stdout, stderr) => {
        if (stdout) {
          this.logger.stdout(stdout);
        }
        if (stderr) {
          this.logger.stderr(stderr.trim());
        }
        callback(err, stdout, stderr);
      }
    );
  }

  send(url, callback = () => {}) {
    const cmd = ['curl', '-fsSL', '-m', Math.floor(RequestHelper.sendTimeout / 1000).toString()];
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
