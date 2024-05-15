import "./store/index"
import {storeDispatch} from "wxminishareddata"
App({
  onLaunch() {
    storeDispatch("getUserInfo");
  },
})
