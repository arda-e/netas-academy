require('esbuild-register/dist/node').register({
  target: `node${process.version.slice(1)}`,
});

const server = require('./strapi-server.ts');

module.exports = server.default || server;
