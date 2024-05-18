
Page({
  data: {
    
  },
  onLoad(){
    this.$setStoreToPage({
      appName: 'appName',
      userInfo:'userInfo'
    })
  },
  goDetail(){
    wx.navigateTo({
      url: '/pages/detail/index',
    })
  },
  changeProjectName(){
    this.$storeCommit("setAppName","示例项目")
  }
})
