let loader;
const loadModule = () => {
  if (loader) return loader;
  if (process.env.NODE_ENV === 'production') {
    self.Module = {
      locateFile: (url, base) => `${base}bin/${url}`,
    };
    importScripts('bin/garble.js');
    const old = self.Module.onRuntimeInitialized;
    return loader = new Promise((resolve) => {
      self.Module.onRuntimeInitialized = function () {
        old.apply(this, arguments);
        resolve(this);
      };
    });
  } else if (process.env.NODE_ENV === 'preview') {
    self.Module = {
      locateFile: (url, base) => `http://localhost:1235/${url}`,
    };
    require('../bin/garble-patch.js');
    const old = self.Module.onRuntimeInitialized;
    return loader = new Promise((resolve) => {
      self.Module.onRuntimeInitialized = function () {
        old.apply(this, arguments);
        resolve(this);
      };
    });
  } else {
    class Alice4 {
      constructor(v) { this.v = v; }
      garble = () => '--garble--';
      receive = () => '--receive' + this.v;
      remove = () => {};
      serialize = () => ''+this.v;
      static deserialize = (v) => new Alice4(+v);
    }
    class Bob4 {
      constructor(v) { this.v = v; }
      inquiry = () => '--inquiry-';
      evaluate = (r) => Math.min(this.v, parseInt(r.substr(9), 10));
      remove = () => {};
      serialize = () => ''+this.v;
      static deserialize = (v) => new Bob4(+v);
    }
    return loader = Promise.resolve({
      garbleSize4: 5,
      inquirySize4: 5,
      receiveSize4: 5,
      Alice4,
      Bob4,
    });
  }
};

let insts = [];

onmessage = function({ data }) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Worker message:', data);
  }
  const t0 = +new Date();
  loadModule().then((Module) => {
    let res;
    switch (data.cmd) {
      case 'alice-garble':
        if (insts[data.id]) insts[data.id].remove();
        insts[data.id] = new Module.Alice4(data.v);
        res = insts[data.id].garble();
        break;
      case 'bob-init':
        if (insts[data.id]) insts[data.id].remove();
        insts[data.id] = new Module.Bob4(data.v);
        break;
      case 'bob-inquiry':
        res = [data.str.substr(Module.garbleSize4 * 2)];
        res.push(insts[data.id].inquiry(data.str.substr(0, Module.garbleSize4 * 2)));
        break;
      case 'alice-receive':
        res = [data.str.substr(Module.inquirySize4 * 2)];
        res.push(insts[data.id].receive(data.str.substr(0, Module.inquirySize4 * 2)));
        break;
      case 'bob-evaluate':
        res = [data.str.substr(Module.receiveSize4 * 2)];
        res.push(insts[data.id].evaluate(data.str.substr(0, Module.receiveSize4 * 2)));
        if (res[1] === -1) res[1] = NaN;
        break;
      case 'remove':
        insts.forEach((x) => x.remove());
        insts = [];
        break;
      case 'serialize':
        res = JSON.stringify(insts.map((x) => x.serialize()));
        break;
      case 'alice-deserialize':
        insts = JSON.parse(data.str).map((s) => Module.Alice4.deserialize(s));
        res = null;
        break;
      case 'bob-deserialize':
        insts = JSON.parse(data.str).map((s) => Module.Bob4.deserialize(s));
        res = null;
        break;
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('Worker done:', res);
    }
    const t1 = +new Date();
    let tmin = 0;
    if (process.env.NODE_ENV === 'production') {
      tmin = 20;
    } else if (process.env.NODE_ENV === 'preview') {
      tmin = 20;
    }
    if (t1 > t0 + tmin) {
      postMessage(res);
    } else {
      setTimeout(postMessage, tmin - (t1 - t0), res);
    }
  }).catch((e) => {
    console.error(e);
  });
};
