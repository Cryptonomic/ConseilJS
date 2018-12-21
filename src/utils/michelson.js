export default function me(mi) {
  mi = mi
    .replace(/(?:@[a-z_]+)|(?:#.*$)/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (mi.charAt(0) === '(') mi = mi.slice(1, -1);
  let pl = 0;
  let sopen = false;
  let escaped = false;
  let ret = {
    prim: '',
    args: []
  };
  let val = '';
  for (let i = 0; i < mi.length; i++) {
    if (escaped) {
      val += mi[i];
      escaped = false;
      continue;
    } else if (
      (i === mi.length - 1 && sopen === false) ||
      (mi[i] === ' ' && pl === 0 && sopen === false)
    ) {
      if (i === mi.length - 1) val += mi[i];
      if (val) {
        if (val === parseInt(val).toString()) {
          if (!ret.prim) return { int: val };
          else ret.args.push({ int: val });
        } else if (val[0] == '0') {
          if (!ret.prim) return { bytes: val };
          else ret.args.push({ bytes: val });
        } else if (ret.prim) {
          ret.args.push(me(val));
        } else {
          ret.prim = val;
        }
        val = '';
      }
      continue;
    } else if (mi[i] === '"' && sopen) {
      sopen = false;
      if (!ret.prim) return { string: val };
      else ret.args.push({ string: val });
      val = '';
      continue;
    } else if (mi[i] === '"' && !sopen && pl === 0) {
      sopen = true;
      continue;
    } else if (mi[i] === '\\') escaped = true;
    else if (mi[i] === '(') pl++;
    else if (mi[i] === ')') pl--;
    val += mi[i];
  }
  return ret;
}
