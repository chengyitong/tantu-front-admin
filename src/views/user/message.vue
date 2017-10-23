<template>
    <div>
        <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="80" inline>
            <Form-item label="目标用户ID">
                <Input v-model="searchForm.user_id" placeholder="请输入目标用户ID"></Input>
            </Form-item>
            <Form-item label="消息内容">
                <Input v-model="searchForm.message_content" placeholder="请输入消息内容"></Input>
            </Form-item>
            <Button type="primary" @click="getMessageLists">
                <Icon type="search" size="14"></Icon>&nbsp;查询
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>
        <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>
    </div>
</template>

<script>
import Mock  from 'mockjs';
export default {
    data() {
        return {
            searchForm: {
                page: 1,
                page_size: 10,
                user_id: null,
                info_content: null
            },
            addUserFormLoading: false,
            addUserModalVisible: false,
            addUserForm: {
                role: null,
                nickname: null,
                name: null,
                status: 1,
                password: null
            },
            addUserFormRules: {
                role: [
                    { type: 'number', required: true, message: '请选择用户角色', trigger: 'change' }
                ],
                name: [
                    { required: true, message: '请输入用户真实姓名', trigger: 'blur' }
                ],
                nickname: [
                    { required: true, message: '请输入用户昵称，用于登录', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入登录密码', trigger: 'blur' }
                ]
            },
            list: [],
            list_columns: [
                {
                    type: 'index',
                    width: 50,
                    align: 'center'
                },
                {
                    render: (h, params)=>{
                        if(params.index == 0){
                            return h('span', '1');
                        }
                        
                    }
                },
                {
                    title: '目标用户ID',
                    key: 'user_id',
                    width: 160,
                    sortable: true,
                    render: (h, params)=>{
                        return h('span', params.row.user_id.toString());
                    }
                },
                {
                    title: '消息标题',
                    key: 'message_title',
                    width: 180,
                    sortable: true
                },
                {
                    title: '消息内容',
                    key: 'message_content',
                    sortable: true
                },
                {
                    title: '发送时间',
                    key: 'send_time',
                    width: 180,
                    sortable: true
                }
            ],
            isShowPage: false
        }
    },
    mounted: function() {
        this.$nextTick(function() {
        })
    },
    methods: {
        getMessageLists(){
            let data = Mock.mock({
                'list|1-30':[{
                    'id|+1':1,  
                    'user_id': '@range(1,10,3)',  
                    'message_title':'@ctitle(3,8)', 
                    'message_content': '@ctitle(10,50)', 
                    'send_time':'@datetime()'
                }]
            })
            this.list = data.list;
        },
        // 翻页
        handlePageChange(cur_page) {
            this.searchForm.page = cur_page;
            this.getMessageLists();
        },
        // 改变每页大小
        handlePageSizeChange(page_size) {
            this.searchForm.page_size = page_size;
            this.getMessageLists();
        }
    }
}
</script>
