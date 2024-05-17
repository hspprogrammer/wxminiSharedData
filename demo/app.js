import "./store/index"
// import {
//   storeDispatch
// } from "wxminishareddata"
import {
  storeDispatch
} from "./libs/index";
App({
  onLaunch() {
    storeDispatch("getUserInfo");
    storeDispatch("goods/getGoodList", 111);
  },
})