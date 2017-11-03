<template>
    <div>
        <img-view v-if="showImg" @click="showImg = false" :imgSrc="imgSrc"></img-view>
        <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
            <Form-item label="图片ID" prop="id">
                <Input v-model="searchForm.id" placeholder="图片ID" @keyup.enter.native="getPictureLists"></Input>
            </Form-item>
            <Form-item label="图片名称" prop="name">
                <Input v-model="searchForm.name" placeholder="图片名称" @keyup.enter.native="getPictureLists"></Input>
            </Form-item>
            <Form-item label="分类" prop="category">
                <Select v-model="searchForm.category" filterable clearable @on-change="getPictureLists" style="width: 141px;">
                    <Option :value="1" :key="1">花草树木</Option>
                    <Option :value="0" :key="0">交通运输</Option>
                </Select>
            </Form-item>
            <Form-item label="标签/简介" prop="tag">
                <Input v-model="searchForm.tag" placeholder="标签或简介" @keyup.enter.native="getPictureLists"></Input>
            </Form-item>
            <!-- 用户上传图片后：未填写分类、颜色、标签等基本信息时处于待处理状态；填写之后则进入待审核状态；免费图片和版权保护图片不需要审核，直接进入已上架状态;上架之后对用户可见，否则不可见 -->
            <Form-item label="状态" prop="status">
                <Select v-model="searchForm.status" filterable clearable @on-change="getPictureLists" style="width: 141px;">
                    <Option :value="1" :key="1">待处理</Option>
                    <Option :value="2" :key="2">待审核</Option>
                    <Option :value="3" :key="3">不通过</Option>
                    <Option :value="4" :key="4">已上架</Option>
                    <Option :value="5" :key="5">已下架</Option>
                </Select>
            </Form-item>
            <Form-item label="类型" prop="type">
                <Select v-model="searchForm.type" filterable clearable @on-change="getPictureLists" style="width: 141px;">
                    <Option :value="1" :key="1">版权</Option>
                    <Option :value="2" :key="2">售卖</Option>
                    <Option :value="3" :key="3">免费</Option>
                </Select>
            </Form-item>
            <Form-item label="用户ID" prop="uid">
                <Input v-model="searchForm.uid" placeholder="用户ID" @keyup.enter.native="getPictureLists"></Input>
            </Form-item>
            <Form-item label="活动ID" prop="event_id">
                <Input v-model="searchForm.event_id" placeholder="活动ID" @keyup.enter.native="getPictureLists"></Input>
            </Form-item>
            <Form-item label="上传时间" prop="ctime">
                <DatePicker type="daterange" v-model="searchForm.ctime" :options="datePickerOptions" placeholder="请选择上传时间周期" style="width: 180px" @on-change="searchForm.ctime=$event"></DatePicker>
            </Form-item>
            <Button type="primary" @click="getPictureLists">
                <Icon type="search" size="14"></Icon>&nbsp;查询
            </Button>
            <Button type="info" @click="$refs['searchForm'].resetFields()">
                <Icon type="reply" size="14"></Icon>&nbsp;重置
            </Button>
        </Form>

        <Form>
            <Button type="error">
                <Icon type="trash-a" size="14"></Icon>&nbsp;批量删除
            </Button>
            <Button type="primary" v-if="searchForm.status == 5">
                <Icon type="android-upload" size="14"></Icon>&nbsp;批量上架
            </Button>
            <Button type="warning" v-if="searchForm.status == 4">
                <Icon type="android-download" size="14"></Icon>&nbsp;批量下架
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>
        <Page v-if="isShowPage" :total="count" show-total show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

        <!-- S 编辑 -->
        <Modal v-model="editModalVisible" title="编辑图片信息" width="920" :styles="{top: '20px'}">
            <div slot="footer">
                <Button size="large" @click="editModalVisible = false">关闭</Button>
                <Button type="primary" size="large" @click="editModalVisible = false">保存</Button>
            </div>
            <Form :model="editForm" :label-width="80">
                <Card style="margin-bottom: 10px">
                    <p slot="title">图片基本信息</p>
                    <Row :gutter="16">
                        <Col span="6">图片ID: 1000000</Col>
                        <Col span="10">图片Key: o_1bt9b80o9pn01c7td5grek1brib.jpg</Col>
                        <Col span="4">格式: jpeg</Col>
                        <Col span="4">大小: 11.98M</Col>
                    </Row>
                    <Row :gutter="16">
                        <Col span="6">所在相册: 【默认专辑】</Col>
                        <Col span="10">所属用户: 复效或下那式（ID:1000000）</Col>
                        <Col span="8">上传时间: 1981-12-12 23:33:12</Col>
                    </Row>
                </Card>

                <Card style="margin-bottom: 10px">
                    <p slot="title">图片EXIF信息</p>
                    <Row :gutter="16">
                        <Col span="6">品牌: 索尼</Col>
                        <Col span="6">型号: NIKON D750</Col>
                        <Col span="6">焦距：85.0 mm</Col>
                        <Col span="6">光圈：6.64 EV (f/10.0)</Col>
                        <Col span="6">快门：-4.91 EV (30 sec.)</Col>
                        <Col span="6">ISO：</Col>
                        <Col span="6">曝光：30 sec.</Col>
                        <Col span="6">镜头：</Col>
                        <Col span="12">拍摄时间：2017-10-25 16:44:34</Col>
                    </Row>
                </Card>

                <Card style="margin-bottom: 10px">
                    <p slot="title">活动信息</p>
                    <Row :gutter="16">
                        <Col span="8">活动ID: 1000000</Col>
                        <Col span="16">活动名称: 目条议你素化生决场复门张连在期油状铁质写所来而给无及</Col>
                    </Row>
                </Card>
                
                <Form-item label="图片名称" prop="name">
                    <Input v-model="editForm.name" placeholder="请输入图片名称" @keyup.enter.native="getPictureLists"></Input>
                </Form-item>
                <Form-item label="图片简介" prop="desc">
                    <Input v-model="editForm.desc" placeholder="请输入图片简介" @keyup.enter.native="getPictureLists"></Input>
                </Form-item>
                <Form-item label="图片分类" prop="classids">
                    <CheckboxGroup v-model="editForm.classids">
                        <Checkbox v-for="item in classOptions" :key="item.id" :label="item.id">{{ item.name }}</Checkbox>
                    </CheckboxGroup>
                </Form-item>
                <Form-item label="图片标签" prop="tagids">
                    <Input v-model="editForm.tagids"></Input>
                    <small>多个标签之间用英文逗号分隔</small>
                </Form-item>
                <Form-item label="图片颜色" prop="colorids">
                    <CheckboxGroup v-model="editForm.colorids">
                        <Checkbox v-for="item in coloridsOptions" :key="item.id" :label="item.id"><span class="color-box" :style="setColorStyle(item.color)"></span></Checkbox>
                    </CheckboxGroup>
                </Form-item>
                <Form-item label="图片状态" prop="status">
                    <RadioGroup v-model="editForm.status">
                        <Radio :label="1">待处理</Radio>
                        <Radio :label="2">待审核</Radio>
                        <Radio :label="3">不通过</Radio>
                        <Radio :label="4">已上架</Radio>
                        <Radio :label="5">已下架</Radio>
                    </RadioGroup>
                </Form-item>
                <Form-item label="不通过原因" prop="desc" v-if="editForm.status == 3">
                    <Input v-model="editForm.desc" placeholder="请输入不通过的原因" @keyup.enter.native="getPictureLists"></Input>
                </Form-item>
                <Form-item label="图片类型">
                    <RadioGroup v-model="editForm.type">
                        <Radio :label="1">版权保护</Radio>
                        <Radio :label="2">售卖</Radio>
                        <Radio :label="3">免费</Radio>
                    </RadioGroup>
                </Form-item>
                <Form-item label="图片方向" prop="rotate">
                    <RadioGroup v-model="editForm.rotate">
                        <Radio :label="1">横向</Radio>
                        <Radio :label="2">竖向</Radio>
                        <Radio :label="3">正方</Radio>
                    </RadioGroup>
                </Form-item>
                <Form-item label="图片分辨率">
                    <Input v-model="editForm.width" placeholder="宽度" style="width: 60px;"></Input>
                    &nbsp;X&nbsp;
                    <Input v-model="editForm.height" placeholder="高度" style="width: 60px;"></Input>
                </Form-item>
            </Form>
        </Modal>
        <!-- E 编辑 -->
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
                id: '',
                name: '',
                category: '',
                tag: '',
                status: '',
                uid: '',
                event_id: '',
                type: '',
                ctime: []
            },
            datePickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        value () {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            return [start, end];
                        }
                    }, {
                        text: '最近一个月',
                        value () {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            return [start, end];
                        }
                    }, {
                        text: '最近三个月',
                        value () {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            return [start, end];
                        }
                    }
                ]
            },
            // 图片列表
            imgSrc: '', // 当前点击的图片链接
            showImg: false, // 显示放大的图片
            list: [],
            list_columns: [{
                type: 'selection',
                width: 60,
                align: 'center',
                fixed: 'left'
            },{
                title: '图片ID',
                key: 'id',
                width: 100,
                align: 'center',
                fixed: 'left',
                sortable: true
            },{
                title: '缩略图',
                key: 'imgkey',
                width: 150,
                align: 'center',
                render: (h, params) => {
                    return h('span', { 
                            style: {
                                display: 'block',
                                margin: '0 auto'
                            }
                        }, [
                        h('Poptip',{
                            props: {
                                content: '缩略图',
                                trigger: 'hover',
                                transfer: true,
                                placement: 'right'
                            }
                        },[
                            h('img', {
                                domProps: {
                                    src: params.row.imgkey,
                                    alt: params.row.name,
                                    title: params.row.name
                                },
                                style: {
                                    display: 'block',
                                    margin: '5px auto 3px',
                                    maxWidth: '140px',
                                    maxHeight: '60px',
                                    cursor: 'pointer'
                                },
                                on: {
                                    'click': () => {
                                        this.clickImg(params.row.imgkey)
                                    }
                                }
                            }),
                            h('div', {
                                slot: 'content'
                            }, [
                                h('img', {
                                    domProps: {
                                        src: params.row.imgkey,
                                        alt: params.row.name,
                                        title: params.row.name
                                    },
                                    style: {
                                        display: 'block',
                                        margin: '5px auto 3px',
                                        maxWidth: '300px',
                                        maxHeight: '300px',
                                        cursor: 'pointer'
                                    },
                                    on: {
                                        'click': () => {
                                            this.clickImg(params.row.imgkey)
                                        }
                                    }
                                })
                            ])
                        ]),
                        h('span', {
                            style: {
                                display: 'block',
                                margin: '0 auto 3px auto'
                            }
                        }, '相册【' + params.row.foldername.substring(0, 5) + '】'),
                        h('a', {
                            domProps: {
                                href: 'http://mis.tantupix.com/product/img_api?id=25016',
                                target: '_self'
                            },
                            style: {
                                display: 'block',
                                margin: '0 auto 5px auto'
                            }
                        }, '下载（' + (params.row.size/1024).toFixed(2) + 'M）')
                    ]);
                }
            },{
                title: '图片名称',
                key: 'name',
                width: 200,
                sortable: true,
                render: (h, params) => {
                    return h('span',[
                        h('span', params.row.name + '.jpg'),
                        h('span', {
                            style: {
                                display: 'block',
                                margin: '8px auto 0'
                            }
                        }, '图片Key: o_1bt9b80o9pn01c7td5grek1brib.jpg')
                    ])
                }
            },{
                title: '图片简介',
                key: 'desc',
                width: 200,
                sortable: true
            },{
                title: '图片分类',
                key: 'category',
                width: 180,
                sortable: true
            },{
                title: '图片标签',
                key: 'tagname',
                width: 180,
                sortable: true
            },{
                title: '图片颜色',
                key: 'colorvalue',
                width: 180,
                sortable: true
            },{
                title: '图片状态',
                key: 'status',
                width: 130,
                align: 'center',
                sortable: true,
                render: (h, params) => {
                    let status = params.row.status;
                    let status_str = '';
                    let status_color = '';
                    switch(status){
                        case 1:
                            status_str = '待处理';
                            status_color = 'yellow';
                            break;
                        case 2:
                            status_str = '待审核';
                            status_color = 'blue';
                            break;
                        case 3:
                            status_str = '不通过';
                            status_color = 'red';
                            break;
                        case 4:
                            status_str = '已上架';
                            status_color = 'green';
                            break;
                        case 5:
                            status_str = '已下架';
                            status_color = 'red';
                            break;
                    }
                    return h('Tag', {
                        props: {
                            color: status_color,
                            type: 'dot',
                            size: 'small'
                        }
                    }, status_str);
                }
            },{
                title: '图片类型',
                key: 'type',
                width: 150,
                align: 'center',
                sortable: true,
                render: (h, params) => {
                    let type = params.row.type;
                    let type_str = '';
                    let type_color = '';
                    switch(type){
                        case 1:
                            type_str = '版权';
                            type_color = 'yellow';
                            break;
                        case 2:
                            type_str = '售卖';
                            type_color = 'blue';
                            break;
                        case 3:
                            type_str = '免费';
                            type_color = 'green';
                            break;
                    }
                    return h('Tag', {
                        props: {
                            color: type_color,
                            type: 'dot',
                            size: 'small'
                        }
                    }, type_str);
                }
            },{
                title: '图片方向',
                key: 'rotate',
                width: 150,
                align: 'center',
                sortable: true,
                render: (h, params) => {
                    let rotate = params.row.rotate;
                    let _str = '';
                    let _color = '';
                    switch(rotate){
                        case 1:
                            _str = '横向';
                            _color = 'yellow';
                            break;
                        case 2:
                            _str = '竖向';
                            _color = 'blue';
                            break;
                        case 3:
                            _str = '正方';
                            _color = 'green';
                            break;
                    }
                    return h('Tag', {
                        props: {
                            color: _color,
                            type: 'dot',
                            size: 'small'
                        }
                    }, _str);
                }
            },{
                title: '图片分辨率',
                key: 'width',
                width: 150,
                align: 'center',
                sortable: true,
                render: (h, params) => {
                    return h('span', params.row.width + ' * ' + params.row.height);
                }
            },{
                title: '用户昵称（ID）',
                key: 'nickname',
                width: 200,
                sortable: true,
                render: (h, params) => {
                    return h('span', params.row.nickname + '（ID:' + params.row.uid + '）');
                }
            },{
                title: '上传时间',
                key: 'ctime',
                width: 160,
                sortable: true
            },{
                title: 'EXIF信息',
                key: 'EXIF',
                width: 110,
                render: (h, params) => {
                    return h('Poptip',{
                        props: {
                            content: 'EXIF信息',
                            trigger: 'hover',
                            transfer: true,
                            placement: 'left'
                        }
                    },[
                        h('Tag', {
                            props: {
                                color: 'green',
                                size: 'small'
                            }
                        },'EXIF信息'),
                        h('div', {
                            slot: 'content'
                        }, [
                            h('p','品牌：' + params.row.brand),
                            h('p','型号：' + params.row.model),
                            h('p','焦距：' + params.row.jiaoju),
                            h('p','光圈：' + params.row.guangquan),
                            h('p','快门：' + params.row.kuaimen),
                            h('p','ISO：' + params.row.iso),
                            h('p','曝光：' + params.row.baoguang),
                            h('p','镜头：' + params.row.jingtou),
                            h('p','拍摄时间：' + params.row.taketime)
                        ])
                    ])
                }
            },{
                title: '活动信息',
                key: 'activity',
                width: 110,
                render: (h, params) => {
                    return h('Poptip',{
                        props: {
                            content: '活动信息',
                            trigger: 'hover',
                            transfer: true,
                            placement: 'left'
                        }
                    },[
                        h('Tag', {
                            props: {
                                color: 'yellow',
                                size: 'small'
                            }
                        },'活动信息'),
                        h('div', {
                            slot: 'content'
                        }, [
                            h('p','活动ID：9'),
                            h('p','活动名称：' + params.row.name)
                        ])
                    ])
                }
            },{
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
                                    // this.updatePlinksModal(params.row);
                                    this.editModalVisible = true;
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
            count: 100,
            isShowPage: true,
            // 编辑图片信息
            editModalVisible: false,
            coloridsOptions: [], // 所有的颜色
            classOptions: [], // 所有的分类
            editForm: {
                id: '',
                uid: '',
                imgkey: '',
                size: '',
                foldername: '',
                name: '',
                desc: '',
                classids: [1,4],
                category: '',
                tagids: '室内,建筑,装修',
                tagname: '',
                colorids: [1,6],
                colorvalue: '',
                status: 4,
                rotate: 2,
                width: 2354,
                height: 1987,
                brand: '索尼',
                model: 'NIKON D750', // EXIF信息：相机型号
                jiaoju: '85.0 mm', // EXIF信息：焦距
                guangquan: '6.64 EV (f/10.0)',// EXIF信息：光圈
                kuaimen: '-4.91 EV (30 sec.)',// EXIF信息：快门
                iso: '',// EXIF信息：ISO
                baoguang: '30 sec.',// EXIF信息：曝光
                jingtou: '',// EXIF信息：镜头
                taketime: '1981-12-12 23:33:12', // EXIF信息：拍摄时间
                nickname: '复效或下那式', // 用户昵称
                type: 1, // 类型
                ctime: '2017-10-25 16:44:34' // 上传时间
            }
        }
    },
    components: {
        'img-view': imgView
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getPictureLists();
            // mock分类数据
            let class_mock = this.$mock.mock({
                'list|10-20': [{
                    'id|+1': 1,
                    'name': '@ctitle(2, 5)'
                }]
            })
            this.classOptions = class_mock.list;
            // mock颜色数据
            let colorids_mock = this.$mock.mock({
                'list|4-8': [{
                    'id|+1': 1,
                    'color': '@color()'
                }]
            })
            this.coloridsOptions = colorids_mock.list;
        })
    },
    methods: {
        getPictureLists(){
            let data = this.$mock.mock({
                'list|1-10':[{
                    'id|+1': 1000000,
                    'uid|+1': 1000000,
                    'imgkey|1': [
                        'https://oj8icns2m.qnssl.com/o_1bsruh1iat6dj3a13sp1ba6hs7b.jpg-ndetail?_=',
                        'https://oj8icns2m.qnssl.com/o_1bt0v0vun1totn6m1a6r1krpc7113.jpg-slist?_=',
                        'https://oj8icns2m.qnssl.com/o_1bspvl3v6ibacak1eu81k4o1krjb.jpg-ndetail?_='
                    ],   // 预览图
                    'size': '@integer(1024, 20480)',  // 大小
                    'foldername': '@ctitle(2, 10)', // 相册
                    'name': '@ctitle(2, 18)', // 图片名称
                    'desc': '@ctitle(4, 28)', // 图片名称
                    'classids': '@range(7, 9)', // 分类id
                    'category': '@ctitle(2,5)', // 分类名称
                    'tagids': '@range(3, 7)', // 标签id
                    'tagname|1': [
                        '天空',
                        '美女',
                        '性感',
                        '蒙古',
                        '欧美风情'
                    ], // 标签名称
                    'colorids': '@range(4, 6)', // 颜色id
                    'colorvalue': '@color', // 颜色值
                    'status|1': [1,2,3,4,5], // 审核结果：-2：待处理；-1:不通过；0:待审核；1:已发布
                    'rotate|1': [1,2,3], // 图片方向：1-横向；2-竖向；3-正方
                    'width': '@natural(2000, 4000)', // 图片宽度
                    'height': '@natural(2000, 4000)', // 图片高度
                    'brand|1': [
                        '尼康',
                        '索尼'
                    ], // 品牌
                    'model': 'NIKON D750', // EXIF信息：相机型号
                    'jiaoju': '85.0 mm', // EXIF信息：焦距
                    'guangquan': '6.64 EV (f/10.0)',// EXIF信息：光圈
                    'kuaimen': '-4.91 EV (30 sec.)',// EXIF信息：快门
                    'iso': '',// EXIF信息：ISO
                    'baoguang': '30 sec.',// EXIF信息：曝光
                    'jingtou': '',// EXIF信息：镜头
                    'taketime': '@datetime', // EXIF信息：拍摄时间
                    'nickname': '@ctitle(2, 8)', // 用户昵称
                    'type|1': [1,2,3], // 类型
                    'ctime': '@datetime' // 上传时间
                }]
            })
            this.list = data.list;
        },
        // 翻页
        handlePageChange(cur_page) {
            this.searchForm.page = cur_page;
            this.getPictureLists();
        },
        // 改变每页大小
        handlePageSizeChange(page_size) {
            this.searchForm.page_size = page_size;
            this.getPictureLists();
        },
        // 查看缩略图的放大图
        clickImg(src) {
            this.showImg = true;
            this.imgSrc = src;
        },
        // 设置图片颜色的背景
        setColorStyle(color){
            return 'background-color:' + color;
        }
    }
}
</script>

<style lang="less" scoped>
.color-box {
    display: inline-block;
    width: 30px;
    text-align: center;
    height: 30px;
    line-height: 30px;
    background-color: #eee;
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
    vertical-align: middle;
}
.ivu-form-item {
    margin-bottom: 10px !important;
}
</style>
