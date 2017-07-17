export class HTMLString extends String {
  static escape(text: any): HTMLString {
    if (text instanceof HTMLString) {
      return text;
    }
    return new HTMLString(
        String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/\\/g, '&#39;'));
  }
}

export  const HTML = (strings: TemplateStringsArray, ...substitutions: string[]): HTMLString => { 
  const escapedFlattenedSubstitutions =
      substitutions.map(s => ([] as string[]).concat(s).map(HTMLString.escape).join(''));
  const pieces = [];
  for (const i of strings.keys()) {
    pieces.push(strings[i], escapedFlattenedSubstitutions [i] || '');
  }
  return new HTMLString(pieces.join(''));
};
