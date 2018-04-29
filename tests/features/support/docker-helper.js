const debug = require('debug');
const { exec } = require('./lib');

class DockerHelper {
  constructor(listenAddr = '127.0.0.1:1080') {
    this.imageName = process.env.npm_package_config_image;
    this.containerName = `${this.imageName}-test`;
    this.listenAddr = listenAddr;
    this.logger = {
      exec: debug('docker:exec'),
      stdout: debug('docker:stdout'),
      stderr: debug('docker:stderr'),
      logs: debug('docker:logs'),
      health: debug('docker:health'),
      events: debug('docker:events')
    };
  }

  exec(command, onResult = (err, stdout, stderr) => {}, onData = data => {}) {
    this.logger.exec(command);
    const process = exec(command, (err, stdout, stderr) => {
      onResult(err, stdout.trim(), stderr.trim());
    });
    process.stdout.on('data', data => {
      onData(data.toString());
    });
    process.stderr.on('data', data => {
      onData(data.toString());
    });
    return process;
  }

  stop(callback = () => {}) {
    this.exec(`docker stop '${this.containerName}'`, () => callback());
  }

  run(callback = err => {}) {
    this.exec(
      `docker run -d --rm -p '${this.listenAddr}:1080' --name '${this.containerName}' '${
        this.imageName
      }'`,
      (err, stdout, stderr) => {
        if (stderr) {
          this.logger.stderr(stderr);
        }
        if (stdout) {
          this.logger.stdout(stdout);
        }
        if (err) {
          callback(err);
          return;
        }
        callback();
      }
    );
  }

  onLogsContains(substring, callback = err => {}) {
    let logs = '';
    const process = this.exec(
      `docker logs -f '${this.containerName}'`,
      err => {
        if (err) {
          callback(err);
        }
      },
      data => {
        this.logger.logs(data.trim());
        logs += data;
        if (logs.includes(substring)) {
          process.kill();
          callback();
        }
      }
    );
  }

  inspectHealthState(callback = (err, res) => {}) {
    this.exec(`docker inspect -f '{{json .State.Health}}' '${this.containerName}'`, (err, data) => {
      try {
        if (err) {
          throw err;
        }
        this.logger.health(data);
        const res = JSON.parse(data);
        callback(null, res);
      } catch (err) {
        callback(err);
      }
    });
  }

  onEventHealthStatusChange(callback = err => {}) {
    const process = this.exec(
      `docker events --filter 'container=${this.containerName}' --filter 'event=health_status'`,
      err => {
        if (err) {
          callback(err);
        }
      },
      data => {
        this.logger.events(data.trim());
        process.kill();
        callback();
      }
    );
  }
}

module.exports = {
  DockerHelper
};
