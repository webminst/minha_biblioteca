const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Arquivos JavaScript
        exclude: /node_modules/, // Exclui a pasta node_modules
        use: {
          loader: 'babel-loader', // Usa o babel-loader
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i, // Arquivos de imagem
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
};
