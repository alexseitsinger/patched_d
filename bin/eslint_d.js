#!/usr/bin/env node
'use strict';

function start() {
  require('../lib/launcher').launch();
}

const cmd = process.argv[2];
if (cmd === 'start') {

  start();

} else if (cmd === '-v' || cmd === '--version') {

  console.log('v%s (eslint_d v%s)',
    require('eslint/package.json').version,
    require('../package.json').version);

} else if (cmd === '-h' || cmd === '--help') {

  const options = require('../lib/options');
  console.log(options.generateHelp());

} else {

  const client = require('../lib/client');
  if (cmd === 'restart') {
    client.stop(() => {
      process.nextTick(start);
    });
  } else {
    const commands = ['stop', 'status', 'restart'];
    if (commands.indexOf(cmd) === -1) {
      const useStdIn = (process.argv.indexOf('--stdin') > -1);
      const args = process.argv.slice(2);

      // If color is not supported, pass the `--no-color` switch to eslint. We
      // enforce color support in the daemon with `FORCE_COLOR=1` (see
      // `launcher.js`).
      if (!require('supports-color').stdout) {
        args.unshift('--no-color');
      }

      if (useStdIn) {
        let text = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => {
          text += chunk;
        });
        process.stdin.on('end', () => {
          client.lint(args, text);
        });
      } else {
        client.lint(args);
      }
    } else {
      client[cmd](process.argv.slice(3));
    }
  }

}
