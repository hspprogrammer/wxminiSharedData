import { ActiveEffect, EffectOptions } from "./types/Responsive";
import { arrayInstrumentations, shoulCollect, mutableInstrumentations } from "./reset";
import { pageBucket } from "./store";
import { isEqualObj } from "./utils";

let effectId = 1;

export enum TriggerType {
  "SET" = "SET",
  "ADD" = "ADD",
  "DEL" = "DEL",
}

const reactiveMap = new Map();

export const ITERATE_KEY = Symbol();
export const MAP_KEYS_ITERATE_KEY = Symbol();
export const RAW_TARGET = Symbol();
// 存储响应数据与副作用函数的对应关系
const effectBucket = new WeakMap();
//缓存页面中所有的副作用函数，以便于页面销毁时清除
const pageEffectMap = new WeakMap();
// 缓存应该在onshow中调用的副作用函数
export const effectRunAtOnShowMap = new WeakMap();

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
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };
  effectFn.options = options || { lazy: true };
  effectFn.deps = [];
  // @ts-ignore
  const currentpage = getCurrentPages()[0];
  effectFn.page = currentpage;
  effectFn._id = effectId;
  effectId++;

  let pageEffects: Array<ActiveEffect> = pageEffectMap.get(this);
  if (!pageEffects) {
    this && pageEffectMap.set(this, (pageEffects = []));
  }
  pageEffects && pageEffects.push(effectFn);

  if (options && options.scheduler) {
    options.scheduler(effectFn);
  } else {
    effectFn();
  }
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

export function destroyDep() {
  let pageEffects: Array<ActiveEffect> = pageEffectMap.get(this) || [];
  for (let i = 0; i < pageEffects.length; i++) {
    cleanup(pageEffects[i]);
  }
  pageEffects.length = 0;
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

        return mutableInstrumentations[key] || target[key].bind(target);
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
        return reactive(res);
      }

      return res;
    },
    set(target, key, newVal, receiver) {
      const oldVal = target[key];
      const type = Array.isArray(target)
        ? Number(key) < target.length
          ? TriggerType.SET
          : TriggerType.ADD
        : Object.prototype.hasOwnProperty.call(target, key)
        ? TriggerType.SET
        : TriggerType.ADD;

      newVal = newVal[RAW_TARGET] || newVal;
      const res = Reflect.set(target, key, newVal, receiver);

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
            data[_key] = newVal;
          });
          page.setData(data);
        });
      }

      return res;
    },
    has(target, key) {
      collect(target, key);
      return Reflect.has(target, key);
    },
    ownKeys(target) {
      collect(target, Array.isArray(target) ? "length" : ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    deleteProperty(target, key) {
      const haskey = Object.prototype.hasOwnProperty.call(target, key);

      const res = Reflect.deleteProperty(target, key);

      if (res && haskey) {
        trigger(target, key, TriggerType.DEL, Number.MAX_SAFE_INTEGER);
      }
      return res;
    },
  });
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
  activeEffect.deps.push(deps);
}

export function trigger(target: object, key: string | symbol, type: TriggerType, newVal?) {
  let depsMap = effectBucket.get(target);
  if (!depsMap) return true;
  const effects = depsMap.get(key);

  const effectToRun: Set<ActiveEffect> = new Set();

  effects &&
    effects.forEach((effectFn: ActiveEffect) => {
      if (effectFn != activeEffect) {
        effectToRun.add(effectFn);
      }
    });
  if (type === TriggerType.ADD || type === TriggerType.DEL || (type === TriggerType.SET && (target instanceof Map || target instanceof WeakMap))) {
    const iterateEffects = depsMap.get(ITERATE_KEY);
    iterateEffects &&
      iterateEffects.forEach((effectFn: ActiveEffect) => {
        if (effectFn != activeEffect) {
          effectToRun.add(effectFn);
        }
      });
  }

  if (type === TriggerType.ADD || type === TriggerType.DEL || target instanceof Map || target instanceof WeakMap) {
    const iterateEffects = depsMap.get(MAP_KEYS_ITERATE_KEY);
    iterateEffects &&
      iterateEffects.forEach((effectFn: ActiveEffect) => {
        if (effectFn != activeEffect) {
          effectToRun.add(effectFn);
        }
      });
  }

  if (type === TriggerType.ADD && Array.isArray(target)) {
    const lengthEffects = depsMap.get("length");
    lengthEffects &&
      lengthEffects.forEach((effectFn: ActiveEffect) => {
        if (effectFn != activeEffect) {
          effectToRun.add(effectFn);
        }
      });
  }

  if (Array.isArray(target) && key === "length") {
    depsMap.forEach((effects, key) => {
      if (key >= newVal) {
        effects.forEach((effectFn) => {
          if (effectFn != activeEffect) {
            effectToRun.add(effectFn);
          }
        });
      }
    });
  }
  // @ts-ignore
  const currentpage = getCurrentPages()[0];
  effectToRun &&
    effectToRun.forEach((effectFn) => {
      if (effectFn.options.lazy) {
        if (effectFn.page === currentpage) {
          if (effectFn.options?.scheduler) {
            effectFn.options.scheduler(effectFn);
          } else {
            effectFn();
          }
        } else {
          let effectSet = effectRunAtOnShowMap.get(effectFn.page);
          if (!effectSet) {
            effectRunAtOnShowMap.set(effectFn.page, (effectSet = new Set()));
          }
          effectSet.add(effectFn);
        }
      } else {
        if (effectFn.options?.scheduler) {
          effectFn.options.scheduler(effectFn);
        } else {
          effectFn();
        }
      }
    });
}

export default function reactive(obj) {
  const existionProxy = reactiveMap.get(obj);
  if (existionProxy) return existionProxy;

  const proxy = createReactive(obj);

  reactiveMap.set(obj, proxy);
  return proxy;
}
// 在onShow中执行effect
export function onShowEffectRun() {
  // @ts-ignore
  const currentpage = getCurrentPages()[0];
  const effectSet = effectRunAtOnShowMap.get(currentpage) || [];
  [...effectSet].forEach((effectFn) => {
    if (effectFn.options?.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn();
    }
  });
}
