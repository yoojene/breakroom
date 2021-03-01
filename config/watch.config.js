var watch = require('@ionic/app-scripts/dist/watch');
var copy = require('@ionic/app-scripts/dist/copy');
var copyConfig = require('./copy.config');

// this is a custom dictionary to make it easy to extend/override
// provide a name for an entry, it can be anything such as 'srcFiles' or 'copyConfig'
// then provide an object with the paths, options, and callback fields populated per the Chokidar docs
// https://www.npmjs.com/package/chokidar

module.exports = {
  srcFiles: {
    paths: [
      '{{SRC}}/**/*.(ts|html|s(c|a)ss)',
      '{{ROOT}}/node_modules/@pharma/newton-hybrid-stencil/dist/**/*.(ts|js|html|s(c)ss)',
      '{{ROOT}}/node_modules/@pharma/newton-component-utils/**/*.(ts|js|html|s(c)ss)',
      '{{ROOT}}/node_modules/@pharma/newton-js-bindings-ng/**/*.(ts|js|html|s(c)ss)',
      '{{ROOT}}/node_modules/@pharma/newton-js-sdk/**/*.(ts|js|html|s(c)ss)',
    ],
    options: {
      ignored: [
        '{{SRC}}/**/*.spec.ts',
        '{{SRC}}/**/*.e2e.ts',
        '**/*.DS_Store',
        '{{SRC}}/index.html',,
        '{{ROOT}}/node_modules/@pharma/newton-hybrid-stencil/dist/**/*.spec.ts',
        '{{ROOT}}/node_modules/@pharma/newton-hybrid-stencil/dist/**/*.e2e.ts'
      ],
    },
    callback: watch.buildUpdate,
  },
  copyConfig: copy.copyConfigToWatchConfig(),
};
