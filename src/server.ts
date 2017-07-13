import * as fs from 'fs-extra';
import * as express from 'express';

import {OvertrackUser, OvertrackGame} from './overtrack-dl';
import {HTML} from './html';


export const makeServer = () => {
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

      <h2>download from <a href="https://overtrack.gg">OverTrack</a> (not affiliated)</h2>

      <p>
        downloads games from OverTrack to this machine and creates <code>.csv</code> summaries for each player.
      </p>

      <h3>your games</h3>

      <form method="post" action="download-personal" id="download-personal">
        your api.overtrack.gg session key:
        <input name="session" value="${request.query['session'] || ''}">
        <input type="submit" value="download your games">

        <p>
          in chrome, you can do find your session key by navigating to
          <code>chrome://settings/cookies/detail?site=api.overtrack.gg</code>,
          expanding the <code>session</code> cookie listing by pressing ▼, and
          copying the long alphanumeric "content" value.
        </p>

        <p>
          this gives me access to your account. so, maybe run this yourself instead?
        </p>
      </form>

      <h3>shared games</h3>

      <form method="post" action="download-shared" id="download-shared">
        overtrack.gg share key:
        <input name="key" value="${request.query['shareKey'] || ''}">
        <input type="submit" value="download their games">
      </form>

      <h2>downloaded</h2>`];

    for (const filename of await fs.readdir('games')) {
      if (filename.match(/\.(json|csv)$/)) {
        parts.push(HTML`<p><a href="games/${filename}" id="games/${filename}">${filename}</a></p>`);
      }
    }
    response.send(parts.join(''));
  });

  app.post('/download-personal', async (request, response) => {
    const [games] = await OvertrackUser.getGamesWithData(request.body.session);
    response.redirect(`/?session=${request.body.session}#games/${games[games.length - 1].key()}.json`);
  });

  app.post('/download-shared', async (request, response) => {
    const [games] = await OvertrackUser.getGamesWithData(undefined, request.body.shareKey);
    response.redirect(`/?shareKey=${request.body.shareKey}#games/${games[games.length - 1].key()}.json`);
  });

  app.use('/games', express.static('games'));

  app.use('/icon.png', express.static('icon.png'));

  app.get('/graph/magic/5', async (_, response) => {
    const allowedNames = new Set(['Magic', 'Magma', 'Magoo', 'Might', 'Mogul', 'Muggy'].map(s => s.toLowerCase()));
    const games: {[index: string]: number[]} = {};

    for (const filename of await fs.readdir('games')) {
      const match = filename.match(/^([^\-]+)\-[0-9].+\.json/);
      if (match && allowedNames.has(match[1])) {
        const name = match[1];
        if (!games[name]) games[name] = [];
        const data = JSON.parse(await fs.readFile('games/' + filename, 'utf8')) as OvertrackGame;
        if (data.meta.end_sr && data.meta.time > 1499482797 && data.meta.time < 1503707707) {
          games[name].push(data.meta.end_sr);
        }
      }
    }

    // Season 5 games before 2017-07-08T02:59:57.000Z
    games['magic'].unshift(2169,2150,2193,2232,2272,2253,2238,2276,2311,2292,2322,2358,2390,2367,2399,2434,2413,2443,2469,2493,2470,2495,2472,2450);
    games['might'].unshift(2303,2286,2264,2250,2236,2217,2198,2234,2215,2257,2296,2273,2309,2290,2322,2304,2328,2357,2376,2404,2382,2365,2343,2343,2369,2394,2369,2397,2376,2404,2427,2399,2378,2402,2434,2460,2437,2415,2392,2368,2345,2366,2341,2365,2365,2390,2371,2348,2325,2305,2336,2314,2335,2357,2336,2363);
    games['mogul'].unshift(2046,1996,2054,2054,2117,2163,2220,2188,2225,2267,2237,2268,2248,2224,2204,2185,2210,2189,2169,2196,2176,2153,2134,2164,2192,2169,2151,2179,2198,2223,2250,2271,2296,2316,2340,2313,2287,2310,2337,2364,2385,2363,2384,2361,2340,2314,2337,2312,2310,2287,2312,2290,2267,2289,2268,2246,2220,2245,2221,2199,2220,2242,2222,2244,2266,2245,2269,2244,2272,2300,2275,2251,2272,2295,2318,2293,2273,2251,2276,2244,2221,2240,2217,2241,2216,2242,2267,2290,2313,2292,2312,2340,2340,2367,2394,2418,2391,2365,2343,2320,2342,2368,2343,2320,2343,2321,2342,2322,2344,2371);
    games['magoo'].unshift(2546,2623,2681,2636,2697);

    const names = Object.keys(games).sort();
    const indicies: {[index: string]: number[]} = {};
    const histories: {[index: string]: number[]} = {};

    const maxLength = Math.max(...Object.keys(games).map(k => games[k]).map(v => v.length));
    let i;
    for (i = 0; i < maxLength; i++) {
      for (const name of names) {
        if (i === 0) histories[name] = [];
        if (i === 0) indicies[name] = [];

        if (games[name].length > i && games[name][i]) {
          histories[name].push(games[name][i]);
          indicies[name].push(i + 10); // offset indicies for placements
        }
      }
    }
    const plotlyData = names.map(name => {
      const markerSizes = histories[name].map(_ => 6);
      markerSizes[markerSizes.length - 1] = markerSizes[0] = 12;
      return ({
        name: name[0].toUpperCase() + name.slice(1),
        x: indicies[name],
        y: histories[name],
        type: 'scatter',
        mode: 'lines+markers',
        marker: {
          size: markerSizes
        }
      });
    });

    response.send(HTML`<!doctype html>
      <title>Magic's Season 5 in Overwatch</title>
      <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
      <style>html, body { margin: 0; padding: 0; height: 100%; width: 100%; }</style>
      <body id="body">
      <script>
        const data = ` + JSON.stringify(plotlyData) + HTML`

        const layout = {
          title: "Magic's Season 5 in Overwatch",
          xaxis: {
            title: "Games Played"
          },
          yaxis: {
            title: "Skill Rating"
          }
        };

        Plotly.newPlot('body', data, layout);
      </script>

    `.toString());
  });
  
  return app;
};
