const fetch = require('node-fetch');
const fs = require('fs-extra');
const jsonStableStringify = require('json-stable-stringify');



class OvertrackUser {
  constructor(sessionId) {
    if (!sessionId) throw new Error("Missing session ID");
    
    this.sessionId_ = sessionId;
    this.games_ = [];
  }
  
  async getGames() {
    if (this.games_.length > 0) return this.games_;
    
    const response = await fetch('https://api.overtrack.gg/games', {
      headers: {
        'Cookie': `session=${this.sessionId_}`
      }
    });
    const data = await response.json();
    const games = data['games'].map(game => new OvertrackGame(game));
    
    games.sort((a, b) => a.meta.time - b.meta.time);
    
    return this.games_ = games;
  }
  
  async getGamesWithData() {
    const games = await this.getGames();
    for (const game of games) {
      await game.getData();
    }
    return games;
  }
  
  static async getGamesWithData(sessionId) {
    return new OvertrackUser(sessionId).getGamesWithData();
  }
}


class OvertrackGame {
  constructor(meta) {
    // meta is the short metadata used to display this in Overtrack game lsits.
    this.meta = meta;
    // data is the full detailed parsed game information used to display the game view.
    this.data = null;
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
    }
  }
  
  stringify() {
    return jsonStableStringify(this, {space: 2});
  }
  
  async getData() {
    if (this.data) return this.data;
    
    const path = `games/${this.key()}.json`;
    let data;
    
    try {
      this.data = JSON.parse(await fs.readFile(path)).data;
      console.log(`Loaded ${path}.`);
    } catch (error) {
      const response = await fetch(this.meta['url']);
      this.data = await response.json();
      console.log(`Fetched ${path}.`);
      await fs.writeFile(path, this.stringify());
    }

    return this.data;
  }
}


module.exports = {
  OvertrackUser,
  OvertrackGame
};
