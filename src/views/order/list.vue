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
      <Form-item label="图片ID" prop="a_9_product_id">
        <Input v-model="searchForm.a_9_product_id" placeholder="图片ID" @keyup.enter.native="getOrderLists"></Input>
      </Form-item>
      <Form-item label="图片编号" prop="product_9_identifier">
        <Input v-model="searchForm.product_9_identifier" placeholder="图片编号" @keyup.enter.native="getOrderLists"></Input>
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

    <!-- S 查看订单详情弹框 -->
    <Modal v-if="orderDetail" v-model="orderDetailModalVisible" title="订单详情" width="920">
      <div slot="footer">
        <Button size="large" @click="orderDetailModalVisible = false">关闭</Button>
      </div>
      <table class="my-table">
        <tr>
          <td colspan="6"><b>订单基本信息</b>（ID：{{orderDetail.order_pay.id}}）</td>
        </tr>
        <tr>
          <td>订单编号</td>
          <td>{{orderDetail.order_pay.out_trade_no}}</td>
          <td>下单时间</td>
          <td>{{orderDetail.order_pay.create_time}}</td>
          <td>支付时间</td>
          <td>{{orderDetail.order_pay.pay_time}}</td>
        </tr>
        <tr>
          <td>订单金额</td>
          <td>¥ {{(orderDetail.product_price/100).toFixed(2)}}</td>
          <td>订单状态</td>
          <td>
          <!-- 状态，1未支付，2已支付，3已过期，4用户主动取消，5交易叫停，6交易结束，7交易失败。 -->
          <template v-if="orderDetail.status == 1">待支付</template>
          <template v-else-if="orderDetail.status == 2">已支付</template>
          <template v-else-if="orderDetail.status == 3">已过期</template>
          <template v-else-if="orderDetail.status == 4">用户主动取消</template>
          <template v-else-if="orderDetail.status == 5">交易叫停</template>
          <template v-else-if="orderDetail.status == 6">交易结束</template>
          <template v-else-if="orderDetail.status == 7">交易失败</template>
          </td>
          <td>备注</td>
          <td colspan="3">{{orderDetail.order_pay.subject}}</td>
        </tr>
        <tr>
          <td colspan="6"><b>订单授权信息</b></td>
        </tr>
        <template v-if="orderDetail.license_object_type == 1">
        <tr>
          <td>授权类型</td>
          <td>个人</td>
          <td>姓名</td>
          <td>{{orderDetail.license_object_name}}</td>
          <td>身份证</td>
          <td>{{orderDetail.license_object_id}}</td>
        </tr>
        </template>
        <template v-if="orderDetail.license_object_type == 2">
        <tr>
          <td>授权类型</td>
          <td>企业</td>
          <td>企业名称</td>
          <td>{{orderDetail.license_object_name}}</td>
          <td>统一社会信用代码</td>
          <td>{{orderDetail.license_object_id}}</td>
        </tr>
        </template>
        <tr>
          <td colspan="6"><b>图片基本信息</b>（ID：{{orderDetail.product_snapshot.id}}）</td>
        </tr>
        <tr>
          <td>图片编号</td>
          <td>{{orderDetail.product_snapshot.identifier}}</td>
          <td>图片名称</td>
          <td>{{orderDetail.product_snapshot.name || '--'}}</td>
          <td>图片简介</td>
          <td>{{orderDetail.product_snapshot.desc || '--'}}</td>
        </tr>
        <tr>
          <td>图片分类</td>
          <td>{{orderDetail.product_snapshot.category_names || '--'}}</td>
          <td>图片标签</td>
          <td>{{orderDetail.product_snapshot.tag_names || '--'}}</td>
          <td>图片方向</td>
          <td>
            <template v-if="orderDetail.product_snapshot.rotate == 1">横向</template>
            <template v-else-if="orderDetail.product_snapshot.rotate == 2">竖向</template>
            <template v-else-if="orderDetail.product_snapshot.rotate == 3">正方</template>
          </td>
        </tr>
        <tr>
          <td>图片分辨率</td>
          <td>{{orderDetail.product_snapshot.width}}*{{orderDetail.product_snapshot.height}} px</td>
          <td>图片格式</td>
          <td>{{orderDetail.product_snapshot.format || '--'}}</td>
          <td>图片大小</td>
          <td>{{(orderDetail.product_snapshot.size / 1024 / 1024).toFixed(2)}}M</td>
        </tr>
        <tr>
          <td colspan="6"><b>图片EXIF信息</b></td>
        </tr>
        <tr>
          <td>品牌</td>
          <td>{{orderDetail.product_snapshot.exif_brand || '--'}}</td>
          <td>型号</td>
          <td>{{orderDetail.product_snapshot.exif_model || '--'}}</td>
          <td>焦距</td>
          <td>{{orderDetail.product_snapshot.exif_focal_length || '--'}}</td>
        </tr>
        <tr>
          <td>光圈</td>
          <td>{{orderDetail.product_snapshot.exif_f_number || '--'}}</td>
          <td>快门</td>
          <td>{{orderDetail.product_snapshot.exif_shutter || '--'}}</td>
          <td>ISO</td>
          <td>{{orderDetail.product_snapshot.exif_iso || '--'}}</td>
        </tr>
        <tr>
          <td>曝光</td>
          <td>{{orderDetail.product_snapshot.exif_exposure || '--'}}</td>
          <td>拍摄时间</td>
          <td>{{orderDetail.product_snapshot.exif_taketime || '--'}}</td>
          <td>镜头</td>
          <td>{{orderDetail.product_snapshot.exif_camera_lens || '--'}}</td>
        </tr>
        <tr>
          <td>颜色空间</td>
          <td>{{orderDetail.product_snapshot.exif_color_space || '--'}}</td>
          <td>DPI</td>
          <td colspan="3">{{orderDetail.product_snapshot.exif_dpi || '--'}}（以七牛的XResolution为准）</td>
        </tr>
        <tr>
          <td colspan="6"><b>图片售卖信息</b></td>
        </tr>
        <tr>
          <td>售卖方式</td>
          <td>
            <template v-if="orderDetail.product_snapshot.sale_info.type == 1">独家出售</template>
            <template v-else-if="orderDetail.product_snapshot.sale_info.type == 2">非独家出售</template>
          </td>
          <td>授权方式</td>
          <td>
            <template v-if="orderDetail.product_snapshot.sale_info.license == 1">普通授权</template>
            <template v-else-if="orderDetail.product_snapshot.sale_info.license == 2">编辑授权</template>
          </td>
          <td>普通价（元／年）</td>
          <td>¥ {{(parseInt(orderDetail.product_snapshot.sale_info.price)/100).toFixed(2) || '0.00'}}</td>
        </tr>
        <tr>
          <td>版权类型</td>
          <td>
            <template v-if="orderDetail.product_snapshot.sale_info.copyright_type == 1">肖像权</template>
            <template v-else-if="orderDetail.product_snapshot.sale_info.copyright_type == 2">其他版权</template>
            <template v-else-if="orderDetail.product_snapshot.sale_info.copyright_type == 3">--</template>
          </td>
          <td>版权证明资料</td>
          <td colspan="3">{{orderDetail.product_snapshot.sale_info.copyright_file_name || '--'}}</td>
        </tr>
      </table>
    </Modal>
    <!-- E 查看订单详情弹框 -->
  </div>
</template>

<script>
import imgView from '../my_components/img-view/img-view';
export default {
  data() {
    return {
      searchForm: {
        OrderPay_9_out_trade_no: '', // 订单编号
        a_9_product_id: '', // 图片ID
        user_9_nickname: '', // 用户昵称
        product_9_identifier: '', // 图片编号
        page: 1,
        page_size: 10,
        a_9_create_time: '',
        a_9_status: '' // 状态，1未支付，2已支付，3已过期，4用户主动取消，5交易叫停，6交易结束，7交易失败
      },
      orderDetail: '',
      orderDetailModalVisible: false,
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
          key: 'out_trade_no',
          render: (h, params) => {
            return h('span', params.row.order_pay.out_trade_no);
          }
        },
        {
          title: '合同信息',
          key: 'contract_num',
          width: 240,
          render: (h, params) => {
            let contract_num = params.row.contract_num;
            if (!contract_num) return;
            return h('span', {}, [h('p', '编号：' + contract_num), h('p', '版本：' + params.row.contract_version)]);
          }
        },
        {
          title: '图片编号',
          key: 'identifier',
          render: (h, params) => {
            return h('span', params.row.product_snapshot.identifier);
          }
        },
        {
          title: '图片信息',
          key: 'product',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h(
              'Poptip',
              {
                props: {
                  content: '图片信息',
                  trigger: 'hover',
                  transfer: true,
                  placement: 'right'
                }
              },
              [
                h('img', {
                  domProps: {
                    src: params.row.product_snapshot.thumbkey + '-h160?_=',
                    alt: params.row.product_snapshot.name,
                    title: params.row.product_snapshot.name
                  },
                  style: {
                    marginTop: '5px',
                    width: '50px',
                    height: '50px',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      this.clickImg(params.row.product_snapshot.thumbkey + '-topimg?_=');
                    }
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
                        src: params.row.product_snapshot.thumbkey + '-nlist?_='
                      },
                      style: {
                        maxWidth: '200px',
                        maxHeight: '200px'
                      },
                      on: {
                        click: () => {
                          this.clickImg(params.row.product_snapshot.thumbkey + '-topimg?_=');
                        }
                      }
                    }),
                    h('p', '标题：' + params.row.product_snapshot.name),
                    h('p', '编号：' + params.row.product_snapshot.identifier),
                    h('p', '图片ID：' + params.row.product_snapshot.id),
                    h('p', '作者：' + params.row.author_snapshot.nickname + '（ID：' + params.row.author_snapshot.id + '）')
                  ]
                )
              ]
            );
          }
        },
        {
          title: '下单时间',
          key: 'create_time',
          sortable: true
        },
        {
          title: '支付时间',
          key: 'pay_time',
          sortable: true
        },
        {
          title: '订单状态',
          key: 'status',
          width: 110,
          align: 'center',
          render: (h, params) => {
            let status = params.row.status;
            let status_str = '';
            let status_color = '';
            // 状态，1未支付，2已支付，3已过期，4用户主动取消，5交易叫停，6交易结束，7交易失败
            switch (status) {
              case 1:
                status_str = '未支付';
                status_color = 'blue';
                break;
              case 2:
                status_str = '已支付';
                status_color = 'green';
                break;
              case 3:
                status_str = '已过期';
                status_color = 'yellow';
                break;
              case 4:
                status_str = '用户取消';
                status_color = 'red';
                break;
              case 5:
                status_str = '交易叫停';
                status_color = 'yellow';
                break;
              case 6:
                status_str = '交易结束';
                status_color = 'green';
                break;
              case 7:
                status_str = '交易失败';
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
          key: '操作',
          align: 'right',
          render: (h, params) => {
            return h(
              'Button',
              {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.orderDetail = params.row;
                    this.orderDetailModalVisible = true;
                  }
                }
              },
              '查看详情'
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
