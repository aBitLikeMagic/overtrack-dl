import {
  Literal as L,
  Null as NullT,
  Number as NumberT,
  String as StringT,
  Array as ArrayT,
  Union, Intersect, Tuple, Static, Record,
} from 'runtypes';

import {MinimalGame} from './games';

// Type definitions for the raw data from Overtrack.


export const HeroName = Union(
  Union(L('doomfist'), L('genji'), L('mccree'), L('pharah'), L('reaper')),
  Union(L('s76'), L('sombra'), L('tracer'), L('bastion'), L('hanzo')),
  Union(L('junkrat'), L('mei'), L('torb'), L('widowmaker'), L('dva')),
  Union(L('orisa'), L('reinhardt'), L('roadhog'), L('winston'), L('zarya')),
  Union(L('ana'), L('lucio'), L('symmetra'), L('zenyatta'), L('mercy')));
export type HeroName = Static<typeof HeroName>;

export const TeamName = Union(L('red'), L('blue'));
export type TeamName = Static<typeof TeamName>;

// Data that is identical in both Overtrack's game data and metadata.
export const OvertrackGameCommon = Intersect(MinimalGame, Record({
  // The Overtrack key identifying this game.
  key: StringT,

  // The Overtrack user ID which owns this game.
  user_id: NumberT,
  
  // The player's SR before this match
  start_sr: Union(NullT, NumberT),
  
  // The name of the map.
  map: StringT,
 
  // The result of the game.
  result: Union(L('UNKNOWN'), L('WIN'), L('DRAW'), L('LOSS')),

  // ...and the specific team scores.
  score: Union(NullT, Tuple(NumberT, NumberT)),
  
  // The heroes the player used, and the fractions of the match for which they did.
  heroes_played: ArrayT(Tuple(HeroName, NumberT))
}));
export type OvertrackGameCommon = Static<typeof OvertrackGameCommon>;

// The short metadata used to display this in Overtrack game lsits.
export const OvertrackGameMetadata = Intersect(OvertrackGameCommon, Record({
  // The name of the current player.
  player_name: StringT,

  // The URL where the full detailed parsed game information is available.
  url: StringT,
  
  // The timestamp at which the game started, and duration in seconds.
  time: NumberT,
  duration: NumberT,

  // not sure what this is.
  rank: NullT
}));
export type OvertrackGameMetadata = Static<typeof OvertrackGameMetadata>;

// The full detailed parsed game information used to display the game view.
export const OvertrackGameData = Intersect(OvertrackGameCommon, Record({
  // The primary BattleTag associated with the owner's Overtrack account.
  owner: StringT,

  // The name of the account playing this game.
  player: StringT,

  // The timestamps when the game started and ended, and duration in seconds.
  game_started: NumberT,
  game_ended: NumberT,
  game_duration: NumberT,

  // The game/map type.
  map_type: Union(L('UNKNOWN'), L('Control'), L('Assault'), L('Hybrid'), L('Escort')),

  // The average SR of each team.
  avg_sr: Union(NullT, Tuple(Union(NullT, NumberT), Union(NullT, NumberT))),
  
  // Details about each round of the game.
  objective_stages: Union(NullT, ArrayT(Record({
    start: NumberT,
    stage: StringT,
    round_winner: Union(NullT, TeamName),
    ownership: ArrayT(Union(NullT, Record({
      owner: TeamName,
      start: NumberT,
      end: NumberT
    }))),
    end_score: Union(NumberT, Tuple(NumberT, NumberT))
  })), ArrayT(Record({
    checkpoints: ArrayT(Tuple(NumberT, NumberT)),
    stage: Union(L("Attack"), L("Defend")),
    start: NumberT,
    end: NumberT,
    end_score: Union(NullT, NumberT)
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
   deaths: NumberT,

//   // Whether this is not a competitive game.
//   custom_game: boolean,

//   // The number of players in the active group, or 0.
   group_size: Union(NullT, NumberT)

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
export type OvertrackGameData = Static<typeof OvertrackGameData>;
