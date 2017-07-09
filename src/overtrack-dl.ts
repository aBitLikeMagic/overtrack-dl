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
  
  static async getGamesWithData(sessionId: string) {
    return new OvertrackUser(sessionId).getGamesWithData();
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
