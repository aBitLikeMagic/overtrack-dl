import {OvertrackUser} from './models';


const sessionId = process.env['session'];
const shareKey = process.env['shareKey'];
if (sessionId || shareKey) {
  OvertrackUser.getGamesWithData(sessionId, shareKey);
} else {
  throw new Error("missing `session` ID or share `key` in environment");
}
