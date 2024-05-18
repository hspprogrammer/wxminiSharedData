import {
  StoreOption
} from "./types/Store"
import reactive, {
  effect
} from "./responsive";
//存储页面实例
export const pageBucket = {};

let StoreModulesBucket = {};
export let StoreData: Object = {};
let StoreGettersBucket = {};
let StoreMutationsBucket = {};
let StoreActionsBucket = {};


/**
 * 
 * @param object 
 */
export function setStoreToPage(object) {
  let setDataObj = {};
  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      const path = object[key];
      const storeDatakey = path.split('.')[0];
      let pageMap = pageBucket[storeDatakey];
      if (!pageMap) {
        pageMap = new Map();
        pageMap.set(this, new Set());
      }
      if (!pageMap.has(this)) {
        pageMap.set(this, new Set());
      }
      pageMap.get(this).add(key);
      pageBucket[storeDatakey] = pageMap;
      StoreData && (StoreData[storeDatakey] != null && (setDataObj[key] = StoreData[storeDatakey]));
    }
  }
  this.setData(setDataObj)
};



export function storeGetters(key: string) {
  return StoreGettersBucket[key]();;
}

export function storeCommit() {
  const key = arguments[0];
  if (!key) return console.error(`请输入store的mutations名称`);
  if (StoreMutationsBucket[key]) {
    const keys = key.split("/");
    keys.pop();
    arguments[0] = keys.length ? keys.reduce((accumulator, currentKey) => accumulator[currentKey], StoreData) : StoreData;
    StoreMutationsBucket[key].apply(this, [...arguments])
  } else {
    console.error(`未找到${key},请输入store正确的mutations`)
  }
}

export function storeDispatch(key: string) {
  // const key = arguments[0];
  if (!key) return console.error(`请输入store的actions名称`);
  if (StoreActionsBucket[key]) {
    const keys = key.split("/");
    keys.pop();
    arguments[0] = {
      storeCommit,
      StoreData: keys.length ? keys.reduce((accumulator, currentKey) => accumulator[currentKey], StoreData) : StoreData
    };
    StoreActionsBucket[key].apply(this, [...arguments])
  } else {
    console.error(`未找到${key},请输入store正确的actions`)
  }
}


export function destroyFn() {
  if (!StoreData) return;
  for (const key in StoreData) {
    if (Object.hasOwnProperty.call(StoreData, key)) {
      if (pageBucket[key] && pageBucket[key].has(this)) {
        pageBucket[key].delete(this)
      }
    }
  }
}

function Store(options: StoreOption): void {
  const cacheGetters = {};
  if (!options['name']) options['name'] = "";
  if (!options['modules']) options['modules'] = {};
  if (!options['data']) options['data'] = {};
  if (!options['getters']) options['getters'] = {};
  if (!options['mutations']) options['mutations'] = {};
  if (!options['actions']) options['actions'] = {};
  for (const key in options['modules']) {
    const module = options['modules'][key];
    const moduleName = module.name || key;
    options['data'][moduleName] = module.data || null;
    if (module.getters) {
      for (const getterName in module.getters) {
        if (Object.prototype.hasOwnProperty.call(module.getters, getterName)) {
          options['getters'][`${moduleName}/${getterName}`] = module.getters[getterName];
        }
      }
    }
    if (module.mutations) {
      for (const mutationsName in module.mutations) {
        if (Object.prototype.hasOwnProperty.call(module.mutations, mutationsName)) {
          options['mutations'][`${moduleName}/${mutationsName}`] = module.mutations[mutationsName];
        }
      }
    }
    if (module.actions) {
      for (const actionName in module.actions) {
        if (Object.prototype.hasOwnProperty.call(module.actions, actionName)) {
          options['actions'][`${moduleName}/${actionName}`] = module.actions[actionName];
        }
      }
    }
  }

  StoreData = reactive(options['data'])

  StoreModulesBucket = options['modules'];

  for (const key in options['getters']) {
    if (Object.prototype.hasOwnProperty.call(options['getters'], key)) {
      StoreGettersBucket[key] = () => {
        if (cacheGetters[key]) return cacheGetters[key];
        effect(() => {
          delete cacheGetters[key]
          if (options['getters']) {
            cacheGetters[key] = options['getters'][key](StoreData);
          }
        })
        return cacheGetters[key];
      }

    }
  }
  StoreMutationsBucket = options['mutations'];
  StoreActionsBucket = options['actions'];
  // return {
  //   StoreData
  // };
}

export function getStoreData() {
  return StoreData;
}

export default Store;