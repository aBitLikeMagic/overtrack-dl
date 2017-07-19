"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("runtypes");
exports.MinimalGame = t.Record({
    // The player's SR after a match.
    end_sr: t.Union(t.Void, t.Number)
});
