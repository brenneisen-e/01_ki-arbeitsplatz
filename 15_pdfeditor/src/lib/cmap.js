// Kleiner Parser fuer ToUnicode-CMaps (bfchar / bfrange / codespacerange).
// Liefert die Abbildung Code -> Unicode-String sowie die Bytelaenge der Codes.

function tokenize(text) {
  const tokens = [];
  const re = /<([0-9a-fA-F\s]*)>|\[|\]|\/[^\s/\[\]<>()]+|-?\d+(?:\.\d+)?|[A-Za-z]+|%[^\n]*/g;
  let m;
  while ((m = re.exec(text))) {
    const t = m[0];
    if (t.startsWith('%')) continue;
    if (t.startsWith('<')) tokens.push({ type: 'hex', value: m[1].replace(/\s+/g, '') });
    else if (t === '[' || t === ']') tokens.push({ type: t });
    else if (t.startsWith('/')) tokens.push({ type: 'name', value: t.slice(1) });
    else if (/^-?\d/.test(t)) tokens.push({ type: 'num', value: Number(t) });
    else tokens.push({ type: 'kw', value: t });
  }
  return tokens;
}

function hexToUnicode(hex) {
  // UTF-16BE
  let s = '';
  for (let i = 0; i + 4 <= hex.length; i += 4) {
    s += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16));
  }
  if (hex.length % 4 === 2) s += String.fromCharCode(parseInt(hex.slice(-2), 16));
  return s;
}

function incrementLast(str) {
  if (!str) return str;
  return str.slice(0, -1) + String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
}

export function parseToUnicodeCMap(text) {
  const tokens = tokenize(text);
  const codeToUni = new Map();
  const codeLengths = new Set();
  const noteLen = (hex) => codeLengths.add(Math.max(1, hex.length / 2));

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type !== 'kw') continue;
    if (t.value === 'begincodespacerange') {
      i++;
      while (i < tokens.length && !(tokens[i].type === 'kw' && tokens[i].value === 'endcodespacerange')) {
        if (tokens[i].type === 'hex') noteLen(tokens[i].value);
        i++;
      }
    } else if (t.value === 'beginbfchar') {
      i++;
      while (i + 1 < tokens.length && !(tokens[i].type === 'kw' && tokens[i].value === 'endbfchar')) {
        const src = tokens[i], dst = tokens[i + 1];
        if (src.type === 'hex' && dst.type === 'hex') {
          noteLen(src.value);
          codeToUni.set(parseInt(src.value, 16), hexToUnicode(dst.value));
          i += 2;
        } else if (src.type === 'hex' && dst.type === 'name') {
          i += 2;
        } else {
          i++;
        }
      }
    } else if (t.value === 'beginbfrange') {
      i++;
      while (i + 2 < tokens.length && !(tokens[i].type === 'kw' && tokens[i].value === 'endbfrange')) {
        const lo = tokens[i], hi = tokens[i + 1], dst = tokens[i + 2];
        if (lo.type !== 'hex' || hi.type !== 'hex') { i++; continue; }
        noteLen(lo.value);
        const from = parseInt(lo.value, 16), to = parseInt(hi.value, 16);
        if (dst.type === 'hex') {
          let u = hexToUnicode(dst.value);
          for (let c = from; c <= to && c - from < 65536; c++) {
            codeToUni.set(c, u);
            u = incrementLast(u);
          }
          i += 3;
        } else if (dst.type === '[') {
          let j = i + 3, c = from;
          while (j < tokens.length && tokens[j].type !== ']') {
            if (tokens[j].type === 'hex') codeToUni.set(c++, hexToUnicode(tokens[j].value));
            j++;
          }
          i = j + 1;
        } else {
          i++;
        }
      }
    }
  }
  return { codeToUni, codeLengths };
}
