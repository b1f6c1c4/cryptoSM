import { encode } from './persistence';
import { inflate } from 'pako';
import _set from 'lodash/set';

function smDecode(input) {
  return JSON.parse(inflate(
    window.atob(input),
    { to: 'string' },
  ));
}

const maxL = [15, 9, 22, 12, 10, 3, 4];

// Convert my preference into a big 1-D array
// such that I can GC against my partner.
export function smPrepare(input, reversed) {
  const [
    , // Personal information, discarded
    ...pref // SM information
  ] = smDecode(encode(input)); // TODO: silly design
  pref.length = 7;
  _set(pref, '[2][4]', null); // C3Q4 must by omitted
  _set(pref, '[2][7]', null); // C3Q7 must by omitted

  const res = [];
  [...pref].forEach((c, cid) => {
    if (!c) {
      c = [];
    }
    c.length = maxL[cid];
    [...c].forEach((q) => {
      if (q === undefined || q === null) {
        res.push(0, 0);
      } else {
        if (reversed) {
          q.reverse();
        }
        [...q].forEach((o) => {
          if (o === undefined || o === null) {
            res.push(0);
          } else {
            res.push(3 - o);
          }
        });
      }
    });
  });
  return res;
}

// Convert the a big 1-D array (minimium of mine and my partner's)
// into the internal form such that we can graphically display it.
export function smDiscuss(result) {
  const res = [];
  const rst = [...result];
  maxL.forEach((ml, ci) => {
    const c = rst.splice(0, ml * 2);
    const asbm = !!c[0];
    const ambs = !!c[1];
    for (let qi = 0; qi < ml; qi += 1) {
      if (asbm && c[2 * qi]) {
        res += `AliceS+BobM\tC${1 + ci}Q${qi}\t${c[2 * qi]}\n`;
      }
      if (ambs && c[2 * qi + 1]) {
        res += `AliceM+BobS\tC${1 + ci}Q${qi}\t${c[2 * qi + 1]}\n`;
      }
    }
  });
  return res;
}
