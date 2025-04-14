const path = require('path');

module.exports = function() {
  return {
    allowedHosts: 'all', // This will accept all host connections
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    historyApiFallback: true,
    hot: true,
    compress: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        pathRewrite: { '^/api': '' },
        changeOrigin: true,
      },
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  };
};