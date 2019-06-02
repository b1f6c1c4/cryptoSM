/* eslint-disable no-console */

const Bundler = require('parcel-bundler');
const shell = require('shelljs');

process.env.NODE_ENV = 'production';

async function makeBundle() {
  const bundler = new Bundler([
    'index.html',
  ]);

  await bundler.bundle();
  // const html = shell.cat('art/html_code.html').replace(/\n/g, '');
  // shell.sed('-i', /<title>/, `${html}<title>`, 'dist/*.html');
  shell.sed('-i', /Workaround/, '', 'dist/*.html');
  // shell.cp('art/*', 'dist/');
  shell.cp('-r', 'bin/', 'dist/');
  shell
    .echo('https://crypto-sm.netlify.com/* https://sm.b1f6c1c4.info/:splat 301!')
    .to('dist/_redirects');
}

makeBundle();
