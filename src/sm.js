import _set from 'lodash/set';
import _get from 'lodash/get';
import { categories } from './data/categories';
import { getBianswerQuestionDisplayInfo } from './contents/Profile';

// Convert my preference into a big 1-D array
// such that I can GC against my partner.
export function smPrepare(input, reversed) {
  const res = [];
  categories.forEach(({ categoryId, questions }) => {
    questions.forEach((question) => {
      const { questionId, bianswer, dependencies } = question;
      if (!bianswer) return;
      let ans = _get(input, [categoryId, questionId]);
      if (ans === undefined) {
        ans = [undefined, undefined];
      } else {
        ans = [...ans];
      }
      const { showS, showM } = getBianswerQuestionDisplayInfo(input, question);
      if (!showS) ans[0] = undefined;
      if (!showM) ans[1] = undefined;
      if (reversed) ans.reverse();
      res.push(...ans);
    });
  });
  if (process.env.NODE_ENV !== 'production') {
    console.log(res);
  }
  const resv = res.map((v) => (v === undefined ? 0 : 3 - v));
  return resv;
}

// Convert the a big 1-D array (minimium of mine and my partner's)
// into the internal form such that we can graphically display it.
export function smDiscuss(result) {
  const map = (v) => v ? 3 - v : undefined;
  const res = {};
  categories.forEach(({ categoryId, questions }) => {
    questions.forEach(({ questionId, bianswer }) => {
      if (!bianswer) return;
      _set(res, [categoryId, questionId, 0], map(result.shift(1)));
      _set(res, [categoryId, questionId, 1], map(result.shift(1)));
    });
  });
  return res;
}
