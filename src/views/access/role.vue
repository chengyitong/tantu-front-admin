<template>
    <div>
        <Form>
            <Button type="success" @click="addRoleModalVisible = true">
                <Icon type="plus" size="14"></Icon>&nbsp;新增
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>
        <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

        <!-- 新增角色弹框 -->
        <Modal v-model="addRoleModalVisible" title="新增角色">
            <div slot="footer">
                <Button type="text" size="large" @click="addRoleCancel('addRoleForm')">取消</Button>
                <Button type="primary" size="large" :loading="addRoleFormLoading" @click="addRole('addRoleForm')">确定</Button>
            </div>
            <Form ref="addRoleForm" :model="addRoleForm" :rules="addRoleFormRules" label-position="right" :label-width="80">
                <Form-item label="角色名称" prop="name">
                    <Input v-model="addRoleForm.name" placeholder="请输入角色名称"></Input>
                </Form-item>
                <Form-item label="角色权限" prop="menu_ids">
                    <Tree :data="baseData" show-checkbox></Tree>
                </Form-item>
            </Form>
        </Modal>
        <!-- 编辑角色弹框 -->
        <Modal v-model="updateRoleModalVisible" title="编辑角色">
            <div slot="footer">
                <Button type="text" size="large" @click="updateRoleCancel('updateRoleForm')">取消</Button>
                <Button type="primary" size="large" :loading="updateRoleFormLoading" @click="updateRole('updateRoleForm')">确定</Button>
            </div>
            <Form ref="updateRoleForm" :model="updateRoleForm" :rules="addRoleFormRules" label-position="right" :label-width="80">
                <Form-item label="角色名称" prop="name">
                    <Input v-model="updateRoleForm.name" placeholder="请输入角色名称"></Input>
                </Form-item>
                <Form-item label="角色权限" prop="menu_ids">
                    <Tree :data="baseData" show-checkbox></Tree>
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
                    { required: true, message: '请输入选择角色权限', trigger: 'blur' }
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
                                        this.updateRoleModal(params.row);
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
            updateRoleForm: {
                id: null,
                name: null,
                menu_ids: null
            },
            updateRoleModalVisible: false,
            updateRoleFormLoading: false
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
                name: '超级管理员',
                menu_ids: [1,2,3]
            },{
                id: 2,
                name: '普通管理员',
                menu_ids: [2,3]
            },{
                id: 3,
                name: '运维',
                menu_ids: [1,2]
            },{
                id: 4,
                name: '客服',
                menu_ids: [2]
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
        // 取消新增
        addRoleCancel(name) {
            this.addRoleModalVisible = false;
            this.$refs[name].resetFields();
        },
        // 新增角色
        addRole(addRoleForm) {

        },
        // 点击“编辑”按钮
        updateRoleModal(row) {
            let options = {
                id: row.id,
                name: row.name,
                menu_ids: row.menu_ids
            }
            this.updateRoleForm = options;
            this.updateRoleModalVisible = true;
        },
        // 取消编辑
        updateRoleCancel(name) {
            this.updateRoleModalVisible = false;
            this.$refs[name].resetFields();
        },
        // 保存编辑结果
        updateRole(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.updateRoleFormLoading = true;
                    this.$axios.put('/admin/plinks/', this.updateRoleForm).then(res => {
                        console.log(res)
                        if (res.code == 0) {
                            this.getRoleLists();
                            this.$Message.success('更新成功！');
                            this.updateRoleFormLoading = false;
                            this.updateRoleModalVisible = false;
                        }
                    }).catch(error => {
                        this.updateRoleFormLoading = false;
                    })
                } else {
                    this.updateRoleFormLoading = false;
                }
            })
        }
    }
}
</script>
