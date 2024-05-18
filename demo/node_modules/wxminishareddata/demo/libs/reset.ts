import reactive, { TriggerType, collect, trigger, RAW_TARGET, ITERATE_KEY, MAP_KEYS_ITERATE_KEY } from "./responsive";
/**
 * 重写数组方法
 */

let shoulCollect = true;
const arrayInstrumentations = {};

['includes', "indexOf", "lastIndexOf"].forEach((method: string) => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    let res = originMethod.apply(this, args);
    if (res === false) {
      res = originMethod.apply(this[RAW_TARGET], args)
    }
    return res;
  }
});
['push', "pop", "shift", "unshift", "splice"].forEach((method: string) => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    shoulCollect = false;
    for (let i = 0; i < args.length; i++) {
      args[i] = args[i][RAW_TARGET] || args[i];
    }
    let res = originMethod.apply(this, args);
    shoulCollect = true;
    return res;
  }
})

/**
 * 重写Set、Map相关方法
 */

const mutableInstrumentations = {
  add(key: any) {
    const target = this[RAW_TARGET];

    const rawkey = key[RAW_TARGET] || key;
    const hasKey = target.has(rawkey);
    const res = target.add(rawkey);
    if (!hasKey) {
      trigger(target, key, TriggerType.ADD)
    }
    return res;
  },
  delete(key: any) {
    const target = this[RAW_TARGET];

    const hasKey = target.has(key);

    const res = target.delete(key);
    if (hasKey) {
      trigger(target, key, TriggerType.DEL)
    }
    return res;
  },
  get(key: any) {
    const target = this[RAW_TARGET];
    const hasKey = target.has(key);

    collect(target, key)

    if (hasKey) {
      const res = target.get(key);
      return typeof res === "object" ? reactive(res) : res;
    }
  },
  set(key: any, val: any) {
    const target = this[RAW_TARGET];
    const hasKey = target.has(key);

    const oldVal = target.get(key);

    const rawVal = val[RAW_TARGET] || val;
    target.set(key, rawVal)
    if (!hasKey) {
      trigger(target, key, TriggerType.ADD)
    } else if (oldVal !== val && (oldVal === oldVal && val === val)) {
      trigger(target, key, TriggerType.SET)
    }
  },
  forEach(cb: Function, thref) {
    const target = this[RAW_TARGET];
    collect(target, ITERATE_KEY);

    const warp = (val) => {
      return typeof val === "object" && val !== null ? reactive(val) : val;
    }

    target.forEach((v, k) => {
      cb.call(thref, warp(v), warp(k), this)
    })
  },
  [Symbol.iterator]: iterationMethod(),
  entries: iterationMethod(),
  values: iterationMethod(2),
  keys: iterationMethod(3),
};

function iterationMethod(type = 1) {

  return () => {
    const target = this[RAW_TARGET];
    const itr = target[Symbol.iterator]();

    const warp = (val) => {
      return typeof val === "object" && val !== null ? reactive(val) : val;
    }

    type === 3 ? collect(target, MAP_KEYS_ITERATE_KEY) : collect(target, ITERATE_KEY);

    return {
      next() {
        const { value, done } = itr.next();
        if (type === 1) {
          return {
            value: value ? [warp(value[0]), warp[value[1]]] : value,
            done
          }
        } else if (type === 2) {
          return {
            value: value ? warp(value[0]) : value,
            done
          }
        } else if (type === 3) {
          return {
            value: warp(value),
            done
          }
        }
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  }
}


export { arrayInstrumentations, shoulCollect, mutableInstrumentations };