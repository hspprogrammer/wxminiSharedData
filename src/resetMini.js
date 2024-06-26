import { setStoreToPage, storeCommit, storeDispatch, destroyFn, getStoreData, storeGetters } from "./store";
import { effect, destroyDep, onShowEffectRun } from "./responsive";

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

    if (!options["onLoad"]) options["onLoad"] = function () {};
    if (!options["onShow"]) options["onShow"] = function () {};

    const cOnLoad = options["onLoad"];
    options["onLoad"] = function () {
      this.$storeData = getStoreData();
      return cOnLoad.apply(this, [...arguments]);
    };

    const cOnShow = options["onShow"];
    options["onShow"] = function () {
      onShowEffectRun();
      return cOnShow.apply(this, [...arguments]);
    };

    if (!options["onUnload"]) options["onUnload"] = function () {};

    const cOnUnload = options["onUnload"];
    options["onUnload"] = function () {
      destroyFn.call(this);
      destroyDep.call(this);
      return cOnUnload.apply(this, [...arguments]);
    };
    cPage(options);
  };
}

function reSetComponents(StoreData) {
  // @ts-ignore
  const cComponent = Component;
  Component = (options) => {
    if (!options["methods"]) options["methods"] = {};
    options["methods"]["$setStoreToPage"] = setStoreToPage;
    options["methods"]["$storeCommit"] = storeCommit;
    options["methods"]["$storeDispatch"] = storeDispatch;
    options["methods"]["$effect"] = effect;
    options["methods"]["$getStoreData"] = getStoreData;
    options["methods"]["$storeGetters"] = storeGetters;

    if (!options["detached"]) options["detached"] = function () {};

    const cDetached = options["detached"];
    options["detached"] = function () {
      destroyFn.call(this);
      destroyDep.call(this);
      return cDetached.apply(this, [...arguments]);
    };

    cComponent(options);
  };
}

reSetPage();
reSetComponents();
