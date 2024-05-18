Page({
  data: {
    userInfo2: {},
    goodList: []
  },
  onLoad() {
    this.$setStoreToPage({
      appName: 'appName',
      userInfo: 'userInfo'
    })

    this.$effect(() => {
      this.setData({
        userInfo2: this.$getStoreData().userInfo,
        goodList: this.$getStoreData().goods.goodList,
      })
    })
  },
  goDetail() {
    wx.navigateTo({
      url: '/pages/detail/index',
    })
  },
  changeProjectName() {
    this.$storeCommit("setAppName", "示例项目")
  },
  requestMoreFruits() {
    this.$storeDispatch("goods/getGoodList", 222);
  },
  changeUserInfo() {
    this.$storeCommit("setUserInfo", {
      name: "王五",
      age: "25"
    });
  },
  testGetter() {
    console.log(this.$storeGetters("getAppName"))
  }
})