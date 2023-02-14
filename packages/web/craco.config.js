const fs = require("fs");
const path = require("path");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = {
  babel: {
    presets: ["@babel/preset-react"],
  },
  plugins: [
    {
      plugin: require("craco-babel-loader"),
      options: {
        includes: [resolveApp("../common")],
        includes: [resolveApp("../app")],
      },
    },
  ],
};
