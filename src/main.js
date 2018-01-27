import Vue from 'vue';
import iView from 'iview';
import VueRouter from 'vue-router';
import { routers, otherRouter, appRouter } from './router';
import Vuex from 'vuex';
import Util from './libs/util';
import App from './app.vue';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import Locales from './locale';
import zhLocale from 'iview/src/locale/lang/zh-CN';
import enLocale from 'iview/src/locale/lang/en-US';
import Cookies from 'js-cookie';
import axios from 'axios';
import qs from 'qs';
import env from './config/env';

import $mock from 'mockjs';

Vue.prototype.$cookie = Cookies;
Vue.prototype.$mock = $mock;
Vue.prototype.$util = Util;

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueI18n);
Vue.use(iView);

// 自动设置语言
const navLang = navigator.language;
const localLang = (navLang === 'zh-CN' || navLang === 'en-US') ? navLang : false;
const lang = window.localStorage.getItem('language') || localLang || 'zh-CN';

Vue.config.lang = lang;

// 多语言配置
const locales = Locales;
const mergeZH = Object.assign(zhLocale, locales['zh-CN']);
const mergeEN = Object.assign(enLocale, locales['en-US']);
Vue.locale('zh-CN', mergeZH);
Vue.locale('en-US', mergeEN);

// 路由配置
const RouterConfig = {
  // mode: 'history',
  routes: routers
};
const router = new VueRouter(RouterConfig);
router.beforeEach((to, from, next) => {
  iView.LoadingBar.start();
  Util.title(to.meta.title);
  if (Cookies.get('locking') === '1' && to.name !== 'locking') {  // 判断当前是否是锁定状态
    iView.LoadingBar.finish();
    next(false);
    router.replace({
      name: 'locking'
    });
  } else if (Cookies.get('locking') === '0' && to.name === 'locking') {
    iView.LoadingBar.finish();
    next(false);
  } else {
    if (!Cookies.get('tt_a_un') && to.name !== 'login') {  // 判断是否已经登录且前往的页面不是登录页
      next({
        name: 'login'
      });
    } else if (Cookies.get('tt_a_un') && to.name === 'login') {  // 判断是否已经登录且前往的是登录页
      next({
        name: 'home'
      });
    } else {
      next();
    }
  }
});
router.afterEach(() => {
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
});

// axios 配置
const ajaxUrl = env === 'development' ? '/api' : env === 'production' ? '' : '/mock';
// 创建axios实例
const service = axios.create({
  baseURL: ajaxUrl, // api的base_url，使用代理模式时需要注释掉该行
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'X-CSRF-TOKEN': Cookies.get('__token__')
  },
  timeout: 30000 // 请求超时时间
});
// request 拦截器
service.interceptors.request.use((config) => {
  iView.LoadingBar.start();
  config.withCredentials = true; // 设置发送post请求自动set cookie
  // POST 传参序列化
  if (config.method === 'post') {
    config.data = qs.stringify(config.data);
  }
  // PUT 传参序列化
  if (config.method === 'put') {
    config.data = qs.stringify(config.data);
  }
  return config;
}, (error) => {
  iView.Message.error(error);
  return Promise.reject(error);
});
// response 拦截器
service.interceptors.response.use((res) => {
  iView.LoadingBar.finish();
  if (res.data.code !== 0) {
    // 用户未登录
    if (res.data.code === 1) {
      Cookies.remove('tt_a_un');
      Cookies.remove('_p');
      Cookies.remove('hasGreet');
      Cookies.remove('access');
      Cookies.remove('locking');
      Cookies.remove('tt_a_login_time');
      store.commit('clearOpenedSubmenu');
      // 回复默认样式
      let themeLink = document.querySelector('link[name="theme"]');
      themeLink.setAttribute('href', '');
      // 清空打开的页面等数据，但是保存主题数据
      let theme = '';
      if (localStorage.theme) {
        theme = localStorage.theme;
      }
      localStorage.clear();
      if (theme) {
        localStorage.theme = theme;
      }
      router.push({
        name: 'login'
      });
    } else {
      iView.Message.error(res.data.msg);
      return Promise.reject(res);
    }
  }
  return res.data;
}, (error) => {
  let status = error.response.status;
  if (status == 401) {
    router.push({ path: '/401' });
  } else if (status == 404) {
    router.push({ path: '/404' });
  } else {
    iView.Message.error(error.message);
  }

  return Promise.reject(error.message);
});
Vue.prototype.$axios = service;

// 状态管理
const store = new Vuex.Store({
  state: {
    routers: [
      otherRouter,
      ...appRouter
    ],
    menuList: [],
    tagsList: [...otherRouter.children],
    pageOpenedList: [],
    currentPageName: '',
    currentPath: [
      {
        title: '首页',
        path: '',
        name: 'home_index'
      }
    ],  // 面包屑数组
    openedSubmenuArr: [],  // 要展开的菜单数组
    menuTheme: '', // 主题
    theme: '',
    loginLoading: false,
    token: ''
  },
  getters: {

  },
  mutations: {
    setTagsList: (state, list) => {
      state.tagsList.push(...list);
    },
    increateTag: (state, tagObj) => {
      state.pageOpenedList.splice(1, 0, tagObj);
    },
    removeTag: (state, name) => {
      state.pageOpenedList.map((item, index) => {
        if (item.name === name) {
          state.pageOpenedList.splice(index, 1);
        }
      });
    },
    moveToSecond: (state, index) => {
      let openedPage = state.pageOpenedList[index];
      state.pageOpenedList.splice(index, 1);
      state.pageOpenedList.splice(1, 0, openedPage);
      localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
    },
    setOpenedList: (state) => {
      state.pageOpenedList = localStorage.pageOpenedList ? JSON.parse(localStorage.pageOpenedList) : [otherRouter.children[0]];
    },
    setCurrentPath: (state, pathArr) => {
      state.currentPath = pathArr;
    },
    setCurrentPageName: (state, name) => {
      state.currentPageName = name;
    },
    addOpenSubmenu: (state, name) => {
      let hasThisName = false;
      let isEmpty = false;
      if (name.length === 0) {
        isEmpty = true;
      }
      if (state.openedSubmenuArr.indexOf(name) > -1) {
        hasThisName = true;
      }
      if (!hasThisName && !isEmpty) {
        state.openedSubmenuArr.push(name);
      }
    },
    clearOpenedSubmenu: (state) => {
      state.openedSubmenuArr.length = 0;
    },
    changeMenuTheme: (state, theme) => {
      state.menuTheme = theme;
    },
    changeMainTheme: (state, mainTheme) => {
      state.theme = mainTheme;
    },
    lock: (state) => {
      Cookies.set('locking', '1');
    },
    unlock: (state) => {
      Cookies.set('locking', '0');
    },
    setMenuList: (state, menulist) => {
      state.menuList = menulist;
    },
    updateMenulist: (state) => {
      let accessCode = parseInt(Cookies.get('access'));
      let menuList = [];
      appRouter.forEach((item, index) => {
        if (item.access !== undefined) {
          if (Util.showThisRoute(item.access, accessCode)) {
            if (item.children.length <= 1) {
              menuList.push(item);
            } else {
              let i = menuList.push(item);
              let childrenArr = [];
              childrenArr = item.children.filter(child => {
                if (child.access !== undefined) {
                  if (child.access === accessCode) {
                    return child;
                  }
                } else {
                  return child;
                }
              });
              menuList[i - 1].children = childrenArr;
            }
          }
        } else {
          if (item.children.length <= 1) {
            menuList.push(item);
          } else {
            let i = menuList.push(item);
            let childrenArr = [];
            childrenArr = item.children.filter(child => {
              if (child.access !== undefined) {
                if (Util.showThisRoute(child.access, accessCode)) {
                  return child;
                }
              } else {
                return child;
              }
            });
            menuList[i - 1].children = childrenArr;
          }
        }
      });
      state.menuList = menuList;
    },
    setAvator: (state, path) => {
      localStorage.avatorImgPath = path;
    },
    isLoginLoading: (state, isloading) => {
      state.loginLoading = isloading;
    },
    setToken: (state, token) => {
      state.token = token;
    }
  },
  actions: {
  }
});

new Vue({
  el: '#app',
  router: router,
  store: store,
  render: h => h(App),
  data: {
    currentPageName: ''
  },
  mounted() {
    this.currentPageName = this.$route.name;
  },
  created() {
    let tagsList = [];
    appRouter.map((item) => {
      if (item.children.length <= 1) {
        tagsList.push(item.children[0]);
      } else {
        tagsList.push(...item.children);
      }
    });
    this.$store.commit('setTagsList', tagsList);
    this.$axios.get('/safe/token').then(res => {
      Cookies.set('__token__', res.data);
    });
  }
});
