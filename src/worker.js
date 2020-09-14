let loader;
const loadModule = (serializedState) => {
  if (loader) return loader;
  const patchWasm = (fun) => {
    self.Module.wasmMemory = new WebAssembly.Memory({
      initial: 10,
      maximum: 10,
    });
    if (serializedState) {
      self.Module.noInitialRun = true;
    }
    fun();
    const old = self.Module.onRuntimeInitialized;
    self.Module.serialize = () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('mem length:', self.Module.wasmMemory.buffer.byteLength);
      }
      return self.Module.wasmMemory.buffer;
    };
    return loader = new Promise((resolve) => {
      self.Module.onRuntimeInitialized = function () {
        if (serializedState) {
          const len = self.Module.wasmMemory.buffer.byteLength;
          new Uint8Array(self.Module.wasmMemory.buffer, 0, len).set(
            new Uint8Array(serializedState),
          );
        }
        old.apply(this, arguments);
        resolve(this);
      };
    });
  };
  if (process.env.NODE_ENV === 'production') {
    self.Module = {
      locateFile: (url, base) => `${base}bin/${url}`,
    };
    return patchWasm(() => {
      importScripts('bin/garble.js');
    });
  } else if (process.env.NODE_ENV === 'preview') {
    self.Module = {
      locateFile: (url, base) => `http://localhost:1235/${url}`,
    };
    return patchWasm(() => {
      require('../bin/garble-patch.js');
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
      serialize: () => null,
    });
  }
};

let insts = [];

onmessage = function({ data }) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Worker message:', data);
  }
  const t0 = +new Date();
  loadModule(data.ss && data.ss.mem).then((Module) => {
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
        res = {
          mem: Module.serialize(),
          insts: insts.map((x) => x.serialize()),
        };
        break;
      case 'alice-deserialize':
        insts = data.ss.insts.map((s) => Module.Alice4.deserialize(s));
        res = null;
        break;
      case 'bob-deserialize':
        insts = data.ss.insts.map((s) => Module.Bob4.deserialize(s));
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
