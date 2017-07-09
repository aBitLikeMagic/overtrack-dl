import fetch from 'node-fetch';
import * as fs from 'fs-extra';
import * as jsonStableStringify from 'json-stable-stringify';

import {RawOvertrackGameMetadata, RawOvertrackGameData} from './overtrack-data.d';



export class OvertrackUser {
  sessionId_: string;
  games_: OvertrackGame[];
  
  constructor(sessionId: string) {
    if (!sessionId) throw new Error("Missing session ID");
    
    this.sessionId_ = sessionId;
    this.games_ = [];
  }
  
  async getGames(): Promise<OvertrackGame[]> {
    if (this.games_.length > 0) return this.games_;
    
    const response = await fetch('https://api.overtrack.gg/games', {
      headers: {
        'Cookie': `session=${this.sessionId_}`
      }
    });
    const data = await response.json();
    const games:OvertrackGame[] = data['games'].map((game: Object) => new OvertrackGame(game));
    
    games.sort((a, b) => a.meta.time - b.meta.time);
    
    return this.games_ = games;
  }
  
  async getGamesWithData(): Promise<OvertrackGame[]> {
    const games = await this.getGames();
    for (const game of games) {
      await game.getData();
    }
    return games;
  }
  
  async getPlayerCsvPaths(): Promise<string[]> {
    const paths:string[] = [];
    
    const gamesByPlayer:{[index: string]: OvertrackGame[]} = {};
    for (const game of await this.getGamesWithData()) {
      if (!gamesByPlayer[game.meta.player_name]) {
        gamesByPlayer[game.meta.player_name] = [];
      }
      gamesByPlayer[game.meta.player_name].push(game);
    }
    
    const eraseUnknown = (x: any) => String(x || '').replace(/^UNKNOWN$/, '');
    
    for (const playerName of Object.keys(gamesByPlayer)) {
      const csvRows: string[] = [];
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
          } else {
            return '"' + value.replace(/"/g, '""') + '"';
          }
        }).join(', '));
      }
      const csv = csvRows.join('\n');
      const path = `games/${playerName}.csv`
      await fs.writeFile(path, csv, {encoding: 'utf8'});
      paths.push(path);
    }
    
    return paths;
  }
  
  static async getGamesWithData(sessionId: string): Promise<[OvertrackGame[], string[]]> {
    const user = new OvertrackUser(sessionId);
    const games = await user.getGamesWithData();
    const csvPaths = await user.getPlayerCsvPaths();
    return [games, csvPaths];
  }
}


export class OvertrackGame {
  meta: RawOvertrackGameMetadata;
  data?: RawOvertrackGameData;

  constructor(meta: Object) {
    this.meta = meta as any;
    this.data = undefined;
  }

  // A string key derived from meta to uniqely identify this game.
  key(): string {
    return [
      this.meta.player_name,
      new Date(this.meta.time * 1000).toISOString().replace(/[^0-9]|000Z$/g, ''),
      this.meta.map
    ].join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  
  toJSON(): Object {
    return {
      meta: this.meta,
      data: this.data
    }
  }
  
  stringify(): string {
    return jsonStableStringify(this, {space: 2});
  }
  
  async getData(): Promise<RawOvertrackGameData> {
    if (this.data) return this.data;
    
    const path = `games/${this.key()}.json`;

    try {
      this.data = JSON.parse(await fs.readFile(path, 'utf8')).data;
      console.log(`Loaded ${path}.`);
    } catch (error) {
      const response = await fetch(this.meta.url);
      this.data = await response.json();
      console.log(`Fetched ${path}.`);
      await fs.writeFile(path, this.stringify());
    }

    return this.data as RawOvertrackGameData;
  }
}
