import {OvertrackUser} from './overtrack-dl';


const sessionId = process.env['session'];
if (sessionId) {
  OvertrackUser.getGamesWithData(sessionId);
} else {
  throw new Error("missing `session` ID in environment");
}
