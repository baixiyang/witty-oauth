const path = require('path');

module.exports = {
  entry: './src/index.mts',
  target: ['node', 'es2020'],
  module: {
    rules: [
      {
        test: /\.m?ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      { test: /\.pem$/, use: 'raw-loader' }
    ],
  },

  resolve: {
    extensions: ['.ts', '.js', '.mjs', '.mts'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
      '.mjs': ['.mts', '.mjs'],
    },
  },
  mode: "production",
  experiments: {
    outputModule: true
  },
  output: {
    filename: 'bundle.mjs',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'module',
  },
};
