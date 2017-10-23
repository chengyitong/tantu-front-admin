<template>
    <div>
        <Form>
            <Button type="success" @click="addRoleModalVisible = true">
                <Icon type="plus" size="14"></Icon>&nbsp;添加角色
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>
        <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

        <!-- 添加角色弹框 -->
        <Modal v-model="addRoleModalVisible" title="添加角色">
            <div slot="footer">
                <Button type="text" size="large" @click="addRoleCancel('addRoleForm')">取消</Button>
                <Button type="primary" size="large" :loading="addRoleFormLoading" @click="addRole('addRoleForm')">确定</Button>
            </div>
            <Form ref="addRoleForm" :model="addRoleForm" :rules="addRoleFormRules" label-position="right" :label-width="80">
                <Form-item label="角色名称" prop="name">
                    <Input v-model="addRoleForm.name" placeholder="请输入角色名称"></Input>
                </Form-item>
                <Form-item label="菜单" prop="menu_ids">
                    <Tree :data="baseData" show-checkbox></Tree>
                </Form-item>
            </Form>
        </Modal>
        <!-- 编辑用户弹框 -->
        <Modal v-model="updateUserModalVisible" title="添加角色">
            <div slot="footer">
                <Button type="text" size="large" @click="updateUserCancel('updateUserForm')">取消</Button>
                <Button type="primary" size="large" :loading="updateUserFormLoading" @click="updateUser('updateUserForm')">确定</Button>
            </div>
            <Form ref="updateUserForm" :model="updateUserForm" :rules="addRoleFormRules" label-position="right" :label-width="80">
                <Form-item label="角色" prop="role">
                    <Select v-model="updateUserForm.role" filterable clearable size="large" placeholder="请选择用户角色">
                        <Option :value="0" :key="0">超级管理员</Option>
                        <Option :value="1" :key="1">普通管理员</Option>
                        <Option :value="2" :key="2">客服</Option>
                        <Option :value="3" :key="3">运维</Option>
                    </Select>
                </Form-item>
                <Form-item label="姓名" prop="name">
                    <Input v-model="updateUserForm.name" placeholder="请输入用户真实姓名"></Input>
                </Form-item>
                <Form-item label="昵称" prop="nickname">
                    <Input v-model="updateUserForm.nickname" placeholder="请输入用户昵称，用于登录"></Input>
                </Form-item>
                <Form-item label="状态" prop="status">
                    <Select v-model="updateUserForm.status" filterable>
                        <Option :value="1" :key="1">正常</Option>
                        <Option :value="2" :key="2">禁用</Option>
                    </Select>
                </Form-item>
            </Form>
        </Modal>
    </div>
</template>

<script>
export default {
    data() {
        return {
            addRoleFormLoading: false,
            addRoleModalVisible: false,
            addRoleForm: {
                name: null,
                menu_ids: null
            },
            addRoleFormRules: {
                name: [
                    { required: true, message: '请输入角色名称', trigger: 'change' }
                ],
                menu_ids: [
                    { required: true, message: '请输入用户真实姓名', trigger: 'blur' }
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
                    title: '角色名称',
                    key: 'name',
                    width: 180,
                    sortable: true
                },
                {
                    title: '角色权限',
                    key: 'menu_ids',
                    sortable: true
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 130,
                    align: 'center',
                    render: (h, params) => {
                        let currentRow = params.row;
                        return h('span', [
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        // this.show(params.index)
                                        this.updateUserModal(params.row);
                                    }
                                }
                            }, '编辑'),
                            h('Poptip',{
                                props: {
                                    confirm: true,
                                    title: '您确定要删除这条数据吗?',
                                    transfer: true,
                                    placement: 'top-end'
                                },
                                on: {
                                    'on-ok': () => {
                                        currentRow.isDeleting = true;
                                        this.list.splice(params.index, 1);
                                    }
                                }
                            },[
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        placement: 'top',
                                        loading: currentRow.isDeleting
                                    },
                                    style: {
                                        margin: '0 5px'
                                    }
                                }, '删除')
                            ])
                        ]);
                    }
                }
            ],
            baseData: [{
                expand: true,
                title: 'parent 1',
                children: [{
                    title: 'parent 1-0',
                    expand: true,
                    disabled: true,
                    children: [{
                        title: 'leaf',
                        disableCheckbox: true
                    }, {
                        title: 'leaf',
                    }]
                }, {
                    title: 'parent 1-1',
                    expand: true,
                    checked: true,
                    children: [{
                        title: '<span style="color: red">leaf</span>',
                    }]
                }]
            }],
            isShowPage: false,
            updateUserForm: {
                role: null,
                nickname: null,
                name: null,
                status: 1
            },
            updateUserModalVisible: false,
            updateUserFormLoading: false
        }
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getRoleLists();
        })
    },
    methods: {
        getRoleLists(){
            this.list = [{
                id: 1,
                name: '一通',
                menu_ids: [1,2,3]
            },{
                id: 2,
                name: '测试',
                menu_ids: [2,3]
            },{
                id: 3,
                name: '小米',
                menu_ids: [1,2]
            }];
        },
        // 翻页
        handlePageChange(cur_page) {
            this.searchForm.page = cur_page;
            this.getRoleLists();
        },
        // 改变每页大小
        handlePageSizeChange(page_size) {
            this.searchForm.page_size = page_size;
            this.getRoleLists();
        },
        // 取消添加
        addRoleCancel(name) {
            this.addRoleModalVisible = false;
            this.$refs[name].resetFields();
        },
        // 添加角色
        addRole(addRoleForm) {

        },
        // 点击“编辑”按钮
        updateUserModal(row) {
            let options = {
                id: row.id,
                role: row.role,
                nickname: row.nickname,
                name: row.name,
                status: row.status
            }
            this.updateUserForm = options;
            this.updateUserModalVisible = true;
        },
        // 取消编辑
        updateUserCancel(name) {
            this.updateUserModalVisible = false;
            this.$refs[name].resetFields();
        },
        // 保存编辑结果
        updateUser(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.updateUserFormLoading = true;
                    this.$axios.put('/admin/plinks/', this.updateUserForm).then(res => {
                        console.log(res)
                        if (res.code == 0) {
                            this.getRoleLists();
                            this.$Message.success('更新成功！');
                            this.updateUserFormLoading = false;
                            this.updateUserModalVisible = false;
                        }
                    }).catch(error => {
                        this.updateUserFormLoading = false;
                    })
                } else {
                    this.updateUserFormLoading = false;
                }
            })
        }
    }
}
</script>

<style lang="less">
.ivu-tree ul li {
    margin: 0 !important;
}
</style>
