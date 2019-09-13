const fs = require("fs")
const cheerio = require('cheerio')
const keywords = require('./keywords.json');

const reponame = process.argv[2]
const providername = reponame.split('-')[2]
console.log('read', providername);
fs.readFile(`./${reponame}/website/${providername}.erb`, 'utf8', function (error, data) {
  if (error) {
    console.log('error', error);
    process.exit(1);
  }

  const $ = cheerio.load(data)
  const links = $('div').find('a')
  for (let i = 0; i < links.length; i++) {
    const href = links[i].attribs.href
    const text = links[i].children[0].data

    if (href && typeof href === 'string') {
      if (href.startsWith(`/docs/providers/${providername}/d`) || href.startsWith(`/docs/providers/${providername}/r`) ) {
        // console.log(text, href);
        keywords[text] = href
      }
    }
  }

  fs.writeFile('./keywords.json', JSON.stringify(keywords, '', '  '), function (error) {
    if (error) {
      console.log('error write keywords.json file', error);
    }
  });
});
