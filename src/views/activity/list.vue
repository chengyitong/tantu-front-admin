<template>
    <div>
        <img-view v-if="showImg" @click="showImg = false" :imgSrc="imgSrc"></img-view>
        <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
            <Form-item label="开始日期">
                <DatePicker type="date" v-model="searchForm.start_time" :options="datePickerOptions" placeholder="选择开始日期" style="width: 120px" @on-change="searchForm.start_time=$event"></DatePicker>
            </Form-item>
            <Form-item label="结束日期">
                <DatePicker type="date" v-model="searchForm.end_time" :options="datePickerOptions" placeholder="选择结束日期" style="width: 120px" @on-change="searchForm.end_time=$event"></DatePicker>
            </Form-item>
            <Form-item label="标题/奖品">
                <Input v-model="searchForm.name" placeholder="标题或奖品关键字" @keyup.enter.native="getActivityLists"></Input>
            </Form-item>
            <Button type="primary" @click="getActivityLists">
                <Icon type="search" size="14"></Icon>&nbsp;查询
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>
        <Page v-if="isShowPage" :total="count" show-total show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>
        
        <!-- S 投稿明细 -->
        <Modal v-model="productCountModalVisible" title="投稿明细" width="95%" :styles="{top: '20px'}">
            <div slot="footer">
                <Button type="primary" size="large" @click="productCountModalVisible = false">关闭</Button>
            </div>
            <Table :columns="product_list_columns" :data="product_list"></Table>
            <Page v-if="isShowPageProduct" :total="product_count" show-total @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>
        </Modal>
        <!-- E 投稿明细 -->

        <!-- S 参与用户明细 -->
        <Modal v-model="userCountModalVisible" title="参与用户明细" :styles="{top: '20px'}">
            <div slot="footer">
                <Button type="primary" size="large" @click="userCountModalVisible = false">关闭</Button>
            </div>
            <Table :columns="user_list_columns" :data="user_list"></Table>
            <Page v-if="isShowPageUser" :total="user_count" show-total @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>
        </Modal>
        <!-- E 参与用户明细 -->
    </div>
</template>

<script>
import imgView from '../my_components/img-view/img-view';
export default {
    data() {
        return {
            // 搜索
            searchForm:{
                page: 1,
                page_size: 10,
                start_time: '',
                end_time: '',
                name: ''
            },
            datePickerOptions: {
                shortcuts: [{
                    text: '今天',
                    value () {
                        return new Date();
                    }
                },{
                    text: '昨天',
                    value () {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24);
                        return date;
                    }
                },{
                    text: '一周前',
                    value () {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                        return date;
                    }
                },{
                    text: '一个月前',
                    value () {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24 * 30);
                        return date;
                    }
                },{
                    text: '两个月前',
                    value () {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24 * 60);
                        return date;
                    }
                },{
                    text: '三个月前',
                    value () {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24 * 90);
                        return date;
                    }
                }]
            },
            // 活动列表
            imgSrc: '', // 当前点击的图片链接
            showImg: false, // 显示放大的图片
            list: [],
            list_columns: [{
                    type: 'index',
                    width: 50,
                    align: 'center',
                    fixed: 'left'
                },{
                    title: '类型',
                    key: 'event_type',
                    sortable: true,
                    width: 110,
                    align: 'center',
                    fixed: 'left',
                    render: (h, params) => {
                        let event_type = params.row.event_type;
                        let event_type_str = event_type == 0 ? '赛事' : '任务';
                        let event_type_color = event_type == 0 ? 'green' : 'red';
                        return h('Tag', {
                            props: {
                                color: event_type_color,
                                type: 'dot',
                                size: 'small'
                            }
                        }, event_type_str);
                    },
                },{
                    title: '活动名称',
                    key: 'subject',
                    width: 280,
                    fixed: 'left',
                    sortable: true
                },{
                    title: '投稿数量',
                    key: 'product_count',
                    width: 110,
                    align: 'center',
                    sortable: true,
                    render: (h, params) => {
                        return h('Poptip',{
                            props: {
                                content: '点击数字查看投稿明细',
                                trigger: 'hover',
                                transfer: true,
                                placement: 'top'
                            }
                        },[
                            h('Button', {
                                props: {
                                    type: 'success',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.productCountModal(params.row);
                                    }
                                }
                            }, params.row.product_count),
                        ])
                    }
                },{
                    title: '参与人数',
                    key: 'user_count',
                    width: 110,
                    align: 'center',
                    sortable: true,
                    render: (h, params) => {
                        return h('Poptip',{
                            props: {
                                content: '点击数字查看参与明细',
                                trigger: 'hover',
                                transfer: true,
                                placement: 'top'
                            }
                        },[
                            h('Button', {
                                props: {
                                    type: 'warning',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.userCountModal(params.row);
                                    }
                                }
                            }, params.row.user_count),
                        ])
                    }
                },{
                    title: '开始日期',
                    key: 'start_time',
                    width: 110,
                    sortable: true
                },{
                    title: '结束日期',
                    key: 'end_time',
                    width: 110,
                    sortable: true
                },{
                    title: '奖品',
                    key: 'award',
                    width: 240,
                    sortable: true
                },{
                    title: '主页缩略图',
                    key: 'subject_banner_index',
                    width: 160,
                    align: 'center',
                    render: (h, params) => {
                        return h('img', {
                            domProps: {
                                src: params.row.subject_banner_index
                            },
                            style: {
                                marginTop: '5px',
                                maxWidth: '140px',
                                maxHeight: '60px',
                                cursor: 'pointer'
                            },
                            on: {
                                'click': () => {
                                    this.clickImg(params.row.subject_banner_index)
                                }
                            }
                        });
                    }
                },{
                    title: '首页Banner图',
                    key: 'subject_banner_detail',
                    width: 160,
                    align: 'center',
                    render: (h, params) => {
                        return h('img', {
                            domProps: {
                                src: params.row.subject_banner_detail
                            },
                            style: {
                                marginTop: '5px',
                                maxWidth: '140px',
                                maxHeight: '60px',
                                cursor: 'pointer'
                            },
                            on: {
                                'click': () => {
                                    this.clickImg(params.row.subject_banner_detail)
                                }
                            }
                        });
                    }
                },{
                    title: '列表缩略图',
                    key: 'subject_banner_list',
                    width: 160,
                    align: 'center',
                    render: (h, params) => {
                        return h('img', {
                            domProps: {
                                src: params.row.subject_banner_list
                            },
                            style: {
                                marginTop: '5px',
                                maxWidth: '140px',
                                maxHeight: '60px',
                                cursor: 'pointer'
                            },
                            on: {
                                'click': () => {
                                    this.clickImg(params.row.subject_banner_list)
                                }
                            }
                        });
                    }
                },{
                    title: '排序',
                    key: 'sortno',
                    width: 80,
                    sortable: true
                },{
                    title: '外链',
                    key: 'link',
                    width: 100,
                    sortable: true,
                    render: (h, params) => {
                        let link = params.row.link;
                        if (link == ''){
                            return h('Tag', {
                                props: {
                                    color: 'red',
                                    type: 'dot',
                                    size: 'small'
                                }
                            }, '无');
                        } else {
                            return h('Poptip',{
                                props: {
                                    content: link,
                                    trigger: 'hover',
                                    transfer: true,
                                    placement: 'top'
                                }
                            },[
                                h('Tag', {
                                    props: {
                                        color: 'green',
                                        type: 'dot',
                                        size: 'small'
                                    }
                                }, '有')
                            ])
                        }
                    }
                }, {
                    title: '操作',
                    key: 'action',
                    width: 130,
                    align: 'center',
                    fixed: 'right',
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
                                        // this.productCountModal(params.row);
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
                                        this.list.splice(params.index,1);
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
                }],
            count: 0,
            isShowPage: false,
            // 投稿明细
            productCountModalVisible: false,
            productCountFormLoading: false,
            product_list: [],
            product_list_columns: [{
                type: 'index',
                width: 50,
                align: 'center',
                fixed: 'left'
            },{
                title: 'ID',
                key: 'id',
                width: 80,
                align: 'center',
                sortable: true
            },{
                title: '预览图',
                key: 'imgkey',
                width: 150,
                align: 'center',
                render: (h, params) => {
                    return h('img', {
                        domProps: {
                            src: params.row.imgkey
                        },
                        style: {
                            marginTop: '5px',
                            maxWidth: '140px',
                            maxHeight: '60px'
                        }
                    });
                }
            },{
                title: '名称',
                key: 'name',
                width: 180,
                sortable: true
            },{
                title: '分类',
                key: 'classname',
                sortable: true
            },{
                title: '标签',
                key: 'tagname',
                sortable: true
            },{
                title: '颜色',
                key: 'colorname',
                sortable: true
            },{
                title: '状态',
                key: 'status',
                width: 130,
                align: 'center',
                sortable: true,
                render: (h, params) => {
                    let status = params.row.status;
                    let status_str = status == 1 ? '已上架' : '已下架';
                    let status_color = status == 1 ? 'green' : 'red';
                    return h('Tag', {
                        props: {
                            color: status_color,
                            type: 'dot',
                            size: 'small'
                        }
                    }, status_str);
                }
            },{
                title: '用户',
                key: 'nickname',
                sortable: true
            },{
                title: '属性',
                key: 'isfree',
                width: 120,
                align: 'center',
                sortable: true,
                render: (h, params) => {
                    let isfree = params.row.isfree;
                    let isfree_str = isfree == true ? '免费' : '收费';
                    let isfree_color = isfree == true ? 'green' : 'red';
                    return h('Tag', {
                        props: {
                            color: isfree_color,
                            type: 'dot',
                            size: 'small'
                        }
                    }, isfree_str);
                }
            },{
                title: '上传时间',
                key: 'ctime',
                width: 160,
                sortable: true
            },{
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
                                        this.updatePlinksModal(params.row);
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
                                        this.list.splice(params.index,1);
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
                }],
            product_count: 0,
            isShowPageProduct: false,
            // 参与用户明细
            userCountModalVisible: false,
            userCountFormLoading: false,
            user_list: [],
            user_list_columns: [{
                type: 'index',
                width: 50,
                align: 'center'
            },{
                title: '用户ID',
                key: 'uid',
                sortable: true
            },{
                title: '用户昵称',
                key: 'nickname',
                sortable: true
            },{
                title: '投稿数量',
                key: 'count',
                sortable: true
            }],
            user_count: 0,
            isShowPageUser: false
        }
    },
    components: {
        'img-view': imgView
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getActivityLists();
            // this.productCountModal();
        })
    },
    methods: {
        getActivityLists(){
            let data = this.$mock.mock({
                'list|1-10':[{
                    'id|+1':1,
                    'event_type|1': [0,1],  
                    'subject': '@ctitle(10,20)', 
                    'product_count': '@integer(0, 1000)', 
                    'user_count': '@integer(0, 1000)',
                    'start_time': '@date()',
                    'end_time': '@date()',
                    'award': '@ctitle(6,18)',
                    'subject_banner_index|1': [
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc071dd7e2.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc07fa8913.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc0876bcc3.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc407d1a91.jpg'
                    ],
                    'subject_banner_detail|1': [
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc758d89e2.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc74a1a584.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc7402c541.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc407d1c30.jpg'
                    ],
                    'subject_banner_list|1': [
                        'http://mis.tantupix.com/static/uploadfiles/event/5922a992837ad.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/5922b8f7ab973.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/5922c452459cb.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc407d1e32.jpg'
                    ],
                    'sortno|1': [1,2,3,4,5,6,7,8,9,10],
                    'link|1': [
                        '',
                        '',
                        '',
                        'http://www.gzzyphoto.com/',
                        'http://www.tantupix.com/event/event/id/13',
                        'http://www.tantupix.com/event/event/id/9'
                    ] 
                }]
            })
            this.list = data.list;
        },
        // 翻页
        handlePageChange(cur_page) {
            this.searchForm.page = cur_page;
            this.getActivityLists();
        },
        // 改变每页大小
        handlePageSizeChange(page_size) {
            this.searchForm.page_size = page_size;
            this.getActivityLists();
        },
        // 点击查看投稿数量明细
        productCountModal() {
            let data = this.$mock.mock({
                'list|1-10':[{
                    'id|+1':10000,
                    'imgkey|1': [
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc071dd7e2.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc07fa8913.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc0876bcc3.jpg',
                        'http://mis.tantupix.com/static/uploadfiles/event/59cfc407d1a91.jpg'
                    ],   // 预览图
                    'size': '@integer(1024, 102400)',  // 大小
                    'foldername': '@ctitle(2, 6)', // 相册
                    'name': '@ctitle(2, 18)', // 图片名称
                    'classids': '@range(7, 9)', // 分类id
                    'classname': '@ctitle(2,5)', // 分类名称
                    'tagids': '@range(3, 7)', // 标签id
                    'tagname': '@ctitle(2, 4)', // 标签名称
                    'colorids': '@range(4, 6)', // 颜色id
                    'colorvalue': '@color', // 颜色值
                    'status|1': [0,1], // 状态：0-下架；1-上架
                    'haspass|1': [-2,-1,0,1], // 审核结果：-2：待处理；-1:未通过；0:待审核；1:已发布
                    'nickname': '@ctitle(2, 8)', // 用户昵称
                    'isfree|1': [true,false], // 是否收费 boolean
                    'ctime': '@datetime' // 上传时间
                }]
            })
            this.product_list = data.list;
            this.productCountModalVisible = true;
        },
        // 点击查看参与用户明细
        userCountModal() {
            let data = this.$mock.mock({
                'list|1-20':[{
                    'id|+1':10000,
                    'uid|+1':10000,
                    'nickname': '@ctitle(2, 8)', // 用户昵称
                    'count': '@natural(60, 100)' // 投稿数量
                }]
            })
            this.user_list = data.list;
            this.userCountModalVisible = true;
        },
        // 查看预览图的放大图
        clickImg(src) {
            this.showImg = true;
            this.imgSrc = src;
        }
    }
}
</script>