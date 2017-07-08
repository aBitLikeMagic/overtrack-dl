const fs = require('fs-extra');
const fetch = require('node-fetch');
const jsonStableStringify = require('json-stable-stringify');



const getGames = async (sessionId) => {
  if (!sessionId) {
    throw new Error("Missing session ID as 'session' in env.");
  };

  console.log("Getting game list from server.");
  const gameMetas = await getGameList(sessionId);
  const games = [];

  for (const metadata of gameMetas) {
    games.push(await getGameDetails(metadata));
  }
  
  games.sort((a, b) => a.meta.time - b.meta.time);
  
  return games;
};


const getGameList = async (sessionId) => {
  const response = await fetch('https://api.overtrack.gg/games', {
    headers: {
      'Cookie': `session=${sessionId}`
    }
  });
  const data = await response.json();
  return data['games'];
};


// Gets the full detailed data for a game.
// Game data will be saved for later.
const getGameDetails = async (gameMetadata) => {
  const m = gameMetadata;
  const fileKey = `${m.player_name}-${new Date(m.time * 1000).toISOString().replace('.000Z', '').replace(/[^0-9]/g, '')}-${m.map}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const path = `games/${fileKey}.json`;
  let data;

  try {
    data = JSON.parse(await fs.readFile(path));
    console.log(`Loaded ${path}.`);
  } catch (error) {
    const response = await fetch(gameMetadata['url']);
    data = {
      meta: gameMetadata,
      data: await response.json()
    }
    await fs.writeFile(path, stringify(data));
    console.log(`Fetched ${path}.`);
  }

  data.name = fileKey;
  return data;
};


const stringify = (object) => {
  return jsonStableStringify(object, {space: 2});
};


module.exports = {getGames};
