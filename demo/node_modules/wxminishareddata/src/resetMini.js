import {
  setStoreToPage,
  storeCommit,
  storeDispatch,
  destroyFn,
  getStoreData,
  storeGetters
} from "./store"
import {
  effect,
  destroyDep
} from "./responsive";

function reSetPage() {
  // @ts-ignore
  const cPage = Page;
  Page = (options) => {
    options["$setStoreToPage"] = setStoreToPage;
    options["$storeCommit"] = storeCommit;
    options["$storeDispatch"] = storeDispatch;
    options["$effect"] = effect;
    options["$getStoreData"] = getStoreData;
    options["$storeGetters"] = storeGetters;

    if (!options['onLoad']) options['onLoad'] = function () {};

    const cOnLoad = options['onLoad'];
    options['onLoad'] = function () {
      this.$storeData = getStoreData();
      return cOnLoad.apply(this, [...arguments]);
    }


    if (!options['onUnload']) options['onUnload'] = function () {};

    const cOnUnload = options['onUnload'];
    options['onUnload'] = function () {
      destroyFn.call(this);
      destroyDep.call(this);
      return cOnUnload.apply(this, [...arguments]);
    }
    cPage(options);
  }
}

function reSetComponents(StoreData) {
  // @ts-ignore
  const cComponent = Component;
  Component = (options) => {
    if (!options["methods"]) options["methods"] = {};
    options["methods"]["$setStoreToPage"] = setStoreToPage;
    options["methods"]["$storeCommit"] = storeCommit;
    options["methods"]["$storeDispatch"] = storeDispatch;
    options["$effect"] = effect;
    options["$getStoreData"] = getStoreData;

    if (!options['detached']) options['detached'] = function () {};

    const cDetached = options['detached'];
    options['detached'] = function () {
      destroyFn.call(this);
      destroyDep.call(this);
      return cDetached.apply(this, [...arguments]);
    }

    cComponent(options);
  }
}

reSetPage();
reSetComponents();