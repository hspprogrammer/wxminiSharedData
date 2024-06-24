# wxminishareddata [![NPM version](https://img.shields.io/npm/v/wxminishareddata.svg)](https://www.npmjs.com/package/wxminishareddata) [![License](https://img.shields.io/npm/l/wxminishareddata.svg)](https://www.npmjs.com/package/wxminishareddata)

一个基于原生小程序的 mini 轻量全局状态管理库，跨页面/组件数据共享渲染。

- 全局状态 data 支持所有 Page 和 Component。
- 类似 Vuex 的使用
- 适合原生小程序，即使后期引入，也只需增加几行代码。
- 支持 Store 模块化配置

### 导航

- [全局状态开始](#start)
  - [安装及引入](#start-1)
  - [使用方式](#start-2)
  - [API](#api)
    - [setStoreToPage](#api-1)
    - [effect](#api-2)
    - [storeCommit](#api-3)
    - [getStoreData](#api-4)
    - [storeGetters](#api-5)
    - [storeDispatch](#api-6)
- [总结及建议](#end)
- [更新日志](#log)

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

```js
// /store/index.js中 例如
import Store from "wxminishareddata"; //直接引用的话 替换成import Store from "你存放index.js的路径";
import goods from "./modules/goods";

export default new Store({
  modules: {
    goods,
  },
  data: {
    appName: "实例项目",
    userInfo: {},
  },
  getters: {
    getAppName: (data: { appName: string }) => {
      console.log("getter执行了");
      return "我的名字" + data.appName;
    },
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
        console.log("dispatch获取用户信息");
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
App({
  onLaunch() {},
});
```

### <div id="api">3.常用 Api</div>

以下的 api 都是可以在 Page 或者 Component 中以 this.$xxx 的形式调用的，如果要在其他地方使用，请直接从包中引用。

#### <div id="api-1">setStoreToPage</div>

1.0 版本中使用的 api，主要作用是将 Store 里的数据加载到页面或者组件的 data 中，并在全局建立起 Page 或者 Component 与 Store 的对应关系，在 Store 发生改变时，取出 Page 或者 Component，直接调用 setData 触发页面更新。如下

```js
...
onLoad(){
  this.$setStoreToPage({
    appName: "appName",
    userInfo: "userInfo",
  });
}
...
```

key 对应的是页面 data 里的 key,value 对应的是 Store 里的数据。

#### <div id="api-2">effect</div>

2.0 版本中生成全局状态的副作用函数，使用方法如下

```js
this.$effect(
  () => {
    console.log("detail");
    this.setData({
      userInfo: this.$getStoreData().userInfo,
    });
  },
  {
    scheduler: (fn) => {
      console.log("打印调度器,延迟1秒执行");
      setTimeout(() => {
        fn();
      }, 1000);
    },
    lazy: true,
  }
);
```

effect 函数有两个参数,第一个参数是一个回调函数，第二个函数是一个 options 对象，可传入 scheduler，用于自己控制 effect 函数的执行。
| options 属性 | 类型 | 描述 |
| :----- | :------: | -----: |
| scheduler | Function | 入参 fn 是当前 effect 的回调函数 |
| lazy | Boolean | 是否延迟到页面的 onShow 执行，默认是 true,建议使用默认值，如果在 app.js 中使用，建议设置为 false |

#### <div id="api-3">storeCommit</div>

用于触发 Store 里的 mutations，以便更新 Store 的 data。第一个参数是"模块名/mutations 名",主模块的模块名默认为"",调用直接调用"mutations 名",其他模块的模块名可使用 name 定义，如果未定义则使用在主模块 modules 里的 key。除使用 getStoreData 获取全局状态是通过对象调用，其他 api 的调用都适用这个。第二个参数可以传递任意参数。

```js
this.$storeCommit("setUserInfo", {
  name: "李四",
  age: 20,
});
```

#### <div id="api-4">getStoreData</div>

获取 Store 的 data 引用，建议只使用这个 api 获取 store，而不要直接更改 store，如果要更改，请使用 storeCommit 更改。

```js
this.setData({
  userInfo2: this.$getStoreData().userInfo,
  goodList: this.$getStoreData().goods.goodList,
});
```

#### <div id="api-5">storeGetters</div>

可以在 Store 里定义 getter,getter 会缓存计算的结果，如果依赖的 store 没有变化，只会返回之前计算的结果。

```js
console.log(this.$storeGetters("getAppName"));
```

#### <div id="api-6">storeDispatch</div>

调用 store 的 actions 异步函数

## <div id="end">总结和建议</div>

最近也是在写原生微信小程序中使用 storage 共享状态时，维护和更新不同页面需要太多的精力去做，所以花了一下午写了这个非常粗糙的方案。因为在看《Vue.js 设计与实现》，所以边看边按照书上实现了个在插件中响应式，主要困难是 Vue 的响应式都是单文件的，所以它不用担心页面销毁后的副作用函数还存在的问题，但在这里，响应式是全局存在的，并不会因为页面或组件的销毁而销毁，所以我在页面销毁前清除了当前页面所有 effect。

大家有使用上的问题或者想法可以发邮件给我 [联系我](hspprogrammer@163.com) hspprogrammer@163.com 最后欢迎来我的 [github](https://github.com/hspprogrammer/wxminiSharedData#readme) 点个小星星

## <div id="log">更新日志</div>

### 2.1.1

\[2024.6.24\] : 修复 currentpage 获取错误，导致 effect lazy 执行无效。

### 2.1.0

\[2024.5.20\] : 修复若干 bug，优化 effect 执行时机，只在当前页面执行，其他页面缓存到 onShow 中执行。

### 2.0.0

\[2024.5.18\] : 引入响应式，支持 getter 缓存,模块化配置

### 1.0.0

\[2024.5.13\] : 主要利用发布订阅，粗暴实现。
