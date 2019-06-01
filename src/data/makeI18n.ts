import _set from 'lodash/set';

function make(target, obj, path) {
  if (obj === null || obj === undefined) {
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((o) => { make(target, o, path); });
    return;
  }
  if (typeof obj === 'object') {
    Object.entries(obj).forEach(([k, v]) => {
      make(target, v, path === '' ? k : path + '.' + k);
    });
    return;
  }
  _set(target, path, obj);
}

export default function makeI18n(obj) {
  const translation = {};
  make(translation, obj, '');
  delete translation.Language;
  return { translation };
}
