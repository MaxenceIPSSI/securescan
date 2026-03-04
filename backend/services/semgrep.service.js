const { exec } = require("child_process");
 
exports.runSemgrep = (targetPath) => {
  return new Promise((resolve, reject) => {
    exec(
      `semgrep --config=auto --json ${targetPath}`,
      { maxBuffer: 1024 * 5000 },
      (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          return reject(error);
        }
 
        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch (e) {
          reject("Invalid JSON from Semgrep");
        }
      }
    );
  });
};