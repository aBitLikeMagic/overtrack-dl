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
const node_fetch_1 = require("node-fetch");
const fs = require("fs-extra");
const jsonStableStringify = require("json-stable-stringify");
class OvertrackUser {
    constructor(sessionId, shareKey) {
        this.sessionId_ = sessionId;
        this.shareKey_ = shareKey;
        this.games_ = [];
    }
    getGames() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.games_.length > 0)
                return this.games_;
            let url = 'https://api.overtrack.gg/games';
            if (this.shareKey_)
                url += '/' + this.shareKey_;
            let headers = {};
            if (this.sessionId_)
                headers['Cookie'] = `session=${this.sessionId_}`;
            console.log(url, headers);
            const response = yield node_fetch_1.default(url, { headers: headers });
            const data = yield response.json();
            //console.log(data);
            const games = data['games'].map((game) => new OvertrackGame(game));
            games.sort((a, b) => a.meta.time - b.meta.time);
            return this.games_ = games;
        });
    }
    getGamesWithData() {
        return __awaiter(this, void 0, void 0, function* () {
            const games = yield this.getGames();
            for (const game of games) {
                yield game.getData();
            }
            return games;
        });
    }
    getPlayerCsvPaths() {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = [];
            const gamesByPlayer = {};
            for (const game of yield this.getGamesWithData()) {
                if (!gamesByPlayer[game.meta.player_name]) {
                    gamesByPlayer[game.meta.player_name] = [];
                }
                gamesByPlayer[game.meta.player_name].push(game);
            }
            const eraseUnknown = (x) => String(x || '').replace(/^UNKNOWN$/, '');
            for (const playerName of Object.keys(gamesByPlayer)) {
                const csvRows = [];
                csvRows.push([
                    "Date",
                    "Map",
                    "Result",
                    "SR Before",
                    "SR After",
                    "Heroes",
                    "Group Size"
                ].join(', '));
                for (const game of gamesByPlayer[playerName]) {
                    const values = [
                        new Date(game.meta.time * 1000).toISOString(),
                        eraseUnknown(game.meta.map),
                        eraseUnknown(game.meta.result),
                        eraseUnknown(game.meta.start_sr),
                        eraseUnknown(game.meta.end_sr),
                        game.meta.heroes_played.sort((a, b) => a[1] - b[1]).map(x => x[0]).join(", "),
                        eraseUnknown(game.data && game.data.group_size || '1')
                    ];
                    csvRows.push(values.map(value => {
                        value = String(value);
                        if (/^[0-9a-z\.\-\(\) ]+$/i.test(value)) {
                            return value;
                        }
                        else {
                            return '"' + value.replace(/"/g, '""') + '"';
                        }
                    }).join(', '));
                }
                csvRows.push('\n');
                const csv = csvRows.join('\n');
                const path = `games/${playerName}.csv`;
                yield fs.writeFile(path, csv, { encoding: 'utf8' });
                paths.push(path);
            }
            return paths;
        });
    }
    static getGamesWithData(sessionId, shareKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = new OvertrackUser(sessionId, shareKey);
            const games = yield user.getGamesWithData();
            const csvPaths = yield user.getPlayerCsvPaths();
            return [games, csvPaths];
        });
    }
}
exports.OvertrackUser = OvertrackUser;
class OvertrackGame {
    constructor(meta) {
        this.meta = meta;
        this.data = undefined;
    }
    // A string key derived from meta to uniqely identify this game.
    key() {
        return [
            this.meta.player_name,
            new Date(this.meta.time * 1000).toISOString().replace(/[^0-9]|000Z$/g, ''),
            this.meta.map
        ].join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    toJSON() {
        return {
            meta: this.meta,
            data: this.data
        };
    }
    stringify() {
        return jsonStableStringify(this, { space: 2 });
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data)
                return this.data;
            const path = `games/${this.key()}.json`;
            try {
                this.data = JSON.parse(yield fs.readFile(path, 'utf8')).data;
                console.log(`Loaded ${path}.`);
            }
            catch (error) {
                const response = yield node_fetch_1.default(this.meta.url);
                this.data = yield response.json();
                console.log(`Fetched ${path}.`);
                yield fs.writeFile(path, this.stringify());
            }
            return this.data;
        });
    }
}
exports.OvertrackGame = OvertrackGame;
