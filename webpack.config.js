   // webpack.config.js
   const path = require('path');

   module.exports = {
     externals: {
      'ol': 'ol' // 告知Webpack，'ol'应该被视为外部依赖
     },
     entry: './src/index.js', // 你的主入口文件
     output: {
       filename: 'elaneOlMap.js', // 打包后的文件名
       path: path.resolve(__dirname, 'dist'), // 输出目录
       library: 'elaneOlMap',
       libraryTarget: 'umd'
     },
     module: {
       rules: [
         {
           test: /\.js$/,
           exclude: /node_modules/,
           use: {
             loader: 'babel-loader',
             options: {
               presets: ['@babel/preset-env'],
             },
           },
         },
         {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
         },
       ],
     },
   };