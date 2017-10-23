import axios from 'axios';
import qs from 'qs';
import { LoadingBar, Message } from 'iview';
import router from '../router';
import env from '../config/env';
const ajaxUrl = env === 'development' ? '/api' : env === 'production' ? '' : '/mock';

// 创建axios实例
const service = axios.create({
    baseURL: ajaxUrl, // api的base_url，使用代理模式时需要注释掉该行
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    timeout: 30000                  // 请求超时时间
});

// request 拦截器
service.interceptors.request.use((config) => {
    LoadingBar.start();
    config.withCredentials = true; // 设置发送post请求自动set cookie
    // POST 传参序列化
    if (config.method === 'post') {
        config.data = qs.stringify(config.data);
    }
    return config;
}, (error) => {
    Message.error('传参错误');
    return Promise.reject(error);
});

// response 拦截器
service.interceptors.response.use((res) => {
    LoadingBar.finish();
    if (res.data.code !== 0) {
        // 用户未登录
        if (res.data.code === 1) {
            router.push({ path: '/login' });
        }
        Message.error(res.data.msg);
        return Promise.reject(res);
    }
    return res.data;
}, (error) => {
    Message.error('网络异常');
    return Promise.reject(error);
});

export default service;
