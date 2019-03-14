const path = require('path');

module.exports = {
  entry: {
    background: './src/background/background.js',
    content: './src/content/content.js'
  },
  output: {
    filename: '[name]/[name].js',
    path: path.resolve(__dirname, 'extension/src')
  },
  mode: 'development',
  devtool: 'cheap-module-source-map'
};
