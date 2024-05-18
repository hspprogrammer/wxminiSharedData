var t = {
    d: (e, o) => {
      for (var n in o) t.o(o, n) && !t.o(e, n) && Object.defineProperty(e, n, {
        enumerable: !0,
        get: o[n]
      })
    },
    o: (t, e) => Object.prototype.hasOwnProperty.call(t, e)
  },
  e = {};
t.d(e, {
  Ay: () => I,
  gk: () => M,
  Jv: () => L,
  IX: () => T
});
let o = !0;
const n = {};
["includes", "indexOf", "lastIndexOf"].forEach((t => {
  const e = Array.prototype[t];
  n[t] = function (...t) {
    let o = e.apply(this, t);
    return !1 === o && (o = e.apply(this[u], t)), o
  }
})), ["push", "pop", "shift", "unshift", "splice"].forEach((t => {
  const e = Array.prototype[t];
  n[t] = function (...t) {
    o = !1;
    for (let e = 0; e < t.length; e++) t[e] = t[e][u] || t[e];
    let n = e.apply(this, t);
    return o = !0, n
  }
}));
const r = {
  add(t) {
    const e = this[u],
      o = t[u] || t,
      n = e.has(o),
      r = e.add(o);
    return n || E(e, t, c.ADD), r
  },
  delete(t) {
    const e = this[u],
      o = e.has(t),
      n = e.delete(t);
    return o && E(e, t, c.DEL), n
  },
  get(t) {
    const e = this[u],
      o = e.has(t);
    if (A(e, t), o) {
      const o = e.get(t);
      return "object" == typeof o ? S(o) : o
    }
  },
  set(t, e) {
    const o = this[u],
      n = o.has(t),
      r = o.get(t),
      s = e[u] || e;
    o.set(t, s), n ? r !== e && r == r && e == e && E(o, t, c.SET) : E(o, t, c.ADD)
  },
  forEach(t, e) {
    const o = this[u];
    A(o, l);
    const n = t => "object" == typeof t && null !== t ? S(t) : t;
    o.forEach(((o, r) => {
      t.call(e, n(o), n(r), this)
    }))
  },
  [Symbol.iterator]: s(),
  entries: s(),
  values: s(2),
  keys: s(3)
};

function s(t = 1) {
  return () => {
    const e = this[u],
      o = e[Symbol.iterator](),
      n = t => "object" == typeof t && null !== t ? S(t) : t;
    return A(e, 3 === t ? f : l), {
      next() {
        const {
          value: e,
          done: r
        } = o.next();
        return 1 === t ? {
          value: e ? [n(e[0]), n[e[1]]] : e,
          done: r
        } : 2 === t ? {
          value: e ? n(e[0]) : e,
          done: r
        } : 3 === t ? {
          value: n(e),
          done: r
        } : void 0
      },
      [Symbol.iterator]() {
        return this
      }
    }
  }
}

function a(t, e) {
  if (typeof t != typeof e) return !1;
  if ("object" != typeof t || null === t || null === e) return t === e;
  const o = Object.keys(t),
    n = Object.keys(e);
  if (o.length !== n.length) return !1;
  for (let n of o)
    if (!a(t[n], e[n])) return !1;
  return !0
}
var c;
! function (t) {
  t.SET = "SET", t.ADD = "ADD", t.DEL = "DEL"
}(c || (c = {}));
const i = new Map,
  l = Symbol(),
  f = Symbol(),
  u = Symbol(),
  p = new WeakMap,
  h = new WeakMap,
  d = [];
let y = null;

function g(t, e) {
  const o = () => {
    m(o), y = o, d.push(o), t(), d.pop(), y = d[d.length - 1]
  };
  o.options = e || {}, o.deps = [];
  let n = h.get(this);
  n || this && h.set(this, n = []), n && n.push(o), e && e.scheduler ? e.scheduler(o) : o()
}

function m(t) {
  for (let e = 0; e < t.deps.length; e++) t.deps[e].delete(t);
  t.deps.length = 0
}

function D() {
  let t = h.get(this);
  for (let e = 0; e < t.length; e++) m(t[e]);
  t.length = 0
}

function b(t, e = !1) {
  return new Proxy(t, {
    get(t, o, s) {
      if (o === u) return t;
      if (t instanceof Set || t instanceof WeakSet || t instanceof Map || t instanceof WeakMap) return "size" === o ? (A(t, l), Reflect.get(t, o, t)) : r[o] || t[o].bind(t);
      if (Array.isArray(t) && n.hasOwnProperty(o)) return Reflect.get(n, o, s);
      const a = Reflect.get(t, o, s);
      return "symbol" != typeof o && A(t, o), e ? a : "object" == typeof a && null !== a ? S(a) : a
    },
    set(t, e, o, n) {
      const r = t[e],
        s = Array.isArray(t) ? Number(e) < t.length ? c.SET : c.ADD : Object.prototype.hasOwnProperty.call(t, e) ? c.SET : c.ADD;
      o = o[u] || o;
      const i = Reflect.set(t, e, o, n);
      t === n[u] && (a(o, r) || r != r && o != o || E(t, e, s, o));
      const l = O[e];
      return l && l.forEach(((t, e) => {
        const n = {};
        t.forEach((t => {
          n[t] = o
        })), e.setData(n)
      })), i
    },
    has: (t, e) => (A(t, e), Reflect.has(t, e)),
    ownKeys: t => (A(t, Array.isArray(t) ? "length" : l), Reflect.ownKeys(t)),
    deleteProperty(t, e) {
      const o = Object.prototype.hasOwnProperty.call(t, e),
        n = Reflect.deleteProperty(t, e);
      return n && o && E(t, e, c.DEL, Number.MAX_SAFE_INTEGER), n
    }
  })
}

function A(t, e) {
  if (!y || !o) return;
  let n = p.get(t);
  n || p.set(t, n = new Map);
  let r = n.get(e);
  r || n.set(e, r = new Set), r.add(y), y.deps.push(r)
}

function E(t, e, o, n) {
  let r = p.get(t);
  if (!r) return !0;
  const s = r.get(e),
    a = new Set;
  if (s && s.forEach((t => {
      t != y && a.add(t)
    })), o === c.ADD || o === c.DEL || o === c.SET && (t instanceof Map || t instanceof WeakMap)) {
    const t = r.get(l);
    t && t.forEach((t => {
      t != y && a.add(t)
    }))
  }
  if (o === c.ADD || o === c.DEL || t instanceof Map || t instanceof WeakMap) {
    const t = r.get(f);
    t && t.forEach((t => {
      t != y && a.add(t)
    }))
  }
  if (o === c.ADD && Array.isArray(t)) {
    const t = r.get("length");
    t && t.forEach((t => {
      t != y && a.add(t)
    }))
  }
  Array.isArray(t) && "length" === e && r.forEach(((t, e) => {
    e >= n && t.forEach((t => {
      t != y && a.add(t)
    }))
  })), a && a.forEach((t => {
    var e;
    (null === (e = t.options) || void 0 === e ? void 0 : e.scheduler) ? t.options.scheduler(t): t()
  }))
}

function S(t) {
  const e = i.get(t);
  if (e) return e;
  const o = b(t);
  return i.set(t, o), o
}
const O = {};
let w = {},
  $ = {},
  v = {},
  P = {},
  j = {};

function M(t) {
  let e = {};
  for (const o in t)
    if (Object.hasOwnProperty.call(t, o)) {
      const n = t[o].split(".")[0];
      let r = O[n];
      r || (r = new Map, r.set(this, new Set)), r.has(this) || r.set(this, new Set), r.get(this).add(o), O[n] = r, $ && null != $[n] && (e[o] = $[n])
    } this.setData(e)
}

function k(t) {
  return v[t]()
}

function L() {
  const t = arguments[0];
  if (!t) return console.error("请输入store的mutations名称");
  if (P[t]) {
    const e = t.split("/");
    e.pop(), arguments[0] = e.length ? e.reduce(((t, e) => t[e]), $) : $, P[t].apply(this, [...arguments])
  } else console.error(`未找到${t},请输入store正确的mutations`)
}

function T(t) {
  if (!t) return console.error("请输入store的actions名称");
  if (j[t]) {
    const e = t.split("/");
    e.pop(), arguments[0] = {
      storeCommit: L,
      StoreData: e.length ? e.reduce(((t, e) => t[e]), $) : $
    }, j[t].apply(this, [...arguments])
  } else console.error(`未找到${t},请输入store正确的actions`)
}

function R() {
  if ($)
    for (const t in $) Object.hasOwnProperty.call($, t) && O[t] && O[t].has(this) && O[t].delete(this)
}

function x() {
  return $
}
var C, W;
C = Page, Page = function (t) {
  t.$setStoreToPage = M, t.$storeCommit = L, t.$storeDispatch = T, t.$effect = g, t.$getStoreData = x, t.$storeGetters = k, t.onLoad || (t.onLoad = function () {});
  var e = t.onLoad;
  t.onLoad = function () {
    return this.$storeData = x(), e.apply(this, Array.prototype.slice.call(arguments))
  }, t.onUnload || (t.onUnload = function () {});
  var o = t.onUnload;
  t.onUnload = function () {
    return R.call(this), D.call(this), o.apply(this, Array.prototype.slice.call(arguments))
  }, C(t)
}, W = Component, Component = function (t) {
  t.methods || (t.methods = {}), t.methods.$setStoreToPage = M, t.methods.$storeCommit = L, t.methods.$storeDispatch = T, t.$effect = g, t.$getStoreData = x, t.detached || (t.detached = function () {});
  var e = t.detached;
  t.detached = function () {
    return R.call(this), D.call(this), e.apply(this, Array.prototype.slice.call(arguments))
  }, W(t)
}, console.log("%c当前wxminiSharedData版本：2.0.0", "color: red;");
const I = function (t) {
  const e = {};
  t.name || (t.name = ""), t.modules || (t.modules = {}), t.data || (t.data = {}), t.getters || (t.getters = {}), t.mutations || (t.mutations = {}), t.actions || (t.actions = {});
  for (const e in t.modules) {
    const o = t.modules[e],
      n = o.name || e;
    if (t.data[n] = o.data || null, o.getters)
      for (const e in o.getters) Object.prototype.hasOwnProperty.call(o.getters, e) && (t.getters[`${n}/${e}`] = o.getters[e]);
    if (o.mutations)
      for (const e in o.mutations) Object.prototype.hasOwnProperty.call(o.mutations, e) && (t.mutations[`${n}/${e}`] = o.mutations[e]);
    if (o.actions)
      for (const e in o.actions) Object.prototype.hasOwnProperty.call(o.actions, e) && (t.actions[`${n}/${e}`] = o.actions[e])
  }
  $ = S(t.data), w = t.modules;
  for (const o in t.getters) Object.prototype.hasOwnProperty.call(t.getters, o) && (v[o] = () => (e[o] || g((() => {
    delete e[o], t.getters && (e[o] = t.getters[o]($))
  })), e[o]));
  P = t.mutations, j = t.actions
};
var U = e.Ay,
  N = e.gk,
  X = e.Jv,
  G = e.IX;
export {
  U as
  default, N as setStoreToPage, X as storeCommit, G as storeDispatch
};