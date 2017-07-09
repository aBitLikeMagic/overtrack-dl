"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const overtrack_dl_1 = require("./overtrack-dl");
const sessionId = process.env['session'];
if (sessionId) {
    overtrack_dl_1.OvertrackUser.getGamesWithData(sessionId);
}
else {
    throw new Error("missing `session` ID in environment");
}
