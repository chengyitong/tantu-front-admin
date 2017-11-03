<template>
    <div>
        <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="50" inline>
            <Form-item label="类型" prop="type">
                <RadioGroup v-model="searchForm.type">
                    <Radio :label="1">菜单</Radio>
                    <Radio :label="2">接口</Radio>
                </RadioGroup>
            </Form-item>
            <Button type="primary">
                <Icon type="search" size="14"></Icon>&nbsp;查询
            </Button>
            <p>
                <Button type="success" @click="addRoleModalVisible = true">
                    <Icon type="plus" size="14"></Icon>&nbsp;新增
                </Button>
                <Button type="error">
                    <Icon type="trash-a" size="14"></Icon>&nbsp;批量删除
                </Button>
            </p>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>
        <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

        <!-- 新增菜单弹框 -->
        <Modal v-model="addRoleModalVisible" title="新增" :rules="addRoleFormRules" :styles="{top: '50px'}">
            <div slot="footer">
                <Button type="text" size="large" @click="addRoleCancel('addRoleForm')">取消</Button>
                <Button type="primary" size="large" :loading="addRoleFormLoading" @click="addRole('addRoleForm')">确定</Button>
            </div>
            <Form ref="addRoleForm" :model="addRoleForm" label-position="right" :label-width="80">
                <Form-item label="类型" prop="type">
                    <RadioGroup v-model="addRoleForm.type">
                        <Radio :label="1">菜单</Radio>
                        <Radio :label="2">接口</Radio>
                    </RadioGroup>
                </Form-item>

                <div v-show="addRoleForm.type == 1">
                    <Form-item label="菜单名称" prop="name">
                        <Input v-model="addRoleForm.name" placeholder="请输入菜单名称，必填"></Input>
                    </Form-item>
                    <Form-item label="上级菜单" prop="menu_ids">
                        <Tree :data="baseData" show-checkbox></Tree>
                    </Form-item>
                    <Form-item label="菜单URL" prop="url">
                        <Input v-model="addRoleForm.url" placeholder="请输入菜单URL，必填"></Input>
                    </Form-item>
                    <Form-item label="授权标识" prop="permission">
                        <Input v-model="addRoleForm.permission" placeholder="请输入授权标识"></Input>
                    </Form-item>
                    <Form-item label="菜单图标" prop="icon">
                        <Input v-model="addRoleForm.icon" placeholder="请输入菜单图标class,如：ionic"></Input>
                        <a href="https://www.iviewui.com/components/icon" target="_blank">获取更多图标</a>
                    </Form-item>
                    <Form-item label="菜单排序" prop="sortedIndex">
                        <Input v-model="addRoleForm.sortedIndex" placeholder="请输入菜单排序，默认为0"></Input>
                    </Form-item>
                </div>
                <!-- / 菜单 -->

                <div v-show="addRoleForm.type == 2">
                    <Form-item label="接口名称" prop="name">
                        <Input v-model="addRoleForm.name" placeholder="请输入接口名称，必填"></Input>
                    </Form-item>
                    <Form-item label="接口URL" prop="url">
                        <Input v-model="addRoleForm.url" placeholder="请输入接口URL，必填"></Input>
                    </Form-item>
                    <Form-item label="授权标识" prop="permission">
                        <Input v-model="addRoleForm.permission" placeholder="请输入授权标识"></Input>
                    </Form-item>
                </div>
                <!-- / 接口 -->
                <Form-item label="状态" prop="available">
                    <RadioGroup v-model="addRoleForm.available">
                        <Radio :label="1">正常</Radio>
                        <Radio :label="2">禁用</Radio>
                    </RadioGroup>
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
                type: 1,
                page: 1,
                page_size: 10
            },
            addRoleFormLoading: false,
            addRoleModalVisible: false,
            addRoleForm: {
                type: 1,
                name: null,
                menu_ids: null,
                url: null,
                permission: null,
                icon: null,
                sortedIndex: 0,
                available: 1
            },
            addRoleFormRules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' }
                ],
                url: [
                    { required: true, message: '请输入URL', trigger: 'blur' }
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
                    title: '排序',
                    key: 'sortedIndex',
                    width: 80,
                    sortable: true
                },
                {
                    title: '菜单ID',
                    key: 'id',
                    sortable: true
                },
                {
                    title: '菜单名称',
                    key: 'name',
                    sortable: true
                },
                {
                    title: '上级菜单ID',
                    key: 'parent_id',
                    sortable: true
                },
                {
                    title: '菜单图标',
                    key: 'icon',
                    sortable: true
                },
                {
                    title: '菜单URL',
                    key: 'url',
                    sortable: true
                },
                {
                    title: '授权标识',
                    key: 'permission',
                    sortable: true
                },
                {
                    title: '类型',
                    key: 'type',
                    sortable: true
                },
                {
                    title: '状态',
                    key: 'available',
                    sortable: true
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 130,
                    fixed: 'right',
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
                expand: false,
                title: '一级菜单',
                children: [{
                    title: '图片管理',
                    expand: false,
                    children: [{
                        id: 1,
                        title: '上传图片'
                    }, {
                        id: 2,
                        title: '图片库',
                    }, {
                        id: 3,
                        title: '图片分类',
                    }, {
                        id: 4,
                        title: '图片标签',
                    }, {
                        id: 5,
                        title: '图片颜色',
                    }]
                }, {
                    id: 6,
                    title: 'Banner管理'
                }]
            }],
            isShowPage: false
        }
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getRoleLists();
        })
    },
    methods: {
        getRoleLists(){
            let data = this.$mock.mock({
                // type: 'menu',
                // name: null,
                // menu_ids: null,
                // url: null,
                // permission: null,
                // icon: null,
                // sortedIndex: 0,
                // available: 1
                'list|1-30':[{
                    'id|+1':1,
                    'type|+1': [
                        'dir',
                        'menu',
                        'button'
                    ],
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
        // 新增菜单
        addRole(addRoleForm) {

        }
    }
}
</script>

<style lang="less">
.ivu-tree ul li {
    margin: 0 !important;
}
</style>
