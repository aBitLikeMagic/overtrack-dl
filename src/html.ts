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
            .replace(/'/g, '&#39;'));
  }
}

export  const HTML = (strings: TemplateStringsArray, ...substitutions: string[]): HTMLString => { 
  const escapedFlattenedSubstitutions =
      substitutions.map(s => ([] as string[]).concat(s).map(HTMLString.escape).join(''));
  const pieces = [];
  for (let i = 0; i < strings.length; i++) {
    pieces.push(strings[i]);
    if (i < escapedFlattenedSubstitutions.length) {
      pieces.push(escapedFlattenedSubstitutions[i]);
    }
  }
  return new HTMLString(pieces.join(''));
};
