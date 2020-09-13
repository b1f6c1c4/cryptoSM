if (process.env.NODE_ENV === 'production') {
  Module = {
    locateFile: (url) => `bin/${url}`,
  };
  importScripts('bin/garble.js');
  const old = Module.onRuntimeInitialized;
  Module.finish = new Promise((resolve) => {
    Module.onRuntimeInitialized = function () {
      old.apply(this, arguments);
      resolve();
    };
  });
} else {
  class Alice4 {
    constructor(v) { this.v = v; }
    garble = () => '--garble--';
    receive = () => '--receive' + this.v;
    remove = () => {};
  }
  class Bob4 {
    constructor(v) { this.v = v; }
    inquiry = () => '--inquiry-';
    evaluate = (r) => Math.min(this.v, parseInt(r.substr(9), 10));
    remove = () => {};
  }
  Module = {
    finish: Promise.resolve(),
    garbleSize4: 5,
    inquirySize4: 5,
    receiveSize4: 5,
    Alice4,
    Bob4,
  };
}

const insts = [];

onmessage = function({ data }) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Worker message:', data);
  }
  Module.finish.then(() => {
    let res;
    switch (data.cmd) {
      case 'alice-garble':
        insts[data.id] = new Module.Alice4(data.v);
        res = insts[data.id].garble();
        break;
      case 'bob-prepare':
        insts[data.id] = new Module.Bob4(data.v);
        res = null;
        break;
      case 'bob-inquiry':
        res = [data.str.substr(Module.garbleSize4 * 2)];
        res.push(insts[data.id].inquiry(data.str.substr(0, Module.garbleSize4 * 2)));
        break;
      case 'alice-receive':
        res = [data.str.substr(Module.inquirySize4 * 2)];
        res.push(insts[data.id].receive(data.str.substr(0, Module.inquirySize4 * 2)));
        insts[data.id].remove();
        delete insts[data.id];
        break;
      case 'bob-evaluate':
        res = [data.str.substr(Module.receiveSize4 * 2)];
        res.push(insts[data.id].evaluate(data.str.substr(0, Module.receiveSize4 * 2)));
        if (res[1] === -1) res[1] = NaN;
        insts[data.id].remove();
        delete insts[data.id];
        break;
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('Worker done:', res);
    }
    postMessage(res);
  });
};
