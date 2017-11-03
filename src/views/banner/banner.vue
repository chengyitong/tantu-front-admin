<template>
    <div>
        <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="50" inline>
            <Form-item label="类型">
                <Select v-model="searchForm.banner_type" @on-change="getPlinks" style="width: 180px">
                    <Option :value="1" :key="1">首页Banner</Option>
                    <Option :value="2" :key="2">个人中心默认Banner</Option>
                </Select>
            </Form-item>
            <Button type="primary" @click="getPlinks">
                <Icon type="search" size="14"></Icon>&nbsp;查询
            </Button>
            <Button type="success" @click="addBannerModalVisible = true">
                <Icon type="plus" size="14"></Icon>&nbsp;添加Banner
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>

        <!-- 添加Banner弹框 -->
        <Modal v-model="addBannerModalVisible" title="添加Banner" width="800">
            <div slot="footer">
                <Button type="text" size="large" @click="addBannerCancel('addBannerForm')">取消</Button>
                <Button type="primary" size="large" :loading="addBannerFormLoading" @click="addBanner('addBannerForm')">确定</Button>
            </div>
            <Form ref="addBannerForm" :model="addBannerForm" :rules="addBannerFormRules" label-position="right" :label-width="100">
                <Form-item label="类型" prop="banner_type">
                    <Select v-model="addBannerForm.banner_type" @on-change="getPlinks" style="width: 180px">
                        <Option :value="1" :key="1">首页Banner</Option>
                        <Option :value="2" :key="2">个人中心默认Banner</Option>
                    </Select>
                </Form-item>
                <Form-item label="名称" prop="name">
                    <Input v-model="addBannerForm.name" placeholder="请输入Banner图片的名称" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
                </Form-item>
                <Form-item label="Banner图" prop="mark">
                    <Input v-model="addBannerForm.mark" placeholder="请输入Banner图片的链接" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
                </Form-item>
                <Form-item label="跳转链接" prop="jump_link">
                    <Input v-model="addBannerForm.jump_link" placeholder="请输入点击图片后的跳转链接" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
                </Form-item>
                <Form-item label="备注" prop="mark">
                    <Input v-model="addBannerForm.mark" placeholder="请输入备注" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
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
                banner_type: 1
            },
            list: [], // 推广链接列表
            list_columns: [
                {
                    title: '名称',
                    key: 'subject',
                    render: (h, params) => {
                        let subject = params.row.event.subject;
                        return h('span', subject);
                    }
                }, {
                    title: '缩略图',
                    key: 'name',
                    sortable: true
                },{
                    title: '作者',
                    key: 'name',
                    sortable: true
                }, {
                    title: '跳转链接',
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
            addBannerModalVisible: false,
            addBannerForm: {
                banner_type: 1,
                name: null, // 名称
                jump_link: null, // 跳转的页面
                mark: null, // 备注
                event_type: 'Event', // 推广主体类名。 目前全部是Event
                event_id: null // 推广主体id。目前为活动id
            },
            addBannerFormRules: {
                banner_type: [
                    { type: 'number', required: true, message: '请选择Banner类型', trigger: 'change' }
                ],
                event_id: [
                    { type: 'number', required: true, message: '请选择推广主体', trigger: 'change' }
                ]
            },
            addBannerFormLoading: false,
            updatePlinksModalVisible: false,
            updatePlinksForm: {},
            updatePlinksFormLoading: false
        }
    },
    mounted: function() {
        this.$nextTick(function() {
            // this.getEventList();
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
                    this.event_ids.push(options);
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
        addBanner(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.addBannerFormLoading = true;
                    this.$axios.post('/admin/plinks', this.addBannerForm).then(res => {
                        console.log(res)
                        if (res.code == 0) {
                            this.getPlinks();
                            this.$Message.success('添加成功！');
                            this.addBannerCancel(name);
                            this.addBannerFormLoading = false;
                        }
                    })
                } else {
                    this.addBannerFormLoading = false;
                }
            })
        },
        // 取消添加
        addBannerCancel(name) {
            this.addBannerModalVisible = false;
            this.$refs[name].resetFields();
        },
        // 点击“编辑”按钮
        updatePlinksModal(row) {
            let options = {
                id: row.id,
                name: row.name, // 名称
                jump_link: row.jump_link, // 跳转的页面
                mark: row.mark, // 备注
                event_type: row.event_type, // 推广主体类名。 目前全部是Event
                event_id: row.event_id, // 推广主体id。目前为活动id
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
