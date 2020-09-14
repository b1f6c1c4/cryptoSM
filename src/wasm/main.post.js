/* eslint-disable no-var */
/* eslint-disable no-undef */
/* eslint-disable camelcase */
/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-template */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-arrow-callback */

Module.onRuntimeInitialized = function () {
  function toHex(b) {
    var str = '';
    var i;
    var s;
    for (i = 0; i < b.length; i += 1) {
      s = b[i].toString(16);
      if (s.length < 2) {
        str += '0' + s;
      } else {
        str += s;
      }
    }
    return str;
  }

  function fromHex(str, b) {
    var i;
    if (str.length !== b.length * 2) {
      throw new Error('Incorrect length');
    }
    for (i = 0; i < b.length; i += 1) {
      b[i] = parseInt(str.substr(i * 2, 2), 16);
    }
  }

  function withBuffer(sz, cb) {
    var ptr = Module._malloc(sz);
    var buff;
    try {
      buff = new Uint8Array(Module.HEAPU8.buffer, ptr, sz);
      return cb(buff);
    } finally {
      Module._free(ptr);
    }
  }

  function make(m) {
    var obj;

    // template <size_t M>
    // constexpr size_t alice_size<M>()
    var alice_size = Module.ccall('_Z10alice_sizeILm' + m + 'EEmv', 'number', []);
    // template <size_t M>
    // constexpr size_t bob_size<M>()
    var bob_size = Module.ccall('_Z8bob_sizeILm' + m + 'EEmv', 'number', []);
    // template <size_t M>
    // size_t garble_size<M>()
    var garble_size = Module.ccall('_Z11garble_sizeILm' + m + 'EEmv', 'number', []);
    // template <size_t M>
    // size_t inquiry_size<M>()
    var inquiry_size = Module.ccall('_Z12inquiry_sizeILm' + m + 'EEmv', 'number', []);
    // template <size_t M>
    // size_t receive_size<M>()
    var receive_size = Module.ccall('_Z12receive_sizeILm' + m + 'EEmv', 'number', []);

    function Alice(a) {
      // template <size_t M>
      // auto alice_t<M>::create(size_t)
      this.self = Module.ccall('_ZN7alice_tILm' + m + 'EE6createEm', 'number', ['number'], [a]);
    }

    Alice.prototype.garble = function () {
      var self = this.self;
      return withBuffer(garble_size, function (buffOut) {
        // template <size_t M>
        // void alice_t<M>::garble(char *)
        Module.ccall('_ZN7alice_tILm' + m + 'EE6garbleEPh', 'null', ['number', 'number'], [self, buffOut.byteOffset]);
        return toHex(buffOut);
      });
    };

    Alice.prototype.receive = function (input) {
      var self = this.self;
      return withBuffer(inquiry_size, function (buffIn) {
        fromHex(input, buffIn);
        return withBuffer(receive_size, function (buffOut) {
          // template <size_t M>
          // void alice_t<M>::receive(const char *, char *)
          Module.ccall('_ZN7alice_tILm' + m + 'EE7receiveEPKhPh', 'null', ['number', 'number', 'number'], [self, buffIn.byteOffset, buffOut.byteOffset]);
          return toHex(buffOut);
        });
      });
    };

    Alice.prototype.remove = function () {
      // template <size_t M>
      // void alice_t<M>::remove(alice_t *)
      Module.ccall('_ZN7alice_tILm' + m + 'EE6removeEPS0_', 'void', ['number'], [this.self]);
    };

    Alice.prototype.serialize = function () {
      return this.self;
    };

    Alice.deserialize = function (v) {
      var res = Object.create(Alice.prototype);
      res.self = v;
      return res;
    };

    function Bob(b) {
      // template <size_t M>
      // auto bob_t<M>::create(size_t)
      this.self = Module.ccall('_ZN5bob_tILm' + m + 'EE6createEm', 'number', ['number'], [b]);
    }

    Bob.prototype.inquiry = function (input) {
      var self = this.self;
      return withBuffer(garble_size, function (buffIn) {
        fromHex(input, buffIn);
        return withBuffer(inquiry_size, function (buffOut) {
          // template <size_t M>
          // void bob_t<M>::inquiry(const char *, char *)
          Module.ccall('_ZN5bob_tILm' + m + 'EE7inquiryEPKhPh', 'null', ['number', 'number', 'number'], [self, buffIn.byteOffset, buffOut.byteOffset]);
          return toHex(buffOut);
        });
      });
    };

    Bob.prototype.evaluate = function (input) {
      var self = this.self;
      return withBuffer(receive_size, function (buffIn) {
        fromHex(input, buffIn);
        // template <size_t M>
        // size_t bob_t<M>::evaluate(const char *)
        return Module.ccall('_ZN5bob_tILm' + m + 'EE8evaluateEPKh', 'number', ['number', 'number'], [self, buffIn.byteOffset]);
      });
    };

    Bob.prototype.remove = function () {
      // template <size_t M>
      // void bob_t<M>::remove(bob_t *)
      Module.ccall('_ZN5bob_tILm' + m + 'EE6removeEPS0_', 'void', ['number'], [this.self]);
    };

    Bob.prototype.serialize = function () {
      return this.self;
    };

    Bob.deserialize = function (v) {
      var res = Object.create(Bob.prototype);
      res.self = v;
      return res;
    };

    obj = {};
    obj['garbleSize' + m] = garble_size;
    obj['inquirySize' + m] = inquiry_size;
    obj['receiveSize' + m] = receive_size;
    obj['Alice' + m] = Alice;
    obj['Bob' + m] = Bob;
    return obj;
  }

  Object.assign(this, make(2));
  Object.assign(this, make(4));
};
