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
                        this.$cookie.set('tt_a_un', this.loginForm.username);
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
            let month = date.getMonth() + 1;
            let strDate = date.getDate();
            let H = date.getHours();
            let M = date.getMinutes();
            let S = date.getSeconds();
            month = month < 10 && month >= 1 ? '0' + month : month;
            strDate = strDate < 10 && strDate >= 0 ? '0' + strDate : strDate;
            H = H < 10 && H >= 0 ? '0' + H : H;
            M = M < 10 && M >= 0 ? '0' + M : M;
            S = S < 10 && S >= 0 ? '0' + S : S;
            let currentdate = date.getFullYear() + '-' + month + '-' + strDate + ' ' + H + ':' + M + ':' + S;
            return currentdate;
        }
    }
};
</script>

<style>

</style>
