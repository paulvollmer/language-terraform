const request = require('request');
const fs = require('fs');

let repos = []

function fetchGithubAPI(page, cb) {
  const options = {
    url:  `https://api.github.com/orgs/terraform-providers/repos?page=${page}&per_page=100`,
    headers: {
      'User-Agent': 'atom language-terraform script'
    }
  }
  request(options, function (error, response, body) {
    if (error) {
      console.error('error:', error);
      process.exit(0);
    }
    if (response) {
      if (response.statusCode !== 200) {
        console.log('error fetching the github api');
        process.exit(0);
      }
      const data = JSON.parse(body);
      for (let i = 0; i < data.length; i++) {
        repos.push(data[i].name)
      }
      cb()
    }
  });
}

// becasue we can only fetch 100 repos at one api call and terrafor has more than 100 repos, we need to call the api two times.
// i was to lazy to check the total size and make it dynamic. because of this we do it manually.
fetchGithubAPI(1, function() {
  fetchGithubAPI(2, function() {

    // generate a shell script that do a git clone for each repo git url
    let shellScript = ['# GENERATED SHELL SCRIPT; DO NOT EDIT', `# TOTAL REPOS: ${repos.length}`, '']
    for (let i = 0; i < repos.length; i++) {
      shellScript.push(`rm -rf ${repos[i]} && git clone git://github.com/terraform-providers/${repos[i]}.git --depth 1 && node parse.js ${repos[i]} && sleep 5`)
    }
    fs.writeFileSync('./gitclone_process.sh', shellScript.join('\n'));
  })
})
