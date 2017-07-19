"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtypes_1 = require("runtypes");
const games_1 = require("./games");
// Type definitions for the raw data from Overtrack.
exports.HeroName = runtypes_1.Union(runtypes_1.Union(runtypes_1.Literal('doomfist'), runtypes_1.Literal('genji'), runtypes_1.Literal('mccree'), runtypes_1.Literal('pharah'), runtypes_1.Literal('reaper')), runtypes_1.Union(runtypes_1.Literal('s76'), runtypes_1.Literal('sombra'), runtypes_1.Literal('tracer'), runtypes_1.Literal('bastion'), runtypes_1.Literal('hanzo')), runtypes_1.Union(runtypes_1.Literal('junkrat'), runtypes_1.Literal('mei'), runtypes_1.Literal('torb'), runtypes_1.Literal('widowmaker'), runtypes_1.Literal('dva')), runtypes_1.Union(runtypes_1.Literal('orisa'), runtypes_1.Literal('reinhardt'), runtypes_1.Literal('roadhog'), runtypes_1.Literal('winston'), runtypes_1.Literal('zarya')), runtypes_1.Union(runtypes_1.Literal('ana'), runtypes_1.Literal('lucio'), runtypes_1.Literal('symmetra'), runtypes_1.Literal('zenyatta'), runtypes_1.Literal('mercy')));
exports.TeamName = runtypes_1.Union(runtypes_1.Literal('red'), runtypes_1.Literal('blue'));
// Data that is identical in both Overtrack's game data and metadata.
exports.OvertrackGameCommon = runtypes_1.Intersect(games_1.MinimalGame, runtypes_1.Record({
    // The Overtrack key identifying this game.
    key: runtypes_1.String,
    // The Overtrack user ID which owns this game.
    user_id: runtypes_1.Number,
    // The player's SR before this match
    start_sr: runtypes_1.Union(runtypes_1.Null, runtypes_1.Number),
    // The name of the map.
    map: runtypes_1.String,
    // The result of the game.
    result: runtypes_1.Union(runtypes_1.Literal('UNKNOWN'), runtypes_1.Literal('WIN'), runtypes_1.Literal('DRAW'), runtypes_1.Literal('LOSS')),
    // ...and the specific team scores.
    score: runtypes_1.Union(runtypes_1.Null, runtypes_1.Tuple(runtypes_1.Number, runtypes_1.Number)),
    // The heroes the player used, and the fractions of the match for which they did.
    heroes_played: runtypes_1.Array(runtypes_1.Tuple(exports.HeroName, runtypes_1.Number))
}));
// The short metadata used to display this in Overtrack game lsits.
exports.OvertrackGameMetadata = runtypes_1.Intersect(exports.OvertrackGameCommon, runtypes_1.Record({
    // The name of the current player.
    player_name: runtypes_1.String,
    // The URL where the full detailed parsed game information is available.
    url: runtypes_1.String,
    // The timestamp at which the game started, and duration in seconds.
    time: runtypes_1.Number,
    duration: runtypes_1.Number,
    // not sure what this is.
    rank: runtypes_1.Null
}));
// The full detailed parsed game information used to display the game view.
exports.OvertrackGameData = runtypes_1.Intersect(exports.OvertrackGameCommon, runtypes_1.Record({
    // The primary BattleTag associated with the owner's Overtrack account.
    owner: runtypes_1.String,
    // The name of the account playing this game.
    player: runtypes_1.String,
    // The timestamps when the game started and ended, and duration in seconds.
    game_started: runtypes_1.Number,
    game_ended: runtypes_1.Number,
    game_duration: runtypes_1.Number,
    // The game/map type.
    map_type: runtypes_1.Union(runtypes_1.Literal('UNKNOWN'), runtypes_1.Literal('Control'), runtypes_1.Literal('Assault'), runtypes_1.Literal('Hybrid'), runtypes_1.Literal('Escort')),
    // The average SR of each team.
    avg_sr: runtypes_1.Union(runtypes_1.Null, runtypes_1.Tuple(runtypes_1.Union(runtypes_1.Null, runtypes_1.Number), runtypes_1.Union(runtypes_1.Null, runtypes_1.Number))),
    // Details about each round of the game.
    objective_stages: runtypes_1.Union(runtypes_1.Null, runtypes_1.Array(runtypes_1.Record({
        start: runtypes_1.Number,
        stage: runtypes_1.String,
        round_winner: runtypes_1.Union(runtypes_1.Null, exports.TeamName),
        ownership: runtypes_1.Array(runtypes_1.Union(runtypes_1.Null, runtypes_1.Record({
            owner: exports.TeamName,
            start: runtypes_1.Number,
            end: runtypes_1.Number
        }))),
        end_score: runtypes_1.Union(runtypes_1.Number, runtypes_1.Tuple(runtypes_1.Number, runtypes_1.Number))
    })), runtypes_1.Array(runtypes_1.Record({
        checkpoints: runtypes_1.Array(runtypes_1.Tuple(runtypes_1.Number, runtypes_1.Number)),
        stage: runtypes_1.Union(runtypes_1.Literal("Attack"), runtypes_1.Literal("Defend")),
        start: runtypes_1.Number,
        end: runtypes_1.Number,
        end_score: runtypes_1.Union(runtypes_1.Null, runtypes_1.Number)
    }))),
    //   // The heroes used by each player on each team through the game.
    //   teams: {
    //     [index: StringT]: {
    //       name: StringT,
    //       heroes: {
    //         hero: HeroName,
    //         start: NumberT,
    //         end: NumberT,
    //       }[]
    //     }[]
    //   },
    //   // The stats visible in the tab screen, as captured at various times through the match.
    //   tab_statistics: {
    //     time: NumberT[],
    //     damage: NumberT[],
    //     deaths: NumberT[],
    //     elims: NumberT[],
    //     objective_kills: NumberT[],
    //     objective_time: NumberT[],
    //     healing: NumberT[],
    //     hero: NumberT[],
    //     hero_stat_1: NumberT[],
    //     hero_stat_2: NumberT[],
    //     hero_stat_3: NumberT[],
    //     hero_stat_4: NumberT[],
    //     hero_stat_5: NumberT[],
    //     hero_stat_6: NumberT[],
    //   },
    // Total deaths by the player in the game.
    deaths: runtypes_1.Number,
    //   // Whether this is not a competitive game.
    //   custom_game: boolean,
    //   // The number of players in the active group, or 0.
    group_size: runtypes_1.Union(runtypes_1.Null, runtypes_1.Number)
    //   // Every event listed in the kill feed.
    //   killfeed: [
    //     NumberT,
    //     NumberT,
    //     NumberT,
    //     string,
    //     HeroName,
    //     string,
    //     string[],
    //     NullT | [HeroName, string]
    //   ][],
    //   // Your statistics for each hero and for 'ALL', as displayed at the end of the game
    //   hero_statistics: {
    //     [index: StringT]: {
    //       damage: NumberT,
    //       deaths: NumberT,
    //       elims: NumberT,
    //       objective_kills: NumberT,
    //       objective_time: NumberT,
    //       healing: NumberT,
    //       hero_stat_1: NumberT,
    //       hero_stat_2: NumberT,
    //       hero_stat_3: NumberT,
    //       hero_stat_4: NumberT,
    //       hero_stat_5: NumberT,
    //       tab_health: NumberT,
    //       time_played: NumberT,
    //       hero_stat_6: NumberT,
    //     }
    //   },
    //   assists: [NumberT, NumberT, NumberT, NumberT][],
}));
