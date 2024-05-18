import {
  setStoreToPage,
  storeCommit,
  storeDispatch,
  destroyFn
} from "./store"

function reSetPage() {
  const cPage = Page;
  Page = (options) => {
    options["$setStoreToPage"] = setStoreToPage;
    options["$storeCommit"] = storeCommit;
    options["$storeDispatch"] = storeDispatch;

    if (!options['onUnload']) options['onUnload'] = function () {};

    const cOnUnload = options['onUnload'];
    options['onUnload'] = function () {
      destroyFn.call(this);
      return cOnUnload.apply(this, [...arguments]);
    }

    cPage(options);
  }
}

function reSetComponents() {
  const cComponent = Component;
  Component = (options) => {
    if (!options["methods"]) options["methods"] = {};
    options["methods"]["$setStoreToPage"] = setStoreToPage;
    options["methods"]["$storeCommit"] = storeCommit;
    options["methods"]["$storeDispatch"] = storeDispatch;

    if (!options['detached']) options['detached'] = function () {};

    const cDetached = options['detached'];
    options['detached'] = function () {
      destroyFn.call(this);
      return cDetached.apply(this, [...arguments]);
    }

    cComponent(options);
  }
}
reSetPage();
reSetComponents();