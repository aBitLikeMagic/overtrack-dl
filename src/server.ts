import * as fse from 'fs-extra';
import * as express from 'express';

import {OvertrackUser} from './models';
import {HTML} from './html';
import {serveGraph} from './graph';


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
        <a href="https://glitch.com/~overtrack-dl">~overtrack-dl</a> server
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
          <span style="color: red;">this gives me access to your account</span>, so maybe run this yourself instead?
          you can launch and modify your own instance of this app online for free by simply clicking the "remix" 
          button at <a href="https://glitch.com/~overtrack-dl">https://glitch.com/~overtrack-dl</a>, or download
          <a href="https://github.com/aBitLikeMagic/overtrack-dl/tree/glitch">the source code</a> and run it yourself.
        </p>
      </form>

      <h3>shared games</h3>

      <form method="post" action="download-shared" id="download-shared">
        overtrack.gg share key:
        <input name="shareKey" value="${request.query['shareKey'] || ''}">
        <input type="submit" value="download their games">
      </form>

      <h2>downloaded</h2>`];

    let count = 0;
    let games: any[] = [];
    try {
      games = await fse.readdir('games');
    } catch (error) {
      console.error(error);
    }
    for (const filename of games) {
      if (filename.match(/\.(json|csv)$/)) {
        parts.push(HTML`<p><a href="games/${filename}" id="games/${filename}">${filename}</a></p>`);
        count += 1;
        if (count > 255) {
          parts.push(HTML`<p>...</p>`);
          break;
        }
      }
    }
    response.send(parts.join(''));
  });

  app.post('/download-personal', async (request, response) => {
    try {
      await OvertrackUser.getGamesWithData(request.body.session);
      response.redirect(`/?session=${request.body.session}`);
    } catch (error) {
      console.error(error);
      response.status(500);
      response.header('Content-Type', 'text/plain');
      response.send(String(error.stack));
    }
  });

  app.post('/download-shared', async (request, response) => {
    try {
      await OvertrackUser.getGamesWithData(undefined, request.body.shareKey);
      response.redirect(`/?shareKey=${request.body.shareKey}`);
    } catch (error) {
      console.error(error);
      response.status(500);
      response.header('Content-Type', 'text/plain');
      response.send(String(error.stack));
    }
  });

  app.use('/games', express.static('games'));

  app.use('/icon.png', express.static('icon.png'));

  app.get('/graph/:name/5', serveGraph);
  
  return app;
};
