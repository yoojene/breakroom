var fs = require('fs');

module.exports = function (ctx) {
  // Android Platform 7+
  // fs.copyFileSync('config/build-extras.gradle', 'platforms/android/app/build-extras.gradle');
  // Android platform ^6
  fs.copyFileSync('config/build-extras.gradle', 'platforms/android/build-extras.gradle');
}