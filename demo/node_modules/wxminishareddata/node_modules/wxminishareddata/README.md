# wxminishareddata

[![NPM version](https://img.shields.io/npm/v/wxminishareddata.svg)](https://www.npmjs.com/package/wxminishareddata)
[![License](https://img.shields.io/npm/l/wxminishareddata.svg)](https://www.npmjs.com/package/wxminishareddata)

一个基于原生小程序的 mini 轻量全局状态管理库，跨页面/组件数据共享渲染。

- 全局状态 data 支持所有 Page 和 Component。
- 类似 Vuex 的使用
- 适合原生小程序，即使后期引入，也只需增加几行代码。
- 目前为第一版，很粗糙，但也可以满足一般的共享状态需求

## 更新日志

### 1.0.0

\[2024.5.13\] : 1.0.0

### 导航

- [全局状态开始](#start)
  - [安装及引入](#start-1)
  - [使用方式](#start-2)
- [总结及建议](#end)

## <div id="start">开始</div>

在开始前，你可以 clone 或下载本项目，用微信开发工具打开 demo 目录来查看效果。

### <div id="start-1">1.安装及引入</div>

目前有两种引入方式：

#### npm

首先你需要 npm init 在项目目录下生成 package.json 后，再进行安装。

```cmd
npm init
npm install wxminishareddata -S
```

然后在微信小程序右上角详情中勾选 `使用npm模块`。  
 接着选择左上角 工具-构建 npm。
这样你就可以在项目中导入了。

#### 直接引用

如果不太熟悉 npm 没关系，你可以将本项目中 lib/index.js 复制到你的项目中，并在`app.js第一行`引入：

```js
// /store/index.js中 例如
// import Store from "wxminishareddata"; 替换成
import Store from "你存放index.js的路径";
...
```

### <div id="start-2">2.使用方式</div>

#### 初始化

首先声明 Store 的实例，这里使用了单例，所以最好不要实例化多次，因为后面实例化的参数不会处理。

```js
// /store/index.js中 例如
import Store from "wxminishareddata"; //直接引用的话 替换成import Store from "你存放index.js的路径";

export default new Store({
  data: {
    appName: "实例项目",
    userInfo: {},
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
    async getUserInfo({ storeCommit }) {
      setTimeout(() => {
        storeCommit("setUserInfo", {
          name: "张三",
          age: 18,
        });
      }, 1500);
    },
  },
});
```

我们现在设置了两个全局状态，一个是 appName 的字符串，一个是 userInfo 的对象。同时我们还设置了一个异步请求用来请求用户信息，mutations 里设置了两个修改 data 的方法。这里和使用 Vuex 非常相似，如果你比较熟悉 Vuex，那么你将很容易上手。

#### app.js 中使用

接下来我们还要在 app.js 中引入，如果同时需要调用异步方法，需要导入 storeDispatch 方法。如果要修改全局的 data,请导入 storeCommit，通过 storeCommit 方法调用 mutations 达到修改 data 的目的

```js
// app.js 中
import "./store/index";
import { storeDispatch, storeCommit } from "wxminishareddata"; //这里是模拟一进入小程序就请求用户信息
App({
  onLaunch() {
    storeDispatch("getUserInfo");
    // storeCommit("setUserInfo",{
    //   name:"李四",
    //   age:20
    // })
  },
});
```

#### 页面或者组件中使用

在页面或者组件中，可以 this.$setStoreToPage 方法将全局中的数据加载到页面或者组件的 data 中，其中 key 为在页面或组件 data 的 key,值为字符串，对应 store 里 data 的的 key，目前不支持使用"userInfo.name"这种形式取值。后续版本会完善。

```js
this.$setStoreToPage({
  appName: "appName",
  userInfo: "userInfo",
});
```

如果要修改全局状态，请使用 this.$storeCommit(key,value)调用 store 里 mutations 中定义的方法，具体使用方法如下，这里我们重新设置了全局中 userInfo 的值，设置完会自动更新所有使用到 userInfo 的页面。

```js
this.$storeCommit("setUserInfo", {
  name: "李四",
  age: 20,
});
```

调用全局的异步方法 使用 this.$storeDispatch(name,...val),name 为 actions 里的方法名，传参依次传入。

```js
this.$storeDispatch("getUserInfo");
```

## <div id="end">总结和建议</div>

最近也是在写原生微信小程序中使用 storage 共享状态时，维护和更新不同页面需要太多的精力去做，所以花了一下午写了这个非常粗糙的方案。后续打算借鉴 Vue3 的响应式，重新实现。

大家有使用上的问题或者想法可以发邮件给我 [联系我](hspprogrammer@163.com) hspprogrammer@163.com 最后欢迎来我的 [github](https://github.com/hspprogrammer/wxminiSharedData#readme) 点个小星星
