import { ActiveEffect, EffectOptions } from "./types/Responsive";
import { arrayInstrumentations, shoulCollect, mutableInstrumentations } from "./reset";
import { StoreData, pageBucket } from "./store"
import { isEqualObj } from "./utils"

export enum TriggerType {
  "SET" = "SET",
  "ADD" = "ADD",
  "DEL" = "DEL"
}

const reactiveMap = new Map();

export const ITERATE_KEY = Symbol();
export const MAP_KEYS_ITERATE_KEY = Symbol();
export const RAW_TARGET = Symbol();
// 存储响应数据与副作用函数的对应关系
const effectBucket = new WeakMap();

const pageEffectMap = new WeakMap();

//临时存储副作用函数的栈
const effectStack: Array<ActiveEffect> = [];

let activeEffect: ActiveEffect | null = null;
/**
 * 注册副作用函数
 * @param {function} fn 
 * @param {effectOptions} options 
 */
export function effect(fn: Function, options?: EffectOptions) {
  const effectFn: ActiveEffect = () => {
    cleanup(effectFn)
    activeEffect = effectFn;
    effectStack.push(effectFn);
    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  }
  effectFn.options = options || {};
  effectFn.deps = new Set();

  let pageEffects: Set<ActiveEffect> = pageEffectMap.get(this);
  if (!pageEffects) {
    this && pageEffectMap.set(this, (pageEffects = new Set()))
  }
  pageEffects && pageEffects.add(effectFn);
  effectFn();
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0;
}

export function destroyDep() {
  let pageEffects: Set<ActiveEffect> = new Set(pageEffectMap.get(this) || []);
  for (const effectFn of pageEffects) {
    cleanup(effectFn)
  }
}

export function createReactive(data, isShallow = false) {
  return new Proxy(data, {
    get(target, key, receiver) {
      if (key === RAW_TARGET) {
        return target;
      }

      if (target instanceof Set || target instanceof WeakSet || target instanceof Map || target instanceof WeakMap) {
        if (key === "size") {
          collect(target, ITERATE_KEY);
          return Reflect.get(target, key, target);
        }

        return mutableInstrumentations[key] || target[key].bind(target)
      }

      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }

      const res = Reflect.get(target, key, receiver);
      if (typeof key !== "symbol") {
        collect(target, key);
      }

      if (isShallow) {
        return res;
      }

      if (typeof res === "object" && res !== null) {
        return reactive(res)
      }

      return res;
    },
    set(target, key, newVal, receiver) {
      const oldVal = target[key];
      const type = Array.isArray(target)
        ? Number(key) < target.length ? TriggerType.SET : TriggerType.ADD
        : Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD;

      newVal = newVal[RAW_TARGET] || newVal;
      const res = Reflect.set(target, key, newVal, receiver)

      if (target === receiver[RAW_TARGET]) {
        // if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
        //   trigger(target, key, type, newVal);
        // }
        if (!isEqualObj(newVal, oldVal) && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type, newVal);
        }
      }

      const pageMap = pageBucket[key];
      if (pageMap) {
        pageMap.forEach((keySet, page) => {
          const data = {};
          keySet.forEach((_key) => {
            data[_key] = newVal
          })
          page.setData(data)
        })
      }

      return res;
    },
    has(target, key) {
      collect(target, key)
      return Reflect.has(target, key)
    },
    ownKeys(target) {
      collect(target, Array.isArray(target) ? "length" : ITERATE_KEY)
      return Reflect.ownKeys(target)
    },
    deleteProperty(target, key) {
      const haskey = Object.prototype.hasOwnProperty.call(target, key);

      const res = Reflect.deleteProperty(target, key)

      if (res && haskey) {
        trigger(target, key, TriggerType.DEL, Number.MAX_SAFE_INTEGER);
      }
      return res;
    },
  })
}


// 副作用函数和数据建立映射关系
export function collect(target, key) {
  if (!activeEffect || !shoulCollect) return;
  // 获取target对应的key与副作用函数的Map
  let depsMap = effectBucket.get(target);
  if (!depsMap) {
    effectBucket.set(target, (depsMap = new Map()));
  }
  // 获取key下的副作用函数列表
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  // 将副作用函数添加进去
  deps.add(activeEffect);
  activeEffect.deps.add(deps);
}

export function trigger(target: object, key: string | symbol, type: TriggerType, newVal?) {
  let depsMap = effectBucket.get(target);
  if (!depsMap) return true;
  const effects = depsMap.get(key);

  const effectToRun: Set<ActiveEffect> = new Set();

  effects && effects.forEach((effectFn: ActiveEffect) => {
    if (effectFn != activeEffect) {
      effectToRun.add(effectFn)
    }
  })
  if (type === TriggerType.ADD || type === TriggerType.DEL || (type === TriggerType.SET && (target instanceof Map || target instanceof WeakMap))) {
    const iterateEffects = depsMap.get(ITERATE_KEY);
    iterateEffects && iterateEffects.forEach((effectFn: ActiveEffect) => {
      if (effectFn != activeEffect) {
        effectToRun.add(effectFn)
      }
    })
  }


  if (type === TriggerType.ADD || type === TriggerType.DEL || (target instanceof Map || target instanceof WeakMap)) {
    const iterateEffects = depsMap.get(MAP_KEYS_ITERATE_KEY);
    iterateEffects && iterateEffects.forEach((effectFn: ActiveEffect) => {
      if (effectFn != activeEffect) {
        effectToRun.add(effectFn)
      }
    })
  }

  if (type === TriggerType.ADD && Array.isArray(target)) {
    const lengthEffects = depsMap.get("length");
    lengthEffects && lengthEffects.forEach((effectFn: ActiveEffect) => {
      if (effectFn != activeEffect) {
        effectToRun.add(effectFn)
      }
    })
  }

  if (Array.isArray(target) && key === "length") {
    depsMap.forEach((effects, key) => {
      if (key >= newVal) {
        effects.forEach((effectFn) => {
          if (effectFn != activeEffect) {
            effectToRun.add(effectFn)
          }
        })
      }
    });
  }
  effectToRun && effectToRun.forEach(effectFn => {
    if (effectFn.options?.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  });
}

export default function reactive(obj) {

  const existionProxy = reactiveMap.get(obj);
  if (existionProxy) return existionProxy;

  const proxy = createReactive(obj)

  reactiveMap.set(obj, proxy)
  return proxy;
}
