const fetch = require('node-fetch');



const main = () => {
  const sessionId = process.env['session'];
  if (!sessionId) {
    throw new ValueError("Missing session ID as 'session' in env.");
  };

  const games = await getGameList(sessionId);

  for (const metadata of games) {
    const details = await getGameDetails(metadata);
    
    console.log(metadata);
    console.log(details);
    
    break; // XXX: don't request more until we're actually saving it.
  }
};


const getGameList = async (sessionId) => {
  const response = await fetch({
    url: 'https://api.overtrack.gg/games',
    headers: {
      'Cookie': `session=${sessionId}`
    }
  });
  const data = await response.json();
  return data['games'];
};


const getGameDetails = async (gameMetadata) => {
  const response = await fetch(gameMetadata.url);
  const data = await response.json();
  return data;
};



main();
