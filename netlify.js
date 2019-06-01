/* eslint-disable no-console */
const NetlifyAPI = require('netlify');
const path = require('path');

const run = async (draft = false) => {
  const client = new NetlifyAPI(process.env.NETLIFYKEY);
  await client.deploy(
    '', // TODO
    path.join(__dirname, './dist'),
    {
      draft,
      filter: (f) => {
        console.log(f);
        return true;
      },
    },
  );
  console.log('Success');
};

if (process.env.NETLIFYKEY) {
  console.log('Start deploying to Netlify...');
  run(process.argv.includes('--draft'));
} else {
  console.log('Ignore deploying to Netlify');
}
