import _set from 'lodash/set';
import _get from 'lodash/get';
import { categories } from './data/categories';

// Convert my preference into a big 1-D array
// such that I can GC against my partner.
export function smPrepare(input, reversed) {
  const res = [];
  categories.forEach(({ categoryId, questions }) => {
    questions.forEach(({ questionId, bianswer, uncomparable }) => {
      if (!uncomparable) {
        if (bianswer) {
          if (!reversed) {
            res.push(_get(input, [categoryId, questionId, 0]));
            res.push(_get(input, [categoryId, questionId, 1]));
          } else {
            res.push(_get(input, [categoryId, questionId, 1]));
            res.push(_get(input, [categoryId, questionId, 0]));
          }
        } else {
          res.push(_get(input, [categoryId, questionId]));
        }
      }
    });
  });
  return res.map((v) => (v === undefined ? 0 : 3 - v));
}

// Convert the a big 1-D array (minimium of mine and my partner's)
// into the internal form such that we can graphically display it.
export function smDiscuss(result) {
  const map = (v) => v ? 3 - v : undefined;
  const res = {};
  categories.forEach(({ categoryId, questions }) => {
    questions.forEach(({ questionId, bianswer, uncomparable }) => {
      if (!uncomparable) {
        if (bianswer) {
          _set(res, [categoryId, questionId, 0], map(result.shift(1)));
          _set(res, [categoryId, questionId, 1], map(result.shift(1)));
        } else {
          _set(res, [categoryId, questionId], map(result.shift(1)));
        }
      }
    });
  });
  return res;
}
