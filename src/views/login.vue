<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    欢迎登录
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="loginForm" :rules="rules">
                        <FormItem prop="username">
                            <Input v-model="loginForm.username" placeholder="请输入登录帐号">
                                <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="loginForm.password" placeholder="请输入登录密码">
                                <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button @click="handleSubmit" :loading="loading" type="primary" long>登录</Button>
                        </FormItem>
                    </Form>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import md5 from 'md5';
export default {
    data () {
        return {
            loginForm: {
                username: '',
                password: ''
            },
            rules: {
                username: [
                    { required: true, message: '账号不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ]
            }
        };
    },
    computed: {
        loading() {
            return this.$store.state.loginLoading
        }
    },
    methods: {
        handleSubmit () {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    let options = {
                        username: this.loginForm.username,
                        password: md5(this.loginForm.password)
                    }
                    this.$store.commit('isLoginLoading', true);
                    this.$axios.post('/admin/auth/login', options).then(res => {
                        this.$store.commit('setAvator', 'http://og91leroh.bkt.clouddn.com/static/admin/avator.jpg');
                        this.$cookie.set('username', this.loginForm.username);
                        this.$cookie.set('login_time',this.getNowFormatDate());
                        this.$store.commit('isLoginLoading', false);
                        this.$router.push({ name: 'home_index' });
                    }).catch(error => {
                        this.$store.commit('isLoginLoading', false);
                    })
                }
            });
        },
        // 获取当前时间
        getNowFormatDate() {
            let date = new Date();
            let seperator1 = '-';
            let seperator2 = ':';
            let month = date.getMonth() + 1;
            let strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = '0' + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = '0' + strDate;
            }
            let currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                    + ' ' + date.getHours() + seperator2 + date.getMinutes()
                    + seperator2 + date.getSeconds();
            return currentdate;
        }
    }
};
</script>

<style>

</style>
