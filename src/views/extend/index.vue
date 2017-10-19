<template>
    <div>
        <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
            <Form-item class="fn-hide" label="类型">
                <Select v-model="searchForm.promotionallinkstable_type" filterable>
                    <Option value="Event" key="Event">赛事</Option>
                </Select>
            </Form-item>
            <Form-item label="推广主体">
                <Select v-model="searchForm.promotionallinkstable_id" @on-change="getPlinks" filterable clearable style="width: 280px">
                    <Option v-for="item in promotionallinkstable_ids" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </Form-item>
            <Form-item label="名称">
                <Input v-model="searchForm.name" placeholder="请输入推广链接名称"></Input>
            </Form-item>
            <Form-item label="状态">
                <Select v-model="searchForm.status" filterable @on-change="getPlinks">
                    <Option :value="0" :key="0">不限</Option>
                    <Option :value="1" :key="1">启用</Option>
                    <Option :value="2" :key="2">禁用</Option>
                </Select>
            </Form-item>
            <Button type="primary" @click="getPlinks">
                <Icon type="search" size="14"></Icon>&nbsp;查询
            </Button>
            <Button type="success" @click="addPlinksModalVisible = true">
                <Icon type="plus" size="14"></Icon>&nbsp;添加推广链接
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>
        <Page v-if="isShowPage" :total="count" show-total show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

        <!-- 添加推广链接弹框 -->
        <Modal v-model="addPlinksModalVisible" title="添加推广链接" width="800">
            <div slot="footer">
                <Button type="text" size="large" @click="addPlinksCancel('addPlinksForm')">取消</Button>
                <Button type="primary" size="large" :loading="addPlinksFormLoading" @click="addPlinks('addPlinksForm')">确定</Button>
            </div>
            <Form ref="addPlinksForm" :model="addPlinksForm" :rules="addPlinksFormRules" label-position="right" :label-width="80">
                <Form-item class="fn-hide" label="类型" prop="promotionallinkstable_type">
                    <Select v-model="addPlinksForm.promotionallinkstable_type" filterable size="large" placeholder="请选择推广类型">
                        <Option value="Event" key="Event">赛事</Option>
                    </Select>
                </Form-item>
                <Form-item label="推广主体" prop="promotionallinkstable_id">
                    <Select v-model="addPlinksForm.promotionallinkstable_id" filterable clearable size="large" placeholder="请选择推广主体">
                        <Option v-for="item in promotionallinkstable_ids" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </Form-item>
                <Form-item label="名称" prop="name">
                    <Input v-model="addPlinksForm.name" placeholder="请输入推广链接名称" size="large" @keyup.enter.native="addPlinks('addPlinksForm')"></Input>
                </Form-item>
                <Form-item label="页面链接" prop="jump_link">
                    <Input v-model="addPlinksForm.jump_link" placeholder="请输入需要推广的页面链接" size="large" @keyup.enter.native="addPlinks('addPlinksForm')"></Input>
                </Form-item>
                <Form-item label="备注" prop="mark">
                    <Input v-model="addPlinksForm.mark" placeholder="请输入备注" size="large" @keyup.enter.native="addPlinks('addPlinksForm')"></Input>
                </Form-item>
            </Form>
        </Modal>
        <!-- 更新推广链接弹框 -->
        <Modal v-model="updatePlinksModalVisible" title="更新推广链接" width="800">
            <div slot="footer">
                <Button type="text" size="large" @click="updatePlinksModalVisible = false">取消</Button>
                <Button type="primary" size="large" :loading="updatePlinksFormLoading" @click="updatePlinks('updatePlinksForm')">确定</Button>
            </div>
            <Form ref="updatePlinksForm" :model="updatePlinksForm" :rules="addPlinksFormRules" label-position="right" :label-width="80">
                <Form-item class="fn-hide" label="类型" prop="promotionallinkstable_type">
                    <Select v-model="updatePlinksForm.promotionallinkstable_type" disabled size="large" placeholder="请选择推广类型">
                        <Option value="Event" key="Event">赛事</Option>
                    </Select>
                </Form-item>
                <Form-item label="推广主体" prop="promotionallinkstable_id">
                    <Select v-model="updatePlinksForm.promotionallinkstable_id" disabled size="large" placeholder="请选择推广主体">
                        <Option v-for="item in promotionallinkstable_ids" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </Form-item>
                <Form-item label="名称" prop="name">
                    <Input v-model="updatePlinksForm.name" placeholder="请输入推广链接名称" size="large" @keyup.enter.native="updatePlinks('updatePlinksForm')"></Input>
                </Form-item>
                <Form-item label="页面链接" prop="jump_link">
                    <Input v-model="updatePlinksForm.jump_link" placeholder="请输入需要推广的页面链接" size="large" @keyup.enter.native="updatePlinks('updatePlinksForm')"></Input>
                </Form-item>
                <Form-item label="备注" prop="mark">
                    <Input v-model="updatePlinksForm.mark" placeholder="请输入备注" size="large" @keyup.enter.native="updatePlinks('updatePlinksForm')"></Input>
                </Form-item>
                <Form-item label="状态" prop="status">
                    <Select v-model="updatePlinksForm.status" size="large">
                        <Option :value="1" :key="1">启用</Option>
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
            searchForm: {
                page: 1,
                page_size: 10,
                name: null, // 名称
                status: 0, // 状态：1:启用；2:禁用
                promotionallinkstable_type: 'Event', // 推广主体类名。 目前全部是Event
                promotionallinkstable_id: null // 推广主体id。目前为活动id
            },
            promotionallinkstable_ids: [], // 活动列表
            isShowPage: false,
            list: [], // 推广链接列表
            list_columns: [
                // {
                //     title: '推广类型',
                //     key: 'promotionallinkstable_type',
                //     render: (h, params) => {
                //         let promotionallinkstable_type = params.row.promotionallinkstable_type;
                //         if (promotionallinkstable_type == 'Event') {
                //             promotionallinkstable_type = '活动';
                //         }
                //         return h('span', promotionallinkstable_type);
                //     }
                // },
                {
                    title: '推广主体',
                    key: 'subject',
                    render: (h, params) => {
                        let subject = params.row.promotionallinkstable.subject;
                        return h('span', subject);
                    }
                }, {
                    title: '名称',
                    key: 'name',
                    sortable: true
                }, {
                    title: '推广链接',
                    key: 'out_link',
                    render: (h, params) => {
                        let out_link = window.location.host + params.row.out_link;
                        return h('span', out_link);
                    },
                }, {
                    title: '备注',
                    key: 'mark'
                }, {
                    title: '状态',
                    key: 'status',
                    width: 120,
                    align: 'center',
                    render: (h, params) => {
                        let status = params.row.status;
                        let status_str = status == 1 ? '启用' : '禁用';
                        let status_color = status == 1 ? 'green' : 'red';
                        return h('Tag', {
                            props: {
                                color: status_color,
                                type: 'dot',
                                size: 'small'
                            }
                        }, status_str);
                    },
                    sortable: true
                }, {
                    title: '创建时间',
                    key: 'created_at',
                    align: 'center',
                    sortable: true
                }, {
                    title: '操作',
                    key: 'action',
                    width: 130,
                    align: 'center',
                    render: (h, params) => {
                        return h('ButtonGroup', [
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        // this.show(params.index)
                                        this.updatePlinksModal(params.row);
                                    }
                                }
                            }, '编辑'),
                            h('Button', {
                                props: {
                                    type: 'error',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        // this.remove(params.index)
                                        this.delPlinks(params);
                                    }
                                }
                            }, '删除')
                        ]);
                    }
                }],
            count: 0, // 数据总条数
            addPlinksModalVisible: false,
            addPlinksForm: {
                name: null, // 名称
                jump_link: null, // 跳转的页面
                mark: null, // 备注
                promotionallinkstable_type: 'Event', // 推广主体类名。 目前全部是Event
                promotionallinkstable_id: null // 推广主体id。目前为活动id
            },
            addPlinksFormRules: {
                promotionallinkstable_type: [
                    { required: true, message: '请选择推广类型', trigger: 'change' }
                ],
                promotionallinkstable_id: [
                    { type: 'number', required: true, message: '请选择推广主体', trigger: 'change' }
                ],
                name: [
                    { required: true, message: '请输入推广链接名称', trigger: 'blur' }
                ],
                jump_link: [
                    { type: 'url', required: true, message: '请输入推广链接', trigger: 'blur' }
                ]
            },
            addPlinksFormLoading: false,
            updatePlinksModalVisible: false,
            updatePlinksForm: {},
            updatePlinksFormLoading: false
        }
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getEventList();
            this.getPlinks();
        })
    },
    methods: {
        // 获取活动列表用于查询推广链接列表
        getEventList() {
            let _params = {
                page: 1,
                page_size: 1000,
                subject: ''
            }
            this.$axios.get('/admin/event', { params: _params }).then(res => {
                let list = res.data.list;
                for (let i = 0; i < list.length; i++) {
                    const options = {};
                    options.label = list[i].subject;
                    options.value = list[i].id;
                    this.promotionallinkstable_ids.push(options);
                }
            })
        },
        // 获取推广链接列表
        getPlinks() {
            this.$axios.get('/admin/plinks', { params: this.searchForm }).then(res => {
                this.list = res.data.list;
                if (res.data.count >= this.searchForm.page_size) {
                    this.count = res.data.count;
                    this.isShowPage = true;
                } else {
                    this.isShowPage = false;
                }
            })
        },
        // 翻页
        handlePageChange(cur_page) {
            this.searchForm.page = cur_page;
            this.getPlinks();
        },
        // 改变每页大小
        handlePageSizeChange(page_size) {
            this.searchForm.page_size = page_size;
            this.getPlinks();
        },
        // 点击确定添加按钮
        addPlinks(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.addPlinksFormLoading = true;
                    this.$axios.post('/admin/plinks', this.addPlinksForm).then(res => {
                        console.log(res)
                        if (res.code == 0) {
                            this.getPlinks();
                            this.$Message.success('添加成功！');
                            this.addPlinksCancel(name);
                            this.addPlinksFormLoading = false;
                        }
                    })
                } else {
                    this.addPlinksFormLoading = false;
                }
            })
        },
        // 取消添加
        addPlinksCancel(name) {
            this.addPlinksModalVisible = false;
            this.$refs[name].resetFields();
        },
        // 点击“编辑”按钮
        updatePlinksModal(row) {
            let options = {
                id: row.id,
                name: row.name, // 名称
                jump_link: row.jump_link, // 跳转的页面
                mark: row.mark, // 备注
                promotionallinkstable_type: row.promotionallinkstable_type, // 推广主体类名。 目前全部是Event
                promotionallinkstable_id: row.promotionallinkstable_id, // 推广主体id。目前为活动id
                status: row.status
            }
            this.updatePlinksForm = options;
            this.updatePlinksModalVisible = true;
        },
        // 保存编辑结果
        updatePlinks(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.updatePlinksFormLoading = true;
                    this.$axios.put('/admin/plinks/' + this.updatePlinksForm.id, this.updatePlinksForm).then(res => {
                        console.log(res)
                        if (res.code == 0) {
                            this.getPlinks();
                            this.$Message.success('更新成功！');
                            this.updatePlinksFormLoading = false;
                            this.updatePlinksModalVisible = false;
                        }
                    }).catch(error => {
                        this.updatePlinksFormLoading = false;
                    })
                } else {
                    this.updatePlinksFormLoading = false;
                }
            })
        },
        // 点击“删除”按钮
        delPlinks(params) {
            this.$Modal.confirm({
                title: '温馨提示',
                content: '<p>确定删除该推广链接吗？</p><p>该操作不可逆转，请谨慎操作！</p>',
                loading: false,
                onOk: () => {
                    this.$axios.delete('/admin/plinks/' + params.row.id).then(res => {
                        this.list.splice(params.index, 1);
                    })
                }
            })
        }
    }
}
</script>

<style lang="less">
.fn-hide {
    display: none !important;
}
.ivu-form .ivu-form-item-label {
    font-size: 14px !important;
}
</style>