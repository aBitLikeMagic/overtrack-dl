"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const he = require("he");
const express = require("express");
const overtrack_dl_1 = require("./overtrack-dl");
const app = express();
app.use(require('body-parser').urlencoded({ extended: true }));
app.get('/', (request, response) => __awaiter(this, void 0, void 0, function* () {
    const parts = [`<!doctype html>
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
      (<a href="https://glitch.com/edit/#!/overtrack-dl?path=src/server.ts:32:88">view source</a>)
    </h1>

    <h2>export from overtrack</h2>

    <h3>your games</h3>

    <form method="post" action="export-personal" id="export-personal">
      your api.overtrack.gg session key:
      <input name="session" value="${he.escape(request.query['session'] || '')}">
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
      <input name="key" value="${he.escape(request.query['shareKey'] || '')}">
      <input type="submit" value="export their games">
    </form>
    
    <h2>exported</h2>`];
    for (const filename of yield fs.readdir('games')) {
        if (filename.match(/\.(json|csv)$/)) {
            const en = he.escape(filename);
            parts.push(`<p><a href="games/${en}" id="games/${en}">${en}</a></p>`);
        }
    }
    response.send(parts.join(''));
}));
app.post('/export-personal', (request, response) => __awaiter(this, void 0, void 0, function* () {
    const [games] = yield overtrack_dl_1.OvertrackUser.getGamesWithData(request.body.session);
    response.redirect(`/?session=${request.body.session}#games/${games[games.length - 1].key()}.json`);
}));
app.post('/export-shared', (request, response) => __awaiter(this, void 0, void 0, function* () {
    const [games] = yield overtrack_dl_1.OvertrackUser.getGamesWithData(undefined, request.body.shareKey);
    response.redirect(`/?shareKey=${request.body.shareKey}#games/${games[games.length - 1].key()}.json`);
}));
app.use('/games', express.static('games'));
app.use('/icon.png', express.static('icon.png'));
const listener = app.listen(process.env.PORT || 8080, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});
