// import Store from "wxminishareddata";
// import Store from "../libs/index";
import Store from "../libs/test";
import goods from "./modules/goods"

new Store({
	modules: {
		goods
	},
	data: {
		appName: "实例项目",
		userInfo: {},
	},
	getters: {
		getAppName: (data: { appName: string; }) => {
			console.log("getter执行了")
			return "我的名字" + data.appName
		}
	},
	mutations: {
		setAppName(data, val) {
			data.appName = val;
		},
		setUserInfo(data, val) {
			data.userInfo = val;
		},
	},
	actions: {
		async getUserInfo({
			storeCommit
		}) {
			setTimeout(() => {
				console.log("dispatch获取用户信息")
				storeCommit("setUserInfo", {
					name: "张三",
					age: 18
				});
			}, 1500)
		}
	}
})