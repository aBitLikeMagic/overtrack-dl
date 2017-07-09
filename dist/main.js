"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const overtrack_dl_1 = require("./overtrack-dl");
const sessionId = process.env['session'];
const shareKey = process.env['shareKey'];
if (sessionId || shareKey) {
    overtrack_dl_1.OvertrackUser.getGamesWithData(sessionId, shareKey);
}
else {
    throw new Error("missing `session` ID or share `key` in environment");
}
