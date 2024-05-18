Page({
  data: {

  },
  onLoad(options) {
    this.$effect(() => {
      console.log("detail")
      this.setData({
        userInfo: this.$getStoreData().userInfo
      })
    }, {
      scheduler: (fn) => {
        console.log("打印调度器,延迟1秒执行")
        setTimeout(() => {
          fn()
        }, 1000);
      }
    })


  },
  change() {
    this.$storeCommit("setUserInfo", {
      name: "李四",
      age: 20
    })
  }
})