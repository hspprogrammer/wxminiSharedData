import pkg from "../package.json";
import Store, {
	setStoreToPage,
	storeCommit,
	storeDispatch
} from "./store";
import "./reset";

const Version = pkg.version;
console.log("%c当前wxminiSharedData版本：" + Version, 'color: red;');

export {
	setStoreToPage,
	storeCommit,
	storeDispatch
}
export default Store;