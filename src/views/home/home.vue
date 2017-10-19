<style lang="less">
    @import "./home.less";
    @import "../../styles/common.less";
</style>
<template>
    <div class="home-main">
        <Row>
            <Col span="8" style="margin-left:33.33333333%">
                <Row>
                    <Card>
                        <Row type="flex" class="user-infor">
                            <Col span="8">
                                <Row class-name="made-child-con-middle" type="flex" align="middle">
                                    <img class="avator-img" :src="avatorPath" />
                                </Row>
                            </Col>
                            <Col span="16" style="padding-left:6px;">
                                <Row class-name="made-child-con-middle" type="flex" align="middle">
                                    <div>
                                        <b class="card-user-infor-name">{{username}}</b>
                                        <p></p>
                                    </div>
                                </Row>
                            </Col>
                        </Row>
                        <div class="line-gray"></div>
                        <Row class="margin-top-8">
                            <Col span="8"><p class="notwrap">上次登录时间:</p></Col>
                            <Col span="16" class="padding-left-8">{{loginTime}}</Col>
                        </Row>
                    </Card>
                </Row>
            </Col>
        </Row>
    </div>
</template>

<script>

export default {
    data () {
        return {
        };
    },
    computed: {
        username () {
            return this.$cookie.get('username');
        },
        avatorPath () {
            return localStorage.avatorImgPath;
        },
        loginTime () {
            return this.$cookie.get('login_time');
        }
    },
    methods: {
    }
};
</script>
