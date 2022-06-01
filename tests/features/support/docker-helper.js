const path = require("path");
const child_process = require("child_process");
const debug = require("debug");

const rootDir = path.resolve(__dirname, "../../..");

class DockerHelper {
  static get execTimeout() {
    return 30 * 1000;
  }
  static get waitTimeout() {
    return 3 * 60 * 1000;
  }

  constructor() {
    this.imageName = "tor-with-auth";
    this.containerName = `${this.imageName}-test`;
    this.listenAddr = "127.0.0.1:1080";
    this.logger = {
      exec: debug("docker:exec"),
      stdout: debug("docker:stdout"),
      stderr: debug("docker:stderr"),
      logs: debug("docker:logs"),
      health: debug("docker:health"),
      events: debug("docker:events"),
    };
  }

  exec(
    command,
    timeout,
    onResult = (err, stdout, stderr) => {},
    onData = (data) => {}
  ) {
    this.logger.exec(command);
    const proc = child_process.exec(
      command,
      { cwd: rootDir, maxBuffer: 1 * 1024 * 1024, timeout },
      (err, stdout, stderr) => {
        onResult(err, stdout.trim(), stderr.trim());
      }
    );
    proc.stdout.on("data", (data) => {
      onData(data.toString());
    });
    proc.stderr.on("data", (data) => {
      onData(data.toString());
    });
    return proc;
  }

  stop(callback = () => {}) {
    this.exec(
      `docker stop '${this.containerName}'`,
      DockerHelper.execTimeout,
      () => callback()
    );
  }

  run(callback = (err) => {}) {
    this.exec(
      `docker run -d --rm -p '${this.listenAddr}:1080' -v 'tor-with-auth-data:/var/lib/tor' --name '${this.containerName}' '${this.imageName}'`,
      DockerHelper.execTimeout,
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

  onLogsContains(substring, callback = (err) => {}) {
    let logs = "";
    let proc;
    proc = this.exec(
      `docker logs -f '${this.containerName}'`,
      DockerHelper.waitTimeout,
      (err) => {
        if (err) {
          callback(err);
        }
      },
      (data) => {
        this.logger.logs(data.trim());
        logs += data;
        if (logs.includes(substring)) {
          if (proc) {
            proc.kill();
          }
          callback();
        }
      }
    );
  }

  inspectHealthState(callback = (err, res) => {}) {
    this.exec(
      `docker inspect -f '{{json .State.Health}}' '${this.containerName}'`,
      DockerHelper.execTimeout,
      (err, data) => {
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
      }
    );
  }

  onEventHealthStatusChange(callback = (err) => {}) {
    let proc;
    proc = this.exec(
      `docker events --filter 'container=${this.containerName}' --filter 'event=health_status'`,
      DockerHelper.waitTimeout,
      (err) => {
        if (err) {
          callback(err);
        }
      },
      (data) => {
        this.logger.events(data.trim());
        if (proc) {
          proc.kill();
        }
        callback();
      }
    );
  }
}

module.exports = {
  DockerHelper,
};
