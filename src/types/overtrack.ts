import {Literal as L} from 'runtypes';
import * as t from 'runtypes';

import {MinimalGame} from './games';

// Type definitions for the raw data from Overtrack.


export const HeroName = t.Union(
  t.Union(L('doomfist'), L('genji'), L('mccree'), L('pharah'), L('reaper')),
  t.Union(L('s76'), L('sombra'), L('tracer'), L('bastion'), L('hanzo')),
  t.Union(L('junkrat'), L('mei'), L('torb'), L('widowmaker'), L('dva')),
  t.Union(L('orisa'), L('reinhardt'), L('roadhog'), L('winston'), L('zarya')),
  t.Union(L('ana'), L('lucio'), L('symmetra'), L('zenyatta'), L('mercy')));
export type HeroName = t.Static<typeof HeroName>;

export const TeamName = t.Union(L('red'), L('blue'));
export type TeamName = t.Static<typeof TeamName>;

// Data that is identical in both Overtrack's game data and metadata.
export const OvertrackGameCommon = t.Intersect(MinimalGame, t.Record({
  // The Overtrack key identifying this game.
  key: t.String,

  // The Overtrack user ID which owns this game.
  user_id: t.Number,
  
  // The player's SR before this match
  start_sr: t.Union(t.Void, t.Number),
  
  // The name of the map.
  map: t.String,
 
  // The result of the game.
  result: t.Union(L('UNKNOWN'), L('WIN'), L('DRAW'), L('LOSS')),

  // ...and the specific team scores.
  score: t.Union(t.Void, t.Tuple(t.Number, t.Number)),
  
  // The heroes the player used, and the fractions of the match for which they did.
  heroes_played: t.Array(t.Tuple(HeroName, t.Number))
}));
export type OvertrackGameCommon = t.Static<typeof OvertrackGameCommon>;

// The short metadata used to display this in Overtrack game lsits.
export const OvertrackGameMetadata = t.Intersect(OvertrackGameCommon, t.Record({
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
export type OvertrackGameMetadata = t.Static<typeof OvertrackGameMetadata>;

// The full detailed parsed game information used to display the game view.
export interface OvertrackGameData extends OvertrackGameCommon {
  // The primary BattleTag associated with the owner's Overtrack account.
  owner: string;

  // The name of the account playing this game.
  player: string;

  // The timestamps when the game started and ended, and duration in seconds.
  game_started: number;
  game_ended: number;
  game_duration: number;

  // The game/map type.
  map_type: 'Control' | 'Assault' | 'Hybrid';

  // The average SR of each team.
  avg_sr: [number, number];
  
  // Details about each round of the game.
  objective_stages: null | {
    start: number;
    stage: string;
    round_winner?: TeamName;
    ownership?: {
      owner: TeamName;
      start: number;
      end: number;
    };
    end_score: number | [number, number];
  }[];
  
  // The heroes used by each player on each team through the game.
  teams: {
    [index: string]: {
      name: string;
      heroes: {
        hero: HeroName;
        start: number;
        end: number;
      }[]
    }[]
  };
  
  // The stats visible in the tab screen, as captured at various times through the match.
  tab_statistics: {
    time: number[];
    damage: number[];
    deaths: number[];
    elims: number[];
    objective_kills: number[];
    objective_time: number[];
    healing: number[];
    hero: number[];
    hero_stat_1: number[];
    hero_stat_2: number[];
    hero_stat_3: number[];
    hero_stat_4: number[];
    hero_stat_5: number[];
    hero_stat_6: number[];
  };

  // Total deaths by the player in the game.
  deaths: number;

  // Whether this is not a competitive game.
  custom_game: boolean;

  // The number of players in the active group, or 0.
  group_size: number;

  // Every event listed in the kill feed.
  killfeed: [
    number,
    number,
    HeroName,
    string,
    HeroName,
    string,
    string[],
    null | [HeroName, string]
  ][];

  // Your statistics for each hero and for 'ALL', as displayed at the end of the game
  hero_statistics: {
    [index: string]: {
      damage: number;
      deaths: number;
      elims: number;
      objective_kills: number;
      objective_time: number;
      healing: number;
      hero_stat_1: number;
      hero_stat_2: number;
      hero_stat_3: number;
      hero_stat_4: number;
      hero_stat_5: number;
      tab_health: number;
      time_played: number;
      hero_stat_6: number;
    }
  };

  assists: [number, string, number, number][];
}
