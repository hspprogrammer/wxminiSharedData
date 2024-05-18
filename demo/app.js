import "./store/index"
import {
  storeDispatch
} from "wxminishareddata"
App({
  onLaunch() {
    storeDispatch("getUserInfo");
    storeDispatch("goods/getGoodList", 111);
  },
})