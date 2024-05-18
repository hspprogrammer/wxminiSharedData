import Store from "wxminishareddata";

export default new Store({
	data:{
		appName:"实例项目",
		userInfo:{},
	},
	mutations:{
		setAppName(data,val){
			data.appName = val;
		},
		setUserInfo(data,val){
			data.userInfo = val;
		},
	},
	actions:{
	 async getUserInfo ({storeCommit}){
			setTimeout(()=>{
				storeCommit("setUserInfo",{
					name:"张三",
					age:18
				});
			},1500)
		}
	}
})