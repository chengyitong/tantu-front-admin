<template>
  <div>
    <img-view v-if="showImg" @click="showImg = false;" :imgSrc="imgSrc"></img-view>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
      <Form-item label="图片ID" prop="id">
        <Input v-model="searchForm.id" placeholder="图片ID" @keyup.enter.native="getSaleProductLists"></Input>
      </Form-item>
      <Form-item label="图片名称" prop="name">
        <Input v-model="searchForm.name" placeholder="图片名称" @keyup.enter.native="getSaleProductLists"></Input>
      </Form-item>
      <Form-item label="状态" prop="sale_info_9_status">
        <Select v-model="searchForm.sale_info_9_status" clearable @on-change="getSaleProductLists" style="width: 141px;">
          <Option :value="1" :key="1">不进行售卖</Option>
          <Option :value="2" :key="2">待审核</Option>
          <Option :value="3" :key="3">售卖中</Option>
          <Option :value="4" :key="4">审核不通过</Option>
          <Option :value="5" :key="5">被下架</Option>
          <Option :value="6" :key="6">被买断</Option>
        </Select>
      </Form-item>
      <Form-item label="是否推荐" prop="a_9_is_recommend">
        <Select v-model="searchForm.a_9_is_recommend" clearable @on-change="getSaleProductLists" style="width: 141px;">
          <Option :value="0" :key="0">不推荐</Option>
          <Option :value="1" :key="1">推荐</Option>
        </Select>
      </Form-item>
      <Form-item label="分类" prop="category_product_9_category_id">
        <Select v-model="searchForm.category_product_9_category_id" filterable clearable @on-change="getSaleProductLists" style="width: 141px;">
          <Option v-for="item in categoryOptions" :key="item.id" :value="item.id">{{ item.name }}</Option>
        </Select>
      </Form-item>
      <Form-item label="用户ID" prop="a_9_user_id">
        <Input v-model="searchForm.a_9_user_id" placeholder="用户ID" @keyup.enter.native="getSaleProductLists"></Input>
      </Form-item>
      <Form-item label="上传时间" prop="a_9_create_time">
        <DatePicker type="daterange" v-model="searchForm.a_9_create_time" :options="datePickerOptions" placeholder="请选择上传时间周期" style="width: 180px" @on-change="searchForm.a_9_create_time=$event;getSaleProductLists()"></DatePicker>
      </Form-item>
      <Button type="primary" @click="getSaleProductLists">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
      <Button type="info" @click="$refs['searchForm'].resetFields()">
        <Icon type="reply" size="14"></Icon>&nbsp;重置
      </Button>
    </Form>

    <div style="margin-bottom: 10px;">
      <Button v-show="searchForm.sale_info_9_status == 3" @click="productRecommends">批量推荐</Button>
      <Button v-show="searchForm.sale_info_9_status == 3" @click="productCancelRecommends">取消推荐</Button>
    </div>

    <Table :loading="table_loading" :columns="list_columns" :data="list" @on-selection-change="onSelectionChange"></Table>

    <div style="margin-top: 10px;">
      <Button v-show="searchForm.sale_info_9_status == 3" @click="productRecommends">批量推荐</Button>
      <Button v-show="searchForm.sale_info_9_status == 3" @click="productCancelRecommends">取消推荐</Button>
    </div>

    <Page v-if="isShowPage" :total="count" show-total show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

    <!-- S 查看图片详情弹框 -->
    <Modal v-model="productDetailModalVisible" title="图片详情" width="920">
      <div slot="footer">
        <Button size="large" @click="productDetailModalVisible = false">关闭</Button>
        <Button v-if="productDetail.sale_info.status == 2" type="primary" size="large" @click="updateStatusModal(productDetail.id)">审核</Button>
        <Button v-if="productDetail.sale_info.status == 3" type="primary" size="large" @click="updateStatusModal(productDetail.id)">下架</Button>
        <Button v-if="productDetail.sale_info.status == 5" type="primary" size="large" @click="updateStatusModal(productDetail.id)">上架</Button>
      </div>
      <table class="my-table">
        <tr>
          <td>当前售卖状态</td>
          <td colspan="5">
            <template v-if="productDetail.sale_info.status == 1">不进行售卖（用户主动撤销）</template>
            <template v-if="productDetail.sale_info.status == 2">等待审核&nbsp;&nbsp;<Button type="primary" size="small" @click="updateStatusModal(productDetail.id)">审核</Button></template>
            <template v-if="productDetail.sale_info.status == 3">售卖中&nbsp;&nbsp;<Button type="primary" size="small" @click="updateStatusModal(productDetail.id)">下架</Button></template>
            <template v-if="productDetail.sale_info.status == 4">审核不通过，原因：{{productDetail.sale_info.pass_str}}</template>
            <template v-if="productDetail.sale_info.status == 5">被下架，原因：{{productDetail.sale_info.pass_str}}（由管理员操作）&nbsp;&nbsp;<Button type="primary" size="small" @click="updateStatusModal(productDetail.id)">上架</Button></template>
            <template v-if="productDetail.sale_info.status == 6">被买断（买断后不再出现在图片市场）</template>
          </td>
        </tr>
        <tr>
          <td colspan="6"><b>基本信息</b></td>
        </tr>
        <tr>
          <td>图片名称</td>
          <td>{{productDetail.name || '--'}}</td>
          <td>图片简介</td>
          <td>{{productDetail.desc || '--'}}</td>
          <td>图片分类</td>
          <td>{{productDetail.category_names || '--'}}</td>
        </tr>
        <tr>
          <td>图片标签</td>
          <td>{{productDetail.tag_names || '--'}}</td>
          <td>图片方向</td>
          <td>
            <template v-if="productDetail.rotate == 1">横向</template>
            <template v-else-if="productDetail.rotate == 2">竖向</template>
            <template v-else-if="productDetail.rotate == 3">正方</template>
          </td>
          <td>图片分辨率</td>
          <td>{{productDetail.width}}*{{productDetail.height}} px</td>
        </tr>
        <tr>
          <td>图片格式</td>
          <td>{{productDetail.format || '--'}}</td>
          <td>图片后缀</td>
          <td>{{productDetail.imgext || '--'}}</td>
          <td>图片大小</td>
          <td>{{(productDetail.size / 1024 / 1024).toFixed(2)}}M</td>
        </tr>
        <tr>
          <td colspan="6"><b>EXIF信息</b></td>
        </tr>
        <tr>
          <td>品牌</td>
          <td>{{productDetail.exif_brand || '--'}}</td>
          <td>型号</td>
          <td>{{productDetail.exif_model || '--'}}</td>
          <td>焦距</td>
          <td>{{productDetail.exif_focal_length || '--'}}</td>
        </tr>
        <tr>
          <td>光圈</td>
          <td>{{productDetail.exif_f_number || '--'}}</td>
          <td>快门</td>
          <td>{{productDetail.exif_shutter || '--'}}</td>
          <td>ISO</td>
          <td>{{productDetail.exif_iso || '--'}}</td>
        </tr>
        <tr>
          <td>曝光</td>
          <td>{{productDetail.exif_exposure || '--'}}</td>
          <td>拍摄时间</td>
          <td>{{productDetail.exif_taketime || '--'}}</td>
          <td>镜头</td>
          <td>{{productDetail.exif_camera_lens || '--'}}</td>
        </tr>
        <tr>
          <td>颜色空间</td>
          <td>{{productDetail.exif_color_space || '--'}}</td>
          <td>DPI</td>
          <td colspan="3">{{productDetail.exif_dpi || '--'}}（以七牛的XResolution为准）</td>
        </tr>
        <tr>
          <td colspan="6"><b>售卖信息</b></td>
        </tr>
        <tr>
          <td>售卖方式</td>
          <td>
            <template v-if="productDetail.sale_info.type == 1">独家出售</template>
            <template v-else-if="productDetail.sale_info.type == 2">非独家出售</template>
          </td>
          <td>授权方式</td>
          <td>
            <template v-if="productDetail.sale_info.license == 1">普通授权</template>
            <template v-else-if="productDetail.sale_info.license == 2">编辑授权</template>
          </td>
          <td>普通价（元／年）</td>
          <td>¥{{(parseInt(productDetail.sale_info.price)/100).toFixed(2) || '0.00'}}</td>
        </tr>
        <tr>
          <td>版权类型</td>
          <td>
            <template v-if="productDetail.sale_info.copyright_type == 1">肖像权</template>
            <template v-else-if="productDetail.sale_info.copyright_type == 2">物权</template>
            <template v-else-if="productDetail.sale_info.copyright_type == 3">无</template>
          </td>
          <td>版权证明资料</td>
          <td colspan="3">{{productDetail.sale_info.copyright_file_name || '--'}}</td>
        </tr>
      </table>
    </Modal>
    <!-- E 查看图片详情弹框 -->

    <!-- 审核弹框 -->
    <Modal v-model="updateStatusModalVisible" title="改变图片售卖状态">
      <div slot="footer">
        <Button type="text" size="large" @click="updateStatusCancel('updateStatusForm')">取消</Button>
        <Button type="primary" size="large" :loading="updateStatusFormLoading" @click="updateStatus('updateStatusForm')">确定</Button>
      </div>
      <Form ref="updateStatusForm" :model="updateStatusForm" label-position="right" :label-width="100">
        <Form-item label="处理结果" prop="status">
          <template v-if="productDetail.sale_info.status == 2">
            <RadioGroup v-model="updateStatusForm.status">
              <Radio :label="3">审核通过</Radio>
              <Radio :label="4">审核不通过</Radio>
            </RadioGroup>
          </template>
          <template v-if="productDetail.sale_info.status == 3">
            <RadioGroup v-model="updateStatusForm.status">
              <Radio :label="5">下架</Radio>
            </RadioGroup>
          </template>
          <template v-if="productDetail.sale_info.status == 5">
            <RadioGroup v-model="updateStatusForm.status">
              <Radio :label="3">上架</Radio>
            </RadioGroup>
          </template>
        </Form-item>
        <Form-item v-if="updateStatusForm.status == 4" label="不通过的原因" prop="pass_str">
          <Input type="textarea" v-model="updateStatusForm.pass_str" placeholder="填写不通过的原因"></Input>
        </Form-item>
        <Form-item v-if="updateStatusForm.status == 5" label="下架的原因" prop="pass_str">
          <Input type="textarea" v-model="updateStatusForm.pass_str" placeholder="填写下架的原因"></Input>
        </Form-item>
      </Form>
    </Modal>
  </div>
</template>

<script>
import imgView from '../my_components/img-view/img-view';
export default {
  data() {
    return {
      // 搜索
      searchForm: {
        page: 1,
        page_size: 10,
        id: null,
        name: null,
        category_product_9_category_id: null,
        sale_info_9_status: null,
        a_9_user_id: null,
        a_9_create_time: [],
        a_9_is_recommend: null // 是否推荐，0不推荐，1推荐
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
      categoryOptions: [], // 所有的分类
      colorOptions: [], // 所有的颜色
      // 图片列表
      imgSrc: '', // 当前点击的图片链接
      showImg: false, // 显示放大的图片
      table_loading: false,
      list: [],
      list_columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '缩略图',
          key: 'imgkey',
          width: 150,
          align: 'center',
          render: (h, params) => {
            let is_recommend = params.row.is_recommend;
            let is_recommend_str = is_recommend == 0 ? '【否】' : '【是】';
            return h(
              'span',
              {
                style: {
                  display: 'block',
                  margin: '0 auto'
                }
              },
              [
                h(
                  'Poptip',
                  {
                    props: {
                      content: '缩略图',
                      trigger: 'hover',
                      transfer: true,
                      placement: 'right'
                    }
                  },
                  [
                    h('img', {
                      domProps: {
                        src: params.row.thumbkey + '-h160?_=',
                        alt: params.row.name,
                        title: params.row.name
                      },
                      style: {
                        display: 'block',
                        margin: '5px auto 3px',
                        maxWidth: '140px',
                        maxHeight: '40px',
                        cursor: 'pointer'
                      },
                      on: {
                        click: () => {
                          this.clickImg(params.row.thumbkey + '-topimg?_=');
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
                            src: params.row.thumbkey + '-nlist?_=',
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
                            click: () => {
                              this.clickImg(params.row.thumbkey + '-topimg?_=');
                            }
                          }
                        })
                      ]
                    )
                  ]
                ),
                h(
                  'span',
                  {
                    style: {
                      display: 'block',
                      margin: '0 auto 3px auto'
                    }
                  },
                  '是否推荐' + is_recommend_str
                ),
                h(
                  'a',
                  {
                    domProps: {
                      href: '/admin/product/download/' + params.row.id,
                      target: '_blank'
                    },
                    style: {
                      display: 'block',
                      margin: '0 auto 5px auto'
                    }
                  },
                  '下载（' + (params.row.size / 1024 / 1024).toFixed(2) + 'M）'
                )
              ]
            );
          }
        },
        {
          title: '图片名称',
          key: 'name',
          sortable: true,
          render: (h, params) => {
            return h('span', [h('p', params.row.name == null ? '' : params.row.name), h('p', '图片ID：' + params.row.id), h('p', '图片编号：' + params.row.identifier)]);
          }
        },
        {
          title: '用户昵称（ID）',
          key: 'nickname',
          sortable: true,
          render: (h, params) => {
            return h('span', params.row.user.nickname + '（ID:' + params.row.user.id + '）');
          }
        },
        {
          title: '售卖状态',
          key: 'status',
          align: 'center',
          render: (h, params) => {
            let status = params.row.sale_info.status;
            let status_str = '';
            let status_color = '';
            switch (status) {
              case 1:
                status_str = '不售卖';
                status_color = 'yellow';
                break;
              case 2:
                status_str = '待审核';
                status_color = 'blue';
                break;
              case 3:
                status_str = '售卖中';
                status_color = 'green';
                break;
              case 4:
                status_str = '不通过';
                status_color = 'red';
                break;
              case 5:
                status_str = '被下架';
                status_color = 'red';
                break;
              case 6:
                status_str = '被买断';
                status_color = 'red';
                break;
            }

            if (status == 4 || status == 5) {
              return h(
                'Poptip',
                {
                  props: {
                    content: '原因：' + params.row.sale_info.pass_str,
                    trigger: 'hover',
                    transfer: true,
                    placement: 'top'
                  }
                },
                [
                  h(
                    'Tag',
                    {
                      props: {
                        color: status_color,
                        size: 'small'
                      }
                    },
                    status_str
                  )
                ]
              );
            } else {
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
          }
        },
        {
          title: '上传时间',
          key: 'create_time',
          width: 160,
          sortable: true
        },
        {
          title: '操作',
          key: 'action',
          width: 100,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            let operate_str = '查看详情';
            if (params.row.sale_info.status == 2) {
              operate_str = '审核';
            }
            if (params.row.sale_info.status == 3) {
              operate_str = '下架';
            }
            if (params.row.sale_info.status == 5) {
              operate_str = '上架';
            }
            return h(
              'Button',
              {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    let row = params.row;
                    let category = row.category;
                    let category_names = [];
                    for (let i = 0, category_len = category.length; i < category_len; i++) {
                      category_names.push(category[i].name);
                    }

                    let color = row.color;
                    let color_ids = [];
                    for (let i = 0, color_len = color.length; i < color_len; i++) {
                      color_ids.push(color[i].id);
                    }

                    let tag = row.tag;
                    let tag_arr = [];
                    for (let i = 0, tag_len = tag.length; i < tag_len; i++) {
                      tag_arr.push(tag[i].name);
                    }
                    let tag_names = tag_arr.toString();

                    let options = params.row;
                    options.category_names = category_names.toString();
                    options.color_ids = color_ids;
                    options.tag_names = tag_names;

                    this.productDetail = options;
                    this.productDetailModalVisible = true;
                  }
                }
              },
              operate_str
            );
          }
        }
      ],
      count: 0,
      isShowPage: false,
      updateStatusFormLoading: false,
      updateStatusModalVisible: false,
      updateStatusForm: {
        id: '',
        status: null, // 售卖状态 3售卖中，4审核不通过，原因在pass_str存储
        pass_str: ''
      },
      // 批处理
      product_ids: [],
      // 图片详情
      productDetail: {
        sale_info: {
          status: 0
        }
      },
      productDetailModalVisible: false
    };
  },
  components: {
    'img-view': imgView
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getSaleProductLists();
      this.getCategoryLists();
      this.getColorLists();
    });
  },
  methods: {
    // 获取所有分类列表用于编辑图片
    getCategoryLists() {
      this.$axios.get('/admin/category').then(res => {
        this.categoryOptions = res.data.list;
      });
    },
    // 获取所有颜色列表用于编辑图片
    getColorLists() {
      this.$axios
        .get('/admin/color')
        .then(res => {
          this.colorOptions = res.data.list;
        })
        .catch(error => {});
    },
    // 获取售卖列表
    getSaleProductLists() {
      this.table_loading = true;
      let params = this.$util.deleteEmptyObj(this.searchForm);
      this.$axios.get('/admin/saleinfo', { params }).then(res => {
        this.table_loading = false;
        this.$Spin.hide();
        this.list = res.data.list;
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.isShowPage = true;
        } else {
          this.isShowPage = false;
        }
      });
    },
    // 翻页
    handlePageChange(cur_page) {
      this.searchForm.page = cur_page;
      this.getSaleProductLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getSaleProductLists();
    },
    // 查看缩略图的放大图
    clickImg(src) {
      this.showImg = true;
      this.imgSrc = src;
    },
    // 设置图片颜色的背景
    setColorStyle(color) {
      return 'background-color:' + color;
    },
    // 批量选择
    onSelectionChange(selection) {
      this.product_ids = [];
      for (let i = 0, len = selection.length; i < len; i++) {
        this.product_ids.push(selection[i].id);
      }
    },
    // 批量推荐
    productRecommends() {
      if (this.product_ids.length == 0) {
        this.$Message.warning('请选择需要推荐的图片');
        return false;
      }
      this.$axios.get('/admin/product/recommends', { params: { ids: this.product_ids } }).then(res => {
        this.getSaleProductLists();
        this.$Message.success('推荐成功');
      });
    },
    // 批量取消推荐
    productCancelRecommends() {
      if (this.product_ids.length == 0) {
        this.$Message.warning('请选择需要取消推荐的图片');
        return false;
      }
      this.$axios
        .get('/admin/product/cancel_recommends', {
          params: { ids: this.product_ids }
        })
        .then(res => {
          this.getSaleProductLists();
          this.$Message.success('取消推荐成功');
        });
    },
    // 点击审核、上架、下架按钮
    updateStatusModal(id) {
      this.updateStatusModalVisible = true;
      this.updateStatusForm.id = id;
      this.updateStatusForm.pass_str = null;
      this.updateStatusForm.status = null;
    },
    // 取消审核、上架、下架
    updateStatusCancel(name) {
      this.updateStatusModalVisible = false;
      this.updateStatusForm.id = null;
      this.updateStatusForm.pass_str = null;
      this.updateStatusForm.status = null;
      this.$refs[name].resetFields();
    },
    // 提交审核、上架、下架结果
    updateStatus(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          if (this.updateStatusForm.status == null) {
            this.$Message.warning('请选择处理结果');
            return false;
          }
          if (this.updateStatusForm.status == 4 && this.updateStatusForm.pass_str == null) {
            this.$Message.warning('审核不通过需要填写原因');
            return false;
          }
          if (this.updateStatusForm.status == 5 && this.updateStatusForm.pass_str == null) {
            this.$Message.warning('下架商品需要填写原因');
            return false;
          }
          this.updateStatusFormLoading = true;
          let params = this.$util.deleteEmptyObj(this.updateStatusForm);
          this.$axios
            .put('/admin/SaleInfo/change_status/' + this.updateStatusForm.id, params)
            .then(res => {
              if (res.code == 0) {
                this.$refs[name].resetFields();
                this.getSaleProductLists();
                this.$Message.success('结果已提交');
                this.updateStatusFormLoading = false;
                this.updateStatusModalVisible = false;
                this.productDetailModalVisible = false;
              }
            })
            .catch(error => {
              this.$refs[name].resetFields();
              this.updateStatusFormLoading = false;
            });
        } else {
          this.updateStatusFormLoading = false;
        }
      });
    }
  }
};
</script>

<style lang="less">
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
.my-table {
  width: 100%;
  border-collapse: collapse;
  td {
    padding: 4px 10px;
    border: 1px solid #e9eaec;
  }
}
</style>
