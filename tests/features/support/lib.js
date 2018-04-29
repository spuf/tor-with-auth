const path = require('path');
const child_process = require('child_process');

const rootDir = path.resolve(__dirname, '../../..');

function exec(command, callback = (err, stdout, stderr) => {}) {
  return child_process.exec(command, { cwd: rootDir, maxBuffer: 10 * 1024 * 1024 }, callback);
}

module.exports = {
  exec
};
