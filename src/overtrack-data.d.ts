// Type definitions for the raw data from Overtrack.


export type HeroName =
  'doomfist' | 'genji' | 'mccree' | 'pharah' | 'reaper' | 's76' | 'sombra' | 'tracer' |
  'bastion' | 'hanzo' | 'junkrat' | 'mei' | 'torb' | 'widowmaker' |
  'dva' | 'orisa' | 'reinhardt' | 'roadhog' | 'winston' | 'zarya' |
  'ana' | 'lucio' | 'symmetra' | 'zenyatta';

export type TeamName = 'red' | 'blue';

export interface MinimalGame {
  // The player's SR after this match.
  end_sr: number;
}

// Data that is identical in both Overtrack's game data and metadata.
interface RawOvertrackGameCommon extends MinimalGame {
  // The Overtrack key identifying this game.
  key: string;

  // The Overtrack user ID which owns this game.
  user_id: number;
  
  // The player's SR before this match
  start_sr: number;
  
  // The name of the map.
  map: string;

  // The result of the game.
  result: 'UNKNOWN' | 'WIN' | 'DRAW' | 'LOSS';
  // ...and the specific team scores.
  score: [number, number];
  
  // The heroes the player used, and the fractions of the match for which they did.
  heroes_played: [HeroName, number][]
}

// The short metadata used to display this in Overtrack game lsits.
export interface RawOvertrackGameMetadata extends RawOvertrackGameCommon {
  // The name of the current player.
  player_name: string;

  // The URL where the full detailed parsed game information is available.
  url: string;
  
  // The timestamp at which the game started, and duration in seconds.
  time: number;
  duration: number;

  // not sure what this is.
  rank: null;
}

// The full detailed parsed game information used to display the game view.
export interface RawOvertrackGameData extends RawOvertrackGameCommon {
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
