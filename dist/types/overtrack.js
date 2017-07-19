"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtypes_1 = require("runtypes");
const t = require("runtypes");
const games_1 = require("./games");
// Type definitions for the raw data from Overtrack.
exports.HeroName = t.Union(t.Union(runtypes_1.Literal('doomfist'), runtypes_1.Literal('genji'), runtypes_1.Literal('mccree'), runtypes_1.Literal('pharah'), runtypes_1.Literal('reaper')), t.Union(runtypes_1.Literal('s76'), runtypes_1.Literal('sombra'), runtypes_1.Literal('tracer'), runtypes_1.Literal('bastion'), runtypes_1.Literal('hanzo')), t.Union(runtypes_1.Literal('junkrat'), runtypes_1.Literal('mei'), runtypes_1.Literal('torb'), runtypes_1.Literal('widowmaker'), runtypes_1.Literal('dva')), t.Union(runtypes_1.Literal('orisa'), runtypes_1.Literal('reinhardt'), runtypes_1.Literal('roadhog'), runtypes_1.Literal('winston'), runtypes_1.Literal('zarya')), t.Union(runtypes_1.Literal('ana'), runtypes_1.Literal('lucio'), runtypes_1.Literal('symmetra'), runtypes_1.Literal('zenyatta'), runtypes_1.Literal('mercy')));
exports.TeamName = t.Union(runtypes_1.Literal('red'), runtypes_1.Literal('blue'));
// Data that is identical in both Overtrack's game data and metadata.
exports.OvertrackGameCommon = t.Intersect(games_1.MinimalGame, t.Record({
    // The Overtrack key identifying this game.
    key: t.String,
    // The Overtrack user ID which owns this game.
    user_id: t.Number,
    // The player's SR before this match
    start_sr: t.Union(t.Void, t.Number),
    // The name of the map.
    map: t.String,
    // The result of the game.
    result: t.Union(runtypes_1.Literal('UNKNOWN'), runtypes_1.Literal('WIN'), runtypes_1.Literal('DRAW'), runtypes_1.Literal('LOSS')),
    // ...and the specific team scores.
    score: t.Union(t.Void, t.Tuple(t.Number, t.Number)),
    // The heroes the player used, and the fractions of the match for which they did.
    heroes_played: t.Array(t.Tuple(exports.HeroName, t.Number))
}));
// The short metadata used to display this in Overtrack game lsits.
exports.OvertrackGameMetadata = t.Intersect(exports.OvertrackGameCommon, t.Record({
    // The name of the current player.
    player_name: t.String,
    // The URL where the full detailed parsed game information is available.
    url: t.String,
    // The timestamp at which the game started, and duration in seconds.
    time: t.Number,
    duration: t.Number,
    // not sure what this is.
    rank: t.Null
}));
