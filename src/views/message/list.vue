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
            <Button type="success" @click="sendMessageModalVisible = true">
                <Icon type="plus" size="14"></Icon>&nbsp;发送站内信
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>
        <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

        <!-- 发送站内信弹框 -->
        <Modal v-model="sendMessageModalVisible" title="发送站内信">
            <div slot="footer">
                <Button type="text" size="large" @click="sendMessageCancel('sendMessageForm')">取消</Button>
                <Button type="primary" size="large" :loading="sendMessageFormLoading" @click="sendMessage('sendMessageForm')">确定</Button>
            </div>
            <Form ref="sendMessageForm" :model="sendMessageForm" :rules="sendMessageFormRules" label-position="right" :label-width="100">
                <Form-item label="目标用户ID" prop="user_id">
                    <Input v-model="sendMessageForm.user_id" placeholder="发给所有人为0；群发多人请用英文逗号分隔如：12,45"></Input>
                </Form-item>
                <Form-item label="消息标题" prop="message_title">
                    <Input v-model="sendMessageForm.message_title" placeholder="请输入消息标题"></Input>
                </Form-item>
                <Form-item label="消息内容" prop="message_content">
                    <Input v-model="sendMessageForm.message_content" placeholder="请输入消息内容"></Input>
                </Form-item>
            </Form>
        </Modal>
    </div>
</template>

<script>
export default {
    data() {
        return {
            searchForm: {
                page: 1,
                page_size: 10,
                user_id: null,
                info_content: null
            },
            sendMessageFormLoading: false,
            sendMessageModalVisible: false,
            sendMessageForm: {
                user_id: null,
                message_title: null,
                message_content: null
            },
            sendMessageFormRules: {
                user_id: [
                    { required: true, message: '请输入目标用户ID：发给所有人为0；群发多人请用英文逗号分隔', trigger: 'blur' }
                ],
                message_title: [
                    { required: true, message: '请输入消息标题', trigger: 'blur' }
                ],
                message_content: [
                    { required: true, message: '请输入消息内容', trigger: 'blur' }
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
        // 获取消息列表
        getMessageLists(){
            let data = this.$mock.mock({
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
        },
        // 发送站内信
        sendMessage(name){
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.sendMessageFormLoading = true;
                    this.$axios.put('/admin/plinks/', this.sendMessageForm).then(res => {
                        console.log(res)
                        if (res.code == 0) {
                            this.getMessageLists();
                            this.$Message.success('发送成功！');
                            this.sendMessageFormLoading = false;
                            this.sendMessageModalVisible = false;
                        }
                    }).catch(error => {
                        this.sendMessageFormLoading = false;
                    })
                } else {
                    this.sendMessageFormLoading = false;
                }
            })
        },
        // 取消发送
        sendMessageCancel(name){
            this.sendMessageModalVisible = false;
            this.$refs[name].resetFields();
        }
    }
}
</script>
