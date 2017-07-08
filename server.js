const fs = require('fs-extra');
const he = require('he');
const express = require('express');


const odl = require('./overtrack-dl');



const app = express();

app.use(require('body-parser').urlencoded({extended: true}));

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

app.get('/', async (request, response) => {
  const lines = [`<!doctype html>
    <style>
      * { font-family: monospace; }
      img { vertical-align: middle; height: 48px; }
      a:target {
        border: 2px solid currentColor;
        border-top-right-radius: 1em;
        border-bottom-right-radius: 1em;
        padding: .5em;
        padding-right: 10em;
        border-left: 0;
        padding-left: 0;
      }
    </style>

    <h1>
      <img src="icon.png">
      <a href="https://github.com/aBitLikeMagic/overtrack-dl">overtrack-dl</a> server
      (<a href="https://glitch.com/edit/#!/overtrack-dl?path=server.js">view source</a>)
    </h1>

    <p>this is mostly just for testing/providing examples of what the data looks like</p>

    <h2>Download to server</h2>
    <form method=post>
      overtrack.gg session id:
      <input name=session value="${he.escape(request.query['session'] || '')}">
      <input type=submit>
    
    <h2>Downloaded</h2>`];
  
  for (const filename of await fs.readdir('games')) {
    if (filename.match(/\.json$/)) {
      const en = he.escape(filename);
      lines.push(`<p><a href="games/${en}" id="games/${en}">${en}</a></p>`);
    }
  }
  response.send(lines.join('\n'));
});

app.post('/', async (request, response) => {
  const games = await odl.getGames(request.body.session);
  response.redirect(`/#games/${games[games.length - 1].name}.json`);
})

app.use('/games', express.static('games'));

app.use('/icon.png', express.static('icon.png'));

