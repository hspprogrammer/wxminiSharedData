//存储页面实例
const bucket = {};

let StoreData = null;
let StoreMutations = {};
let StoreActions = {};


export function setStoreToPage(object) {
  let setDataObj = {};
  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      const path = object[key];
      const storeDatakey = path.split('.')[0];
      let pageMap = bucket[storeDatakey];
      if (!pageMap) {
        pageMap = new Map();
        pageMap.set(this, new Set());
      }
      if (!pageMap.has(this)) {
        pageMap.set(this, new Set());
      }
      pageMap.get(this).add(key);
      bucket[storeDatakey] = pageMap;
      StoreData[storeDatakey] != null && (setDataObj[key] = StoreData[storeDatakey]);
    }
  }
  this.setData(setDataObj)
};



export function storeCommit() {
  const key = arguments[0];
  if (!key) return console.error(`请输入store的mutations名称`);
  if (StoreMutations[key]) {
    arguments[0] = StoreData;
    StoreMutations[key].apply(this, [...arguments])
  } else {
    console.error(`未找到${key},请输入store正确的mutations`)
  }
}

export function storeDispatch() {
  const key = arguments[0];
  if (!key) return console.error(`请输入store的actions名称`);
  if (StoreActions[key]) {
    arguments[0] = {
      storeCommit
    };
    StoreActions[key].apply(this, [...arguments])
  } else {
    console.error(`未找到${key},请输入store正确的actions`)
  }
}


export function destroyFn() {
  if (!StoreData) return;
  for (const key in StoreData) {
    if (Object.hasOwnProperty.call(StoreData, key)) {
      if (bucket[key] && bucket[key].has(this)) {
        bucket[key].delete(this)
      }
    }
  }
}

function Store(options) {
  if (!options['data']) options['data'] = {};
  if (!options['actions']) options['actions'] = {};

  StoreData = new Proxy(options['data'], {
    get(target, key) {
      return target[key];
    },
    set(target, key, newVal) {
      // console.log("set", key, newVal)
      if (target[key] != null) {
        target[key] = newVal;
        const pageMap = bucket[key];
        if (pageMap) {
          pageMap.forEach((keySet, page) => {
            const data = {};
            keySet.forEach((_key) => {
              data[_key] = newVal
            })
            page.setData(data)
          })
        }
        return true;
      } else {
        console.log(`Setting property '${key}' is not allowed.`);
        return false; // 如果设置不被允许，返回 false
      }
    }
  })

  StoreMutations = options['mutations'];
  StoreActions = options['actions'];

  return {
    data: StoreData,
    mutations: StoreMutations,
    actions: StoreActions,
  }
}

export default Store;