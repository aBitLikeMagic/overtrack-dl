import * as t from 'runtypes';


export const MinimalGame = t.Record({
  // The player's SR after a match.
  end_sr: t.Union(t.Void, t.Number)
});
export type MinimalGame = t.Static<typeof MinimalGame>;
