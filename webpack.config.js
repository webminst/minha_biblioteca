const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      return middlewares;
    }
  }
});
