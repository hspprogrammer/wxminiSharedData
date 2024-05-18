export default {
  name: "goods",
  data: {
    goodList: []
  },
  getters: {
    getGoodNum: data => data.length,
  },
  mutations: {
    setGoodList(data, val) {
      data.goodList = val;
    }
  },
  actions: {
    async getGoodList({
      storeCommit,
      StoreData
    }, params) {
      console.log("入参", params, StoreData)
      setTimeout(() => {
        console.log("dispatch获取商品列表")
        storeCommit("goods/setGoodList", [...StoreData.goodList, {
          name: "苹果"
        }, {
          name: "香蕉"
        }, {
          name: "橘子"
        }]);
      }, 500);
    }
  }
}