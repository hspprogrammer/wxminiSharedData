// pages/detail/index.js
Page({
  data: {

  },
  onLoad(options) {
    this.$setStoreToPage({
      appName: 'appName',
      userInfo:'userInfo'
    })
  },
  change(){
    this.$storeCommit("setUserInfo",{
      name:"李四",
      age:20
    })
  }
})