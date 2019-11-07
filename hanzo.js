var Hanzo = (function () {
  'use strict';

  // node_modules/es-tostring/index.mjs
  function toString(obj) {
    return Object.prototype.toString.call(obj)
  }

  // node_modules/es-is/function.js
  // Generated by CoffeeScript 1.12.5
  var isFunction;

  var isFunction$1 = isFunction = function(value) {
    var str;
    if (typeof window !== 'undefined' && value === window.alert) {
      return true;
    }
    str = toString(value);
    return str === '[object Function]' || str === '[object GeneratorFunction]' || str === '[object AsyncFunction]';
  };

  // node_modules/es-is/string.js

  // src/utils.coffee
  var updateParam;

  var statusOk = function(res) {
    return res.status === 200;
  };

  var statusCreated = function(res) {
    return res.status === 201;
  };

  var GET = 'GET';

  var POST = 'POST';

  var PATCH = 'PATCH';

  var newError = function(data, res, err) {
    var message, ref, ref1, ref2, ref3, ref4;
    if (res == null) {
      res = {};
    }
    message = (ref = (ref1 = res.data) != null ? (ref2 = ref1.error) != null ? ref2.message : void 0 : void 0) != null ? ref : 'Request failed';
    if (err == null) {
      err = new Error(message);
    }
    err.data = res.data;
    err.msg = message;
    err.req = data;
    err.responseText = res.data;
    err.status = res.status;
    err.type = (ref3 = res.data) != null ? (ref4 = ref3.error) != null ? ref4.type : void 0 : void 0;
    return err;
  };

  updateParam = function(url, key, value) {
    var hash, re, separator;
    re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi');
    if (re.test(url)) {
      if (value != null) {
        return url.replace(re, '$1' + key + '=' + value + '$2$3');
      } else {
        hash = url.split('#');
        url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
        if (hash[1] != null) {
          url += '#' + hash[1];
        }
        return url;
      }
    } else {
      if (value != null) {
        separator = url.indexOf('?') !== -1 ? '&' : '?';
        hash = url.split('#');
        url = hash[0] + separator + key + '=' + value;
        if (hash[1] != null) {
          url += '#' + hash[1];
        }
        return url;
      } else {
        return url;
      }
    }
  };

  var updateQuery = function(url, data) {
    var k, v;
    if (typeof data !== 'object') {
      return url;
    }
    for (k in data) {
      v = data[k];
      url = updateParam(url, k, v);
    }
    return url;
  };

  // src/api.coffee
  var Api;

  Api = (function() {
    Api.BLUEPRINTS = {};

    Api.CLIENT = null;

    function Api(opts) {
      var blueprints, client, k, v;
      if (opts == null) {
        opts = {};
      }
      if (!(this instanceof Api)) {
        return new Api(opts);
      }
      blueprints = opts.blueprints, client = opts.client;
      this.client = client || new this.constructor.CLIENT(opts);
      if (blueprints == null) {
        blueprints = this.constructor.BLUEPRINTS;
      }
      for (k in blueprints) {
        v = blueprints[k];
        this.addBlueprints(k, v);
      }
    }

    Api.prototype.addBlueprints = function(api, blueprints) {
      var bp, name;
      if (this[api] == null) {
        this[api] = {};
      }
      for (name in blueprints) {
        bp = blueprints[name];
        this.addBlueprint(api, name, bp);
      }
    };

    Api.prototype.addBlueprint = function(api, name, bp) {
      var method;
      if (isFunction$1(bp)) {
        return this[api][name] = (function(_this) {
          return function() {
            return bp.apply(_this, arguments);
          };
        })(this);
      }
      if (bp.expects == null) {
        bp.expects = statusOk;
      }
      if (bp.method == null) {
        bp.method = GET;
      }
      method = (function(_this) {
        return function(data, cb) {
          var key;
          key = void 0;
          if (bp.useCustomerToken) {
            key = _this.client.getCustomerToken();
          }
          return _this.client.request(bp, data, key).then(function(res) {
            var ref, ref1;
            if (((ref = res.data) != null ? ref.error : void 0) != null) {
              throw newError(data, res);
            }
            if (!bp.expects(res)) {
              throw newError(data, res);
            }
            if (bp.process != null) {
              bp.process.call(_this, res);
            }
            return (ref1 = res.data) != null ? ref1 : res.body;
          }).callback(cb);
        };
      })(this);
      return this[api][name] = method;
    };

    Api.prototype.setKey = function(key) {
      return this.client.setKey(key);
    };

    Api.prototype.setCustomerToken = function(key) {
      return this.client.setCustomerToken(key);
    };

    Api.prototype.getCustomerToken = function() {
      return this.client.getCustomerToken();
    };

    Api.prototype.deleteCustomerToken = function() {
      return this.client.deleteCustomerToken();
    };

    Api.prototype.setStore = function(id) {
      this.storeId = id;
      return this.client.setStore(id);
    };

    return Api;

  })();

  var Api$1 = Api;

  // node_modules/broken/lib/broken.mjs
  // src/promise-inspection.coffee
  var PromiseInspection;

  var PromiseInspection$1 = PromiseInspection = (function() {
    function PromiseInspection(arg) {
      this.state = arg.state, this.value = arg.value, this.reason = arg.reason;
    }

    PromiseInspection.prototype.isFulfilled = function() {
      return this.state === 'fulfilled';
    };

    PromiseInspection.prototype.isRejected = function() {
      return this.state === 'rejected';
    };

    return PromiseInspection;

  })();

  // src/utils.coffee
  var _undefined$1 = void 0;

  var _undefinedString$1 = 'undefined';

  // src/soon.coffee
  var soon;

  soon = (function() {
    var bufferSize, callQueue, cqYield, fq, fqStart;
    fq = [];
    fqStart = 0;
    bufferSize = 1024;
    callQueue = function() {
      var err;
      while (fq.length - fqStart) {
        try {
          fq[fqStart]();
        } catch (error) {
          err = error;
          if (typeof console !== 'undefined') {
            console.error(err);
          }
        }
        fq[fqStart++] = _undefined$1;
        if (fqStart === bufferSize) {
          fq.splice(0, bufferSize);
          fqStart = 0;
        }
      }
    };
    cqYield = (function() {
      var dd, mo;
      if (typeof MutationObserver !== _undefinedString$1) {
        dd = document.createElement('div');
        mo = new MutationObserver(callQueue);
        mo.observe(dd, {
          attributes: true
        });
        return function() {
          dd.setAttribute('a', 0);
        };
      }
      if (typeof setImmediate !== _undefinedString$1) {
        return function() {
          setImmediate(callQueue);
        };
      }
      return function() {
        setTimeout(callQueue, 0);
      };
    })();
    return function(fn) {
      fq.push(fn);
      if (fq.length - fqStart === 1) {
        cqYield();
      }
    };
  })();

  var soon$1 = soon;

  // src/promise.coffee
  var Promise$1;
  var STATE_FULFILLED;
  var STATE_PENDING;
  var STATE_REJECTED;
  var _undefined;
  var rejectClient;
  var resolveClient;

  _undefined = void 0;

  STATE_PENDING = _undefined;

  STATE_FULFILLED = 'fulfilled';

  STATE_REJECTED = 'rejected';

  resolveClient = function(c, arg) {
    var err, yret;
    if (typeof c.y === 'function') {
      try {
        yret = c.y.call(_undefined, arg);
        c.p.resolve(yret);
      } catch (error) {
        err = error;
        c.p.reject(err);
      }
    } else {
      c.p.resolve(arg);
    }
  };

  rejectClient = function(c, reason) {
    var err, yret;
    if (typeof c.n === 'function') {
      try {
        yret = c.n.call(_undefined, reason);
        c.p.resolve(yret);
      } catch (error) {
        err = error;
        c.p.reject(err);
      }
    } else {
      c.p.reject(reason);
    }
  };

  Promise$1 = (function() {
    function Promise(fn) {
      if (fn) {
        fn((function(_this) {
          return function(arg) {
            return _this.resolve(arg);
          };
        })(this), (function(_this) {
          return function(arg) {
            return _this.reject(arg);
          };
        })(this));
      }
    }

    Promise.prototype.resolve = function(value) {
      var clients, err, first, next;
      if (this.state !== STATE_PENDING) {
        return;
      }
      if (value === this) {
        return this.reject(new TypeError('Attempt to resolve promise with self'));
      }
      if (value && (typeof value === 'function' || typeof value === 'object')) {
        try {
          first = true;
          next = value.then;
          if (typeof next === 'function') {
            next.call(value, (function(_this) {
              return function(ra) {
                if (first) {
                  if (first) {
                    first = false;
                  }
                  _this.resolve(ra);
                }
              };
            })(this), (function(_this) {
              return function(rr) {
                if (first) {
                  first = false;
                  _this.reject(rr);
                }
              };
            })(this));
            return;
          }
        } catch (error) {
          err = error;
          if (first) {
            this.reject(err);
          }
          return;
        }
      }
      this.state = STATE_FULFILLED;
      this.v = value;
      if (clients = this.c) {
        soon$1((function(_this) {
          return function() {
            var c, i, len;
            for (i = 0, len = clients.length; i < len; i++) {
              c = clients[i];
              resolveClient(c, value);
            }
          };
        })(this));
      }
    };

    Promise.prototype.reject = function(reason) {
      var clients;
      if (this.state !== STATE_PENDING) {
        return;
      }
      this.state = STATE_REJECTED;
      this.v = reason;
      if (clients = this.c) {
        soon$1(function() {
          var c, i, len;
          for (i = 0, len = clients.length; i < len; i++) {
            c = clients[i];
            rejectClient(c, reason);
          }
        });
      } else if (!Promise.suppressUncaughtRejectionError && typeof console !== 'undefined') {
        console.log('Broken Promise, please catch rejections: ', reason, reason ? reason.stack : null);
      }
    };

    Promise.prototype.then = function(onFulfilled, onRejected) {
      var a, client, p, s;
      p = new Promise;
      client = {
        y: onFulfilled,
        n: onRejected,
        p: p
      };
      if (this.state === STATE_PENDING) {
        if (this.c) {
          this.c.push(client);
        } else {
          this.c = [client];
        }
      } else {
        s = this.state;
        a = this.v;
        soon$1(function() {
          if (s === STATE_FULFILLED) {
            resolveClient(client, a);
          } else {
            rejectClient(client, a);
          }
        });
      }
      return p;
    };

    Promise.prototype["catch"] = function(cfn) {
      return this.then(null, cfn);
    };

    Promise.prototype["finally"] = function(cfn) {
      return this.then(cfn, cfn);
    };

    Promise.prototype.timeout = function(ms, msg) {
      msg = msg || 'timeout';
      return new Promise((function(_this) {
        return function(resolve, reject) {
          setTimeout(function() {
            return reject(Error(msg));
          }, ms);
          _this.then(function(val) {
            resolve(val);
          }, function(err) {
            reject(err);
          });
        };
      })(this));
    };

    Promise.prototype.callback = function(cb) {
      if (typeof cb === 'function') {
        this.then(function(val) {
          return cb(null, val);
        });
        this["catch"](function(err) {
          return cb(err, null);
        });
      }
      return this;
    };

    return Promise;

  })();

  var Promise$2 = Promise$1;

  // src/helpers.coffee
  var resolve = function(val) {
    var z;
    z = new Promise$2;
    z.resolve(val);
    return z;
  };

  var reject = function(err) {
    var z;
    z = new Promise$2;
    z.reject(err);
    return z;
  };

  var all = function(ps) {
    var i, j, len, p, rc, resolvePromise, results, retP;
    results = [];
    rc = 0;
    retP = new Promise$2();
    resolvePromise = function(p, i) {
      if (!p || typeof p.then !== 'function') {
        p = resolve(p);
      }
      p.then(function(yv) {
        results[i] = yv;
        rc++;
        if (rc === ps.length) {
          retP.resolve(results);
        }
      }, function(nv) {
        retP.reject(nv);
      });
    };
    for (i = j = 0, len = ps.length; j < len; i = ++j) {
      p = ps[i];
      resolvePromise(p, i);
    }
    if (!ps.length) {
      retP.resolve(results);
    }
    return retP;
  };

  var reflect = function(promise) {
    return new Promise$2(function(resolve, reject) {
      return promise.then(function(value) {
        return resolve(new PromiseInspection$1({
          state: 'fulfilled',
          value: value
        }));
      })["catch"](function(err) {
        return resolve(new PromiseInspection$1({
          state: 'rejected',
          reason: err
        }));
      });
    });
  };

  var settle = function(promises) {
    return all(promises.map(reflect));
  };

  // src/index.coffee
  Promise$2.all = all;

  Promise$2.reflect = reflect;

  Promise$2.reject = reject;

  Promise$2.resolve = resolve;

  Promise$2.settle = settle;

  Promise$2.soon = soon$1;

  // node_modules/es-object-assign/lib/es-object-assign.mjs
  // src/index.coffee
  var getOwnSymbols;
  var objectAssign;
  var shouldUseNative;
  var toObject;
  var slice = [].slice;

  getOwnSymbols = Object.getOwnPropertySymbols;

  toObject = function(val) {
    if (val === null || val === void 0) {
      throw new TypeError('Object.assign cannot be called with null or undefined');
    }
    return Object(val);
  };

  shouldUseNative = function() {
    var i, j, k, len, letter, order2, ref, test1, test2, test3;
    try {
      if (!Object.assign) {
        return false;
      }
      test1 = new String('abc');
      test1[5] = 'de';
      if (Object.getOwnPropertyNames(test1)[0] === '5') {
        return false;
      }
      test2 = {};
      for (i = j = 0; j <= 9; i = ++j) {
        test2['_' + String.fromCharCode(i)] = i;
      }
      order2 = Object.getOwnPropertyNames(test2).map(function(n) {
        return test2[n];
      });
      if (order2.join('') !== '0123456789') {
        return false;
      }
      test3 = {};
      ref = 'abcdefghijklmnopqrst'.split('');
      for (k = 0, len = ref.length; k < len; k++) {
        letter = ref[k];
        test3[letter] = letter;
      }
      if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  var index = objectAssign = (function() {
    if (shouldUseNative()) {
      return Object.assign;
    }
    return function() {
      var from, j, k, key, len, len1, ref, source, sources, symbol, target, to;
      target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      to = toObject(target);
      for (j = 0, len = sources.length; j < len; j++) {
        source = sources[j];
        from = Object(source);
        for (key in from) {
          if (Object.prototype.hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }
        if (getOwnSymbols) {
          ref = getOwnSymbols(from);
          for (k = 0, len1 = ref.length; k < len1; k++) {
            symbol = ref[k];
            if (Object.prototype.propIsEnumerable.call(from, symbol)) {
              to[symbol] = from[symbol];
            }
          }
        }
      }
      return to;
    };
  })();

  // node_modules/es-xhr-promise/lib/es-xhr-promise.mjs

  // src/parse-headers.coffee
  var isArray;
  var parseHeaders;
  var trim;

  trim = function(s) {
    return s.replace(/^\s*|\s*$/g, '');
  };

  isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  var parseHeaders$1 = parseHeaders = function(headers) {
    var i, index$$1, key, len, ref, result, row, value;
    if (!headers) {
      return {};
    }
    result = {};
    ref = trim(headers).split('\n');
    for (i = 0, len = ref.length; i < len; i++) {
      row = ref[i];
      index$$1 = row.indexOf(':');
      key = trim(row.slice(0, index$$1)).toLowerCase();
      value = trim(row.slice(index$$1 + 1));
      if (typeof result[key] === 'undefined') {
        result[key] = value;
      } else if (isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
      return;
    }
    return result;
  };

  // src/index.coffee

  /*
   * Copyright 2015 Scott Brady
   * MIT License
   * https://github.com/scottbrady/xhr-promise/blob/master/LICENSE
   */
  var XhrPromise;
  var defaults;

  defaults = {
    method: 'GET',
    headers: {},
    data: null,
    username: null,
    password: null,
    async: true
  };


  /*
   * Module to wrap an XhrPromise in a promise.
   */

  XhrPromise = (function() {
    function XhrPromise() {}

    XhrPromise.DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8';

    XhrPromise.Promise = Promise$2;


    /*
     * XhrPromise.send(options) -> Promise
     * - options (Object): URL, method, data, etc.
     *
     * Create the XHR object and wire up event handlers to use a promise.
     */

    XhrPromise.prototype.send = function(options) {
      if (options == null) {
        options = {};
      }
      options = index({}, defaults, options);
      return new Promise$2((function(_this) {
        return function(resolve, reject) {
          var e, header, ref, value, xhr;
          if (!XMLHttpRequest) {
            _this._handleError('browser', reject, null, "browser doesn't support XMLHttpRequest");
            return;
          }
          if (typeof options.url !== 'string' || options.url.length === 0) {
            _this._handleError('url', reject, null, 'URL is a required parameter');
            return;
          }
          _this._xhr = xhr = new XMLHttpRequest();
          xhr.onload = function() {
            var responseText;
            _this._detachWindowUnload();
            try {
              responseText = _this._getResponseText();
            } catch (error) {
              _this._handleError('parse', reject, null, 'invalid JSON response');
              return;
            }
            return resolve({
              url: _this._getResponseUrl(),
              headers: _this._getHeaders(),
              responseText: responseText,
              status: xhr.status,
              statusText: xhr.statusText,
              xhr: xhr
            });
          };
          xhr.onerror = function() {
            return _this._handleError('error', reject);
          };
          xhr.ontimeout = function() {
            return _this._handleError('timeout', reject);
          };
          xhr.onabort = function() {
            return _this._handleError('abort', reject);
          };
          _this._attachWindowUnload();
          xhr.open(options.method, options.url, options.async, options.username, options.password);
          if ((options.data != null) && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = _this.constructor.DEFAULT_CONTENT_TYPE;
          }
          ref = options.headers;
          for (header in ref) {
            value = ref[header];
            xhr.setRequestHeader(header, value);
          }
          try {
            return xhr.send(options.data);
          } catch (error) {
            e = error;
            return _this._handleError('send', reject, null, e.toString());
          }
        };
      })(this));
    };


    /*
     * XhrPromise.getXHR() -> XhrPromise
     */

    XhrPromise.prototype.getXHR = function() {
      return this._xhr;
    };


    /*
     * XhrPromise._attachWindowUnload()
     *
     * Fix for IE 9 and IE 10
     * Internet Explorer freezes when you close a webpage during an XHR request
     * https://support.microsoft.com/kb/2856746
     *
     */

    XhrPromise.prototype._attachWindowUnload = function() {
      this._unloadHandler = this._handleWindowUnload.bind(this);
      if (window.attachEvent) {
        return window.attachEvent('onunload', this._unloadHandler);
      }
    };


    /*
     * XhrPromise._detachWindowUnload()
     */

    XhrPromise.prototype._detachWindowUnload = function() {
      if (window.detachEvent) {
        return window.detachEvent('onunload', this._unloadHandler);
      }
    };


    /*
     * XhrPromise._getHeaders() -> Object
     */

    XhrPromise.prototype._getHeaders = function() {
      return parseHeaders$1(this._xhr.getAllResponseHeaders());
    };


    /*
     * XhrPromise._getResponseText() -> Mixed
     *
     * Parses response text JSON if present.
     */

    XhrPromise.prototype._getResponseText = function() {
      var responseText;
      responseText = typeof this._xhr.responseText === 'string' ? this._xhr.responseText : '';
      switch (this._xhr.getResponseHeader('Content-Type')) {
        case 'application/json':
        case 'text/javascript':
          responseText = JSON.parse(responseText + '');
      }
      return responseText;
    };


    /*
     * XhrPromise._getResponseUrl() -> String
     *
     * Actual response URL after following redirects.
     */

    XhrPromise.prototype._getResponseUrl = function() {
      if (this._xhr.responseURL != null) {
        return this._xhr.responseURL;
      }
      if (/^X-Request-URL:/m.test(this._xhr.getAllResponseHeaders())) {
        return this._xhr.getResponseHeader('X-Request-URL');
      }
      return '';
    };


    /*
     * XhrPromise._handleError(reason, reject, status, statusText)
     * - reason (String)
     * - reject (Function)
     * - status (String)
     * - statusText (String)
     */

    XhrPromise.prototype._handleError = function(reason, reject, status, statusText) {
      this._detachWindowUnload();
      return reject({
        reason: reason,
        status: status || this._xhr.status,
        statusText: statusText || this._xhr.statusText,
        xhr: this._xhr
      });
    };


    /*
     * XhrPromise._handleWindowUnload()
     */

    XhrPromise.prototype._handleWindowUnload = function() {
      return this._xhr.abort();
    };

    return XhrPromise;

  })();

  var XhrPromise$1 = XhrPromise;

  // node_modules/es-is/number.js
  // Generated by CoffeeScript 1.12.5
  var isNumber;

  var isNumber$1 = isNumber = function(value) {
    return toString(value) === '[object Number]';
  };

  // node_modules/es-cookies/lib/cookies.mjs

  // src/cookies.coffee
  var Cookies;

  Cookies = (function() {
    function Cookies(defaults) {
      this.defaults = defaults != null ? defaults : {};
      this.get = (function(_this) {
        return function(key) {
          return _this.read(key);
        };
      })(this);
      this.getJSON = (function(_this) {
        return function(key) {
          try {
            return JSON.parse(_this.read(key));
          } catch (error) {
            return {};
          }
        };
      })(this);
      this.remove = (function(_this) {
        return function(key, attrs) {
          return _this.write(key, '', index({
            expires: -1
          }, attrs));
        };
      })(this);
      this.set = (function(_this) {
        return function(key, value, attrs) {
          return _this.write(key, value, attrs);
        };
      })(this);
    }

    Cookies.prototype.read = function(key) {
      var cookie, cookies, i, kv, len, name, parts, rdecode, result;
      if (!key) {
        result = {};
      }
      cookies = document.cookie ? document.cookie.split('; ') : [];
      rdecode = /(%[0-9A-Z]{2})+/g;
      for (i = 0, len = cookies.length; i < len; i++) {
        kv = cookies[i];
        parts = kv.split('=');
        cookie = parts.slice(1).join('=');
        if (cookie.charAt(0) === '"') {
          cookie = cookie.slice(1, -1);
        }
        try {
          name = parts[0].replace(rdecode, decodeURIComponent);
          cookie = cookie.replace(rdecode, decodeURIComponent);
          if (key === name) {
            return cookie;
          }
          if (!key) {
            result[name] = cookie;
          }
        } catch (error) {
        }
      }
      return result;
    };

    Cookies.prototype.write = function(key, value, attrs) {
      var attr, expires, name, result, strAttrs;
      attrs = index({
        path: '/'
      }, this.defaults, attrs);
      if (isNumber$1(attrs.expires)) {
        expires = new Date;
        expires.setMilliseconds(expires.getMilliseconds() + attrs.expires * 864e+5);
        attrs.expires = expires;
      }
      attrs.expires = attrs.expires ? attrs.expires.toUTCString() : '';
      try {
        result = JSON.stringify(value);
        if (/^[\{\[]/.test(result)) {
          value = result;
        }
      } catch (error) {
      }
      value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
      key = encodeURIComponent(String(key));
      key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
      key = key.replace(/[\(\)]/g, escape);
      strAttrs = '';
      for (name in attrs) {
        attr = attrs[name];
        if (!attr) {
          continue;
        }
        strAttrs += '; ' + name;
        if (attr === true) {
          continue;
        }
        strAttrs += '=' + attr;
      }
      return document.cookie = key + '=' + value + strAttrs;
    };

    return Cookies;

  })();

  var Cookies$1 = Cookies;

  // src/index.coffee
  var index$1 = new Cookies$1();

  // src/client/client.coffee
  var Client,
    slice$1 = [].slice;

  Client = (function() {
    function Client(opts) {
      var k, v;
      if (opts == null) {
        opts = {};
      }
      this.opts = {
        debug: false,
        endpoint: 'https://api.hanzo.io',
        session: {
          name: 'hzo',
          expires: 7 * 24 * 3600 * 1000
        }
      };
      for (k in opts) {
        v = opts[k];
        this.opts[k] = v;
      }
    }

    Client.prototype.getKey = function() {
      return this.opts.key;
    };

    Client.prototype.setKey = function(key) {
      return this.opts.key = key;
    };

    Client.prototype.getCustomerToken = function() {
      var session;
      if ((session = index$1.getJSON(this.opts.session.name)) != null) {
        if (session.customerToken != null) {
          this.customerToken = session.customerToken;
        }
      }
      return this.customerToken;
    };

    Client.prototype.setCustomerToken = function(key) {
      index$1.set(this.opts.session.name, {
        customerToken: key
      }, {
        expires: this.opts.session.expires
      });
      return this.customerToken = key;
    };

    Client.prototype.deleteCustomerToken = function() {
      index$1.set(this.opts.session.name, {
        customerToken: null
      }, {
        expires: this.opts.session.expires
      });
      return this.customerToken = null;
    };

    Client.prototype.url = function(url, data, key) {
      if (isFunction$1(url)) {
        url = url.call(this, data);
      }
      return updateQuery(this.opts.endpoint + url, {
        token: key
      });
    };

    Client.prototype.log = function() {
      var args;
      args = 1 <= arguments.length ? slice$1.call(arguments, 0) : [];
      args.unshift('hanzo.js>');
      if (this.opts.debug && (typeof console !== "undefined" && console !== null)) {
        return console.log.apply(console, args);
      }
    };

    return Client;

  })();

  var Client$1 = Client;

  // src/client/browser.coffee
  var BrowserClient,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BrowserClient = (function(superClass) {
    extend(BrowserClient, superClass);

    function BrowserClient(opts) {
      BrowserClient.__super__.constructor.call(this, opts);
      if (!(this instanceof BrowserClient)) {
        return new BrowserClient(opts);
      }
      this.getCustomerToken();
    }

    BrowserClient.prototype.request = function(blueprint, data, key) {
      var opts;
      if (data == null) {
        data = {};
      }
      if (key == null) {
        key = this.getKey();
      }
      opts = {
        url: this.url(blueprint.url, data, key),
        method: blueprint.method
      };
      if (blueprint.method !== 'GET') {
        opts.headers = {
          'Content-Type': 'application/json'
        };
      }
      if (blueprint.method === 'GET') {
        opts.url = updateQuery(opts.url, data);
      } else {
        opts.data = JSON.stringify(data);
      }
      this.log('request', {
        key: key,
        opts: opts
      });
      return (new XhrPromise$1).send(opts).then((function(_this) {
        return function(res) {
          _this.log('response', res);
          res.data = res.responseText;
          return res;
        };
      })(this))["catch"]((function(_this) {
        return function(res) {
          var err, ref;
          try {
            res.data = (ref = res.responseText) != null ? ref : JSON.parse(res.xhr.responseText);
          } catch (error) {
            err = error;
          }
          err = newError(data, res, err);
          _this.log('response', res);
          _this.log('error', err);
          throw err;
        };
      })(this));
    };

    return BrowserClient;

  })(Client$1);

  var Client$2 = BrowserClient;

  // src/blueprints/url.coffee
  var sp;

  var storePrefixed = sp = function(u) {
    return function(x) {
      var url;
      if (isFunction$1(u)) {
        url = u(x);
      } else {
        url = u;
      }
      if (this.storeId != null) {
        return ("/store/" + this.storeId) + url;
      } else {
        return url;
      }
    };
  };

  var byId = function(name) {
    switch (name) {
      case 'coupon':
        return sp(function(x) {
          var ref;
          return "/coupon/" + ((ref = x.code) != null ? ref : x);
        });
      case 'collection':
        return sp(function(x) {
          var ref;
          return "/collection/" + ((ref = x.slug) != null ? ref : x);
        });
      case 'product':
        return sp(function(x) {
          var ref, ref1;
          return "/product/" + ((ref = (ref1 = x.id) != null ? ref1 : x.slug) != null ? ref : x);
        });
      case 'variant':
        return sp(function(x) {
          var ref, ref1;
          return "/variant/" + ((ref = (ref1 = x.id) != null ? ref1 : x.sku) != null ? ref : x);
        });
      case 'site':
        return function(x) {
          var ref, ref1;
          return "/site/" + ((ref = (ref1 = x.id) != null ? ref1 : x.name) != null ? ref : x);
        };
      default:
        return function(x) {
          var ref;
          return "/" + name + "/" + ((ref = x.id) != null ? ref : x);
        };
    }
  };

  // src/blueprints/browser.coffee
  var blueprints, createBlueprint, fn, fn1, i, j, len, len1, marketingModels, model, models;

  createBlueprint = function(name) {
    var endpoint;
    endpoint = "/" + name;
    return {
      list: {
        url: endpoint,
        method: GET,
        expects: statusOk
      },
      get: {
        url: byId(name),
        method: GET,
        expects: statusOk
      }
    };
  };

  blueprints = {
    library: {
      shopjs: {
        url: '/library/shopjs',
        method: POST,
        expects: statusOk
      }
    },
    account: {
      get: {
        url: '/account',
        method: GET,
        expects: statusOk,
        useCustomerToken: true
      },
      update: {
        url: '/account',
        method: PATCH,
        expects: statusOk,
        useCustomerToken: true
      },
      exists: {
        url: function(x) {
          var ref, ref1, ref2;
          return "/account/exists/" + ((ref = (ref1 = (ref2 = x.email) != null ? ref2 : x.username) != null ? ref1 : x.id) != null ? ref : x);
        },
        method: GET,
        expects: statusOk,
        process: function(res) {
          return res.data.exists;
        }
      },
      create: {
        url: '/account/create',
        method: POST,
        expects: statusCreated
      },
      enable: {
        url: function(x) {
          var ref;
          return "/account/enable/" + ((ref = x.tokenId) != null ? ref : x);
        },
        method: POST,
        expects: statusOk
      },
      login: {
        url: '/account/login',
        method: POST,
        expects: statusOk,
        process: function(res) {
          this.setCustomerToken(res.data.token);
          return res;
        }
      },
      logout: function() {
        return this.deleteCustomerToken();
      },
      reset: {
        url: '/account/reset',
        method: POST,
        expects: statusOk,
        useCustomerToken: true
      },
      updateOrder: {
        url: function(x) {
          var ref, ref1;
          return "/account/order/" + ((ref = (ref1 = x.orderId) != null ? ref1 : x.id) != null ? ref : x);
        },
        method: PATCH,
        expects: statusOk,
        useCustomerToken: true
      },
      confirm: {
        url: function(x) {
          var ref;
          return "/account/confirm/" + ((ref = x.tokenId) != null ? ref : x);
        },
        method: POST,
        expects: statusOk,
        useCustomerToken: true
      },
      paymentMethod: {
        url: function(x) {
          return "/account/paymentmethod/" + x.type;
        },
        method: POST,
        expects: statusCreated,
        useCustomerToken: true
      }
    },
    cart: {
      create: {
        url: '/cart',
        method: POST,
        expects: statusCreated
      },
      update: {
        url: function(x) {
          var ref;
          return "/cart/" + ((ref = x.id) != null ? ref : x);
        },
        method: PATCH,
        expects: statusOk
      },
      discard: {
        url: function(x) {
          var ref;
          return "/cart/" + ((ref = x.id) != null ? ref : x) + "/discard";
        },
        method: POST,
        expects: statusOk
      },
      set: {
        url: function(x) {
          var ref;
          return "/cart/" + ((ref = x.id) != null ? ref : x) + "/set";
        },
        method: POST,
        expects: statusOk
      }
    },
    review: {
      create: {
        url: '/review',
        method: POST,
        expects: statusCreated
      },
      get: {
        url: function(x) {
          var ref;
          return "/review/" + ((ref = x.id) != null ? ref : x);
        },
        method: GET,
        expects: statusOk
      }
    },
    checkout: {
      authorize: {
        url: storePrefixed('/checkout/authorize'),
        method: POST,
        expects: statusOk
      },
      capture: {
        url: storePrefixed(function(x) {
          var ref;
          return "/checkout/capture/" + ((ref = x.orderId) != null ? ref : x);
        }),
        method: POST,
        expects: statusOk
      },
      charge: {
        url: storePrefixed('/checkout/charge'),
        method: POST,
        expects: statusOk
      },
      paypal: {
        url: storePrefixed('/checkout/paypal'),
        method: POST,
        expects: statusOk
      }
    },
    referrer: {
      create: {
        url: '/referrer',
        method: POST,
        expects: statusCreated
      },
      get: {
        url: function(x) {
          var ref;
          return "/referrer/" + ((ref = x.id) != null ? ref : x);
        },
        method: GET,
        expects: statusOk
      }
    },
    marketing: {
      create: {
        url: '/marketing',
        method: POST,
        expects: statusCreated
      }
    }
  };

  models = ['collection', 'coupon', 'product', 'variant', 'movie', 'watchlist', 'copy', 'media'];

  fn = function(model) {
    return blueprints[model] = createBlueprint(model);
  };
  for (i = 0, len = models.length; i < len; i++) {
    model = models[i];
    fn(model);
  }

  marketingModels = ['adcampaign', 'adconfig', 'adset', 'ad'];

  fn1 = function(model) {
    return blueprints[model] = createBlueprint("marketing/" + model);
  };
  for (j = 0, len1 = marketingModels.length; j < len1; j++) {
    model = marketingModels[j];
    fn1(model);
  }

  var blueprints$1 = blueprints;

  // src/browser.coffee
  var Hanzo;

  Api$1.BLUEPRINTS = blueprints$1;

  Api$1.CLIENT = Client$2;

  Hanzo = function(opts) {
    if (opts == null) {
      opts = {};
    }
    if (opts.client == null) {
      opts.client = new Client$2(opts);
    }
    if (opts.blueprints == null) {
      opts.blueprints = blueprints$1;
    }
    return new Api$1(opts);
  };

  Hanzo.Api = Api$1;

  Hanzo.Client = Client$2;

  var Hanzo$1 = Hanzo;

  return Hanzo$1;

}());
//# sourceMappingURL=hanzo.js.map
