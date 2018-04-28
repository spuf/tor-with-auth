const { setWorldConstructor, setDefaultTimeout } = require('cucumber');
const { exec, containerName, imageName, listenAddr, streamLogs } = require('./lib');

class World {
  constructor({ attach, parameters }) {
    this.logs = '';
    this.logsCallback = null;
  }

  dockerRun(callback) {
    exec(`docker run -d --rm -p ${listenAddr}:1088 --name ${containerName} ${imageName}`, err => {
      if (err) {
        return callback(err);
      }

      streamLogs(`docker logs -f ${containerName}`, data => {
        this.logs += data;
        this.dockerLogsCheck();
      });
      callback();
    });
  }

  dockerStop(callback) {
    this.logsProcess.kill();
    exec(`docker stop ${containerName}`, () => {
      callback();
    });
  }

  dockerLogsContain(str, callback) {
    this.logsCallback = () => {
      if (this.logs.includes(str)) {
        callback();
        return true;
      } else {
        return false;
      }
    };
    this.dockerLogsCheck();
  }

  dockerLogsCheck() {
    if (this.logsCallback && this.logsCallback()) {
      this.logsCallback = null;
    }
  }
}

setDefaultTimeout(2 * 60 * 1000);
setWorldConstructor(World);
