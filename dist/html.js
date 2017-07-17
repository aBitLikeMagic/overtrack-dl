"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HTMLString extends String {
    static escape(text) {
        if (text instanceof HTMLString) {
            return text;
        }
        return new HTMLString(String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/\\/g, '&#39;'));
    }
}
exports.HTMLString = HTMLString;
exports.HTML = (strings, ...substitutions) => {
    const escapedFlattenedSubstitutions = substitutions.map(s => [].concat(s).map(HTMLString.escape).join(''));
    const pieces = [];
    for (const i of strings.keys()) {
        pieces.push(strings[i], escapedFlattenedSubstitutions[i] || '');
    }
    return new HTMLString(pieces.join(''));
};
