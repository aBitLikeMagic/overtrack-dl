import * as fs from 'fs-extra';
import * as express from 'express';

import {OvertrackUser, OvertrackGame} from './overtrack-dl';
import {HTML} from './html';



const app = express();

app.use(require('body-parser').urlencoded({extended: true}));

app.get('/', async (request, response) => {
  const parts = [HTML`<!doctype html>
    <link rel="shortcut icon" href="icon.png" type="image/png" />
    <style>
      * { font-family: monospace; }
      img { vertical-align: middle; }

      :target {
        border: 2px solid currentColor;
        border-top-right-radius: 1em;
        border-bottom-right-radius: 1em;
        padding-top: .5em;
        padding-bottom: .5em;
        padding-right: 10em;
        border-left: 0;
      }
      body {
        max-width: 60em;
        margin: auto;
      }
    </style>

    <h1>
      <img src="icon.png" width="48" height="48" />
      <a href="https://github.com/aBitLikeMagic/overtrack-dl">overtrack-dl</a> server
      (<a href="https://glitch.com/edit/#!/overtrack-dl?path=src/server.ts:32">view source</a>)
    </h1>

    <h2>export from <a href="https://overtrack.gg">OverTrack</a></h2>

    <h3>your games</h3>

    <form method="post" action="export-personal" id="export-personal">
      your api.overtrack.gg session key:
      <input name="session" value="${request.query['session'] || ''}">
      <input type="submit" value="export your games">

      <p>
        in chrome, you can do find your session key by navigating to
        <code>chrome://settings/cookies/detail?site=api.overtrack.gg</code>,
        expanding the <code>session</code> cookie listing by pressing ▼, and
        copying the long alphanumeric "content" value.
      </p>
    </form>

    <h3>shared games</h3>

    <form method="post" action="export-shared" id="export-shared">
      overtrack.gg share key:
      <input name="key" value="${request.query['shareKey'] || ''}">
      <input type="submit" value="export their games">
    </form>
    
    <h2>exported</h2>`];
  
  for (const filename of await fs.readdir('games')) {
    if (filename.match(/\.(json|csv)$/)) {
      parts.push(HTML`<p><a href="games/${filename}" id="games/${filename}">${filename}</a></p>`);
    }
  }
  response.send(parts.join(''));
});

app.get('/graph', async (request, response) => {
  const allowedNames = new Set(['Magic', 'Magma', 'Magoo', 'Might', 'Mogul', 'Muggy'].map(s => s.toLowerCase()));
  const games: {[index: string]: OvertrackGame[]} = {};

  for (const filename of await fs.readdir('games')) {
    const match = filename.match(/^([^\-]+)\-.+\.json/);
    if (match && allowedNames.has(match[1])) {
      const name = match[1];
      if (!games[name]) games[name] = [];
      games[name].push(JSON.parse(await fs.readFile('games/' + filename, 'utf8')) as OvertrackGame);
    }
  }

  const names = Object.keys(games).sort();
  const indicies: number[] = [];
  const histories: {[index: string]: number[]} = {};
  
  const maxLength = Math.max(...Object.keys(games).map(k => games[k]).map(v => v.length));
  for (let i = 0; i < maxLength; i++) {
    for (const name of names) {
      if (games[name].length > i) {
        histories[name].push(games[i].meta.end_sr);
      } else {
        // project last valid value
        histories[name].push(histories[name][i - 1] || 0);
      }
    }
    indicies.push(i);
  }
  
  const plotlyData = names.map(name => ({
    name: name,
    x: indicies,
    y: histories[name]
  }));

  response.send(HTML`<!doctype html>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <body id="main">
    <script>
      const data = ` + JSON.stringify(plotlyData) + HTML`

      const layout = {
        title: 'SR History by Account'
      };

      Plotly.newPlot('body', data, layout);
    </script>
    
  `.toString());
});

app.post('/export-personal', async (request, response) => {
  const [games] = await OvertrackUser.getGamesWithData(request.body.session);
  response.redirect(`/?session=${request.body.session}#games/${games[games.length - 1].key()}.json`);
});

app.post('/export-shared', async (request, response) => {
  const [games] = await OvertrackUser.getGamesWithData(undefined, request.body.shareKey);
  response.redirect(`/?shareKey=${request.body.shareKey}#games/${games[games.length - 1].key()}.json`);
});

app.use('/games', express.static('games'));

app.use('/icon.png', express.static('icon.png'));

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
