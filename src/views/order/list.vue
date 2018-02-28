<template>
  <div>
    <img-view v-if="showImg" @click="showImg = false;" :imgSrc="imgSrc"></img-view>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
      <Form-item label="订单编号" prop="OrderPay_9_out_trade_no">
        <Input v-model="searchForm.OrderPay_9_out_trade_no" placeholder="订单编号" @keyup.enter.native="getOrderLists"></Input>
      </Form-item>
      <Form-item label="订单状态" prop="a_9_status">
        <Select v-model="searchForm.a_9_status" filterable clearable placeholder="默认全部" @on-change="getOrderLists" style="width: 141px;">
          <!-- 状态，1未支付，2已支付，3已过期，4用户主动取消，5交易叫停，6交易结束，7交易失败。 -->
          <Option :value="1" :key="1">未支付</Option>
          <Option :value="2" :key="2">已支付</Option>
          <Option :value="3" :key="3">已过期</Option>
          <Option :value="4" :key="4">用户主动取消</Option>
          <Option :value="5" :key="5">交易叫停</Option>
          <Option :value="6" :key="6">交易结束</Option>
          <Option :value="7" :key="7">交易失败</Option>
        </Select>
      </Form-item>
      <Form-item label="下单时间" prop="a_9_create_time">
        <DatePicker type="daterange" v-model="searchForm.a_9_create_time" :options="datePickerOptions" placeholder="请选择下单时间周期" style="width: 180px" @on-change="searchForm.a_9_create_time=$event"></DatePicker>
      </Form-item>
      <Form-item label="用户昵称" prop="user_9_nickname">
        <Input v-model="searchForm.user_9_nickname" placeholder="用户昵称" @keyup.enter.native="getOrderLists"></Input>
      </Form-item>
      <Form-item label="作品ID" prop="a_9_product_id">
        <Input v-model="searchForm.a_9_product_id" placeholder="作品ID" @keyup.enter.native="getOrderLists"></Input>
      </Form-item>
      <Form-item label="作品编号" prop="product_9_identifier">
        <Input v-model="searchForm.product_9_identifier" placeholder="作品编号" @keyup.enter.native="getOrderLists"></Input>
      </Form-item>
      <Button type="primary" @click="getOrderLists">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
      <Button type="info" @click="$refs['searchForm'].resetFields()">
        <Icon type="reply" size="14"></Icon>&nbsp;重置
      </Button>
    </Form>

    <Table :loading="table_loading" :columns="list_columns" :data="list"></Table>
    <Page v-if="count > 0" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>
  </div>
</template>

<script>
import imgView from '../my_components/img-view/img-view';
export default {
  data() {
    return {
      searchForm: {
        OrderPay_9_out_trade_no: '', // 订单编号
        a_9_product_id: '', // 作品ID
        user_9_nickname: '', // 用户昵称
        product_9_identifier: '', // 作品编号
        page: 1,
        page_size: 10,
        a_9_create_time: '',
        a_9_status: '' // 状态，1未支付，2已支付，3已过期，4用户主动取消，5交易叫停，6交易结束，7交易失败
      },
      datePickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            }
          },
          {
            text: '最近一个月',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            }
          },
          {
            text: '最近三个月',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            }
          }
        ]
      },
      table_loading: false,
      list: [],
      list_columns: [
        {
          title: '订单编号',
          key: 'nickname'
        },
        {
          title: '用户头像',
          key: 'avatar',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h(
              'Poptip',
              {
                props: {
                  content: '用户头像',
                  trigger: 'hover',
                  transfer: true,
                  placement: 'right'
                }
              },
              [
                h('img', {
                  domProps: {
                    src: params.row.user.avatar,
                    alt: params.row.user.nickname,
                    title: params.row.user.nickname
                  },
                  style: {
                    marginTop: '5px',
                    width: '50px',
                    height: '50px',
                    cursor: 'pointer'
                  }
                }),
                h(
                  'div',
                  {
                    slot: 'content'
                  },
                  [
                    h('img', {
                      domProps: {
                        src: params.row.user.avatar
                      },
                      style: {
                        maxWidth: '200px',
                        maxHeight: '200px'
                      }
                    })
                  ]
                )
              ]
            );
          }
        },
        {
          title: '认证类型',
          key: 'type',
          align: 'center',
          render: (h, params) => {
            let type = params.row.type;
            let type_color = '';
            let type_str = '';
            if (type == 1) {
              type_color = 'blue';
              type_str = '个人';
            }
            if (type == 2) {
              type_color = 'green';
              type_str = '企业/机构';
            }
            return h(
              'Tag',
              {
                props: {
                  color: type_color,
                  size: 'small'
                }
              },
              type_str
            );
          }
        },
        {
          title: '申请认证时间',
          key: 'apply_time',
          sortable: true
        },
        {
          title: '处理时间',
          key: 'handle_time',
          sortable: true
        },
        {
          title: '认证状态',
          key: 'status',
          width: 110,
          align: 'center',
          render: (h, params) => {
            let status = params.row.status;
            let status_str = '';
            let status_color = '';
            switch (status) {
              case 1:
                status_str = '未认证';
                status_color = 'blue';
                break;
              case 2:
                status_str = '认证中';
                status_color = 'yellow';
                break;
              case 3:
                status_str = '已认证';
                status_color = 'green';
                break;
              case 4:
                status_str = '已驳回';
                status_color = 'red';
                break;
            }

            return h(
              'Tag',
              {
                props: {
                  color: status_color,
                  size: 'small'
                }
              },
              status_str
            );
          }
        },
        {
          title: '操作',
          key: '认证资料',
          align: 'right',
          render: (h, params) => {
            let operate_str = '查看详情';
            if (params.row.status == 2) {
              operate_str = '审核';
            }
            return h(
              'Button',
              {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {}
                }
              },
              operate_str
            );
          }
        }
      ],
      count: 0, // 总数据条数
      isShowPage: false,
      imgSrc: '', // 当前点击的图片链接
      showImg: false // 显示放大的图片
    };
  },
  components: {
    'img-view': imgView
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getOrderLists();
    });
  },
  methods: {
    // 获取订单列表
    getOrderLists() {
      this.table_loading = true;
      let params = this.$util.deleteEmptyObj(this.searchForm);
      this.$axios.get('/admin/orderproduct', { params }).then(res => {
        this.list = res.data.list;
        this.count = res.data.count;
        this.table_loading = false;
      });
    },
    // 翻页
    handlePageChange(cur_page) {
      this.searchForm.page = cur_page;
      this.getOrderLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getOrderLists();
    },
    // 查看缩略图的放大图
    clickImg(src) {
      this.showImg = true;
      this.imgSrc = src;
    }
  }
};
</script>
