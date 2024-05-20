import pkg from "../package.json";
import Store, { setStoreToPage, storeCommit, storeDispatch, getStoreData, storeGetters } from "./store";
import { effect } from "./responsive";
import "./resetMini";

const Version = pkg.version;
console.log("%c当前wxminiSharedData版本：" + Version, "color: red;");

export { setStoreToPage, storeCommit, storeDispatch, getStoreData, storeGetters, effect };
export default Store;
