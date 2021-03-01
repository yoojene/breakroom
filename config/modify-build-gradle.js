var fs = require('fs');

module.exports = function (ctx) {
  var fileContents = fs.readFileSync('platforms/android/build.gradle', 'utf8');

  var newContents = fileContents.replace(/jcenter\(\)\n\s*maven \{(.|[\n\s])*?\}/g, "google()\n    maven { url 'https://dl.bintray.com/android/android-tools' }\n    jcenter()\n");
  newContents = newContents.replace('com.android.tools.build:gradle:3.0.0', 'com.android.tools.build:gradle:3.1.4');
  newContents = newContents.replace("gradleVersion = '4.1.0'", "gradleVersion = '4.6.0'"); 

  fs.writeFileSync('platforms/android/build.gradle', newContents);
  
  // Modify CordovaLib gradle dependency to match https://github.com/apache/cordova-android/commit/026dce563b37b781f2ce299c643b3281fc961065#diff-626d8c89030b6d949921ffb8478ea2a4

  var bgContents = fs.readFileSync('platforms/android/CordovaLib/build.gradle', 'utf8');

  var newBgContents = bgContents.replace('com.android.tools.build:gradle:2.2.3', "com.android.tools.build:gradle:3.1.4")
  fs.writeFileSync('platforms/android/CordovaLib/build.gradle', newBgContents);
}