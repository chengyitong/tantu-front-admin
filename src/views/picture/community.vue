<template>
  <div>
    <img-view v-if="showImg" @click="showImg = false;" :imgSrc="imgSrc"></img-view>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
      <Form-item label="图片ID" prop="id">
        <Input v-model="searchForm.id" placeholder="图片ID" @keyup.enter.native="getProductLists"></Input>
      </Form-item>
      <Form-item label="图片名称" prop="name">
        <Input v-model="searchForm.name" placeholder="图片名称" @keyup.enter.native="getProductLists"></Input>
      </Form-item>
      <!-- 用户上传图片后：未填写分类、颜色、标签等基本信息时处于待处理状态；填写之后则进入待审核状态；免费图片和版权保护图片不需要审核，直接进入已上架状态;上架之后对用户可见，否则不可见 -->
      <Form-item label="状态" prop="status">
        <Select v-model="searchForm.status" clearable @on-change="getProductLists" style="width: 141px;">
          <Option :value="1" :key="1">待处理</Option>
          <Option :value="2" :key="2">待审核</Option>
          <Option :value="3" :key="3">不通过</Option>
          <Option :value="4" :key="4">已上架</Option>
          <Option :value="5" :key="5">已下架</Option>
        </Select>
      </Form-item>
      <Form-item label="是否推荐" prop="a_9_is_recommend">
        <Select v-model="searchForm.a_9_is_recommend" clearable @on-change="getProductLists" style="width: 141px;">
          <Option :value="0" :key="0">不推荐</Option>
          <Option :value="1" :key="1">推荐</Option>
        </Select>
      </Form-item>
      <Form-item label="分类" prop="category_product_9_category_id">
        <Select v-model="searchForm.category_product_9_category_id" filterable clearable @on-change="getProductLists" style="width: 141px;">
          <Option v-for="item in categoryOptions" :key="item.id" :value="item.id">{{ item.name }}</Option>
        </Select>
      </Form-item>
      <!-- <Form-item label="简介" prop="desc">
        <Input v-model="searchForm.desc" placeholder="简介" @keyup.enter.native="getProductLists"></Input>
      </Form-item> -->
      <Form-item label="类型" prop="type">
        <Select v-model="searchForm.type" clearable @on-change="getProductLists" style="width: 141px;">
          <Option :value="1" :key="1">版权</Option>
          <Option :value="2" :key="2">售卖</Option>
          <Option :value="3" :key="3">免费</Option>
        </Select>
      </Form-item>
      <Form-item label="用户ID" prop="a_9_user_id">
        <Input v-model="searchForm.a_9_user_id" placeholder="用户ID" @keyup.enter.native="getProductLists"></Input>
      </Form-item>
      <Form-item label="活动ID" prop="event_product_9_event_id">
        <Input v-model="searchForm.event_product_9_event_id" placeholder="活动ID" @keyup.enter.native="getProductLists"></Input>
      </Form-item>
      <Form-item label="上传时间" prop="a_9_create_time">
        <DatePicker type="daterange" v-model="searchForm.a_9_create_time" :options="datePickerOptions" placeholder="请选择上传时间周期" style="width: 180px" @on-change="searchForm.a_9_create_time=$event;getProductLists()"></DatePicker>
      </Form-item>
      <Button type="primary" @click="getProductLists">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
      <Button type="info" @click="$refs['searchForm'].resetFields()">
        <Icon type="reply" size="14"></Icon>&nbsp;重置
      </Button>
    </Form>

    <div style="margin-bottom: 10px;">
      <Button v-show="searchForm.status == 4" @click="productRecommends">批量推荐</Button>
      <Button v-show="searchForm.status == 4" @click="productCancelRecommends">取消推荐</Button>
      <Button v-if="searchForm.status == 5" @click="changeStatus(4)">
        <Icon type="android-upload" size="14"></Icon>&nbsp;批量上架
      </Button>
      <Button v-if="searchForm.status == 4" @click="changeStatus(5)" class="fn-right">
        <Icon type="android-download" size="14"></Icon>&nbsp;批量下架
      </Button>
    </div>

    <Table :loading="table_loading" :columns="list_columns" :data="list" @on-selection-change="onSelectionChange"></Table>

    <div style="margin-top: 10px;">
      <Button v-show="searchForm.status == 4" @click="productRecommends">批量推荐</Button>
      <Button v-show="searchForm.status == 4" @click="productCancelRecommends">取消推荐</Button>
      <Button v-if="searchForm.status == 5" @click="changeStatus(4)">
        <Icon type="android-upload" size="14"></Icon>&nbsp;批量上架
      </Button>
      <Button v-if="searchForm.status == 4" @click="changeStatus(5)" class="fn-right">
        <Icon type="android-download" size="14"></Icon>&nbsp;批量下架
      </Button>
    </div>

    <Page v-if="isShowPage" :total="count" show-total show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

    <!-- S 编辑 -->
    <Modal v-model="updateProductModalVisible" title="编辑图片信息" width="920">
      <div slot="footer">
        <Button size="large" @click="updateProductModalVisible = false">关闭</Button>
        <Button type="primary" size="large" @click="updateProduct">保存</Button>
      </div>
      <Form :model="updateProductForm" :label-width="80">
        <Form-item label="图片名称" prop="name">
          <Input v-model="updateProductForm.name" placeholder="请输入图片名称" @keyup.enter.native="updateProduct"></Input>
        </Form-item>
        <Form-item label="图片简介" prop="desc">
          <Input v-model="updateProductForm.desc" placeholder="请输入图片简介" @keyup.enter.native="updateProduct"></Input>
        </Form-item>
        <Form-item label="图片分类" prop="category_ids">
          <CheckboxGroup v-model="updateProductForm.category_ids">
            <Checkbox v-for="item in categoryOptions" :key="item.id" :label="item.id">{{ item.name }}</Checkbox>
          </CheckboxGroup>
        </Form-item>
        <Form-item label="图片标签" prop="tag_names">
          <Input v-model="updateProductForm.tag_names" @keyup.enter.native="updateProduct"></Input>
          <small>多个标签之间用英文逗号分隔</small>
        </Form-item>
        <Form-item label="图片颜色" prop="color_ids">
          <CheckboxGroup v-model="updateProductForm.color_ids">
            <Checkbox v-for="item in colorOptions" :key="item.id" :label="item.id">
              <span class="color-box" :style="setColorStyle(item.color_value)"></span>
            </Checkbox>
          </CheckboxGroup>
        </Form-item>
        <Form-item label="图片状态" prop="status">
          <RadioGroup v-model="updateProductForm.status">
            <Radio :label="1" disabled>待处理</Radio>
            <!-- <Radio :label="2" disabled>待审核</Radio>
            <Radio :label="3" disabled>不通过</Radio> -->
            <Radio :label="4">已上架</Radio>
            <Radio :label="5">已下架</Radio>
          </RadioGroup>
        </Form-item>
        <Form-item label="不通过原因" prop="desc" v-if="updateProductForm.status == 3">
          <Input v-model="updateProductForm.desc" placeholder="请输入不通过的原因" @keyup.enter.native="getProductLists"></Input>
        </Form-item>
        <Form-item label="图片方向" prop="rotate">
          <RadioGroup v-model="updateProductForm.rotate">
            <Radio :label="1">横向</Radio>
            <Radio :label="2">竖向</Radio>
            <Radio :label="3">正方</Radio>
          </RadioGroup>
        </Form-item>
        <Form-item label="图片分辨率">
          <Input v-model="updateProductForm.width" placeholder="宽度" style="width: 60px;"></Input>
          &nbsp;X&nbsp;
          <Input v-model="updateProductForm.height" placeholder="高度" style="width: 60px;"></Input>
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
      searchForm: {
        page: 1,
        page_size: 10,
        id: null,
        name: null,
        category_product_9_category_id: null,
        desc: null,
        status: 4,
        a_9_user_id: null,
        event_product_9_event_id: null,
        type: null,
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
      // 图片列表
      imgSrc: '', // 当前点击的图片链接
      showImg: false, // 显示放大的图片
      table_loading: false,
      list: [],
      list_columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        },
        {
          title: '缩略图',
          key: 'imgkey',
          width: 150,
          align: 'center',
          fixed: 'left',
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
          width: 200,
          sortable: true,
          render: (h, params) => {
            return h('span', [h('p', params.row.name == null ? '' : params.row.name), h('p', '图片ID：' + params.row.id), h('p', '图片编号：' + params.row.identifier)]);
          }
        },
        {
          title: '图片简介',
          key: 'desc',
          width: 200,
          sortable: true,
          render: (h, params) => {
            return h('span', params.row.desc == null ? '' : params.row.desc);
          }
        },
        {
          title: '图片分类',
          key: 'category',
          width: 180,
          sortable: true,
          render: (h, params) => {
            let category = params.row.category;
            let category_arr = [];
            for (let i = 0, category_len = category.length; i < category_len; i++) {
              category_arr.push(category[i].name);
            }
            return h('span', category_arr.toString());
          }
        },
        {
          title: '图片标签',
          key: 'tag',
          width: 180,
          sortable: true,
          render: (h, params) => {
            let tag = params.row.tag;
            let tag_arr = [];
            for (let i = 0, tag_len = tag.length; i < tag_len; i++) {
              tag_arr.push(tag[i].name);
            }
            return h('span', tag_arr.toString());
          }
        },
        {
          title: '图片颜色',
          key: 'color',
          width: 180,
          sortable: true,
          render: (h, params) => {
            let color = params.row.color;
            let color_arr = [];
            for (let i = 0, color_len = color.length; i < color_len; i++) {
              color_arr.push(color[i].name);
            }
            return h('span', color_arr.toString());
          }
        },
        {
          title: '图片状态',
          key: 'status',
          width: 130,
          align: 'center',
          sortable: true,
          render: (h, params) => {
            let status = params.row.status;
            let status_str = '';
            let status_color = '';
            switch (status) {
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
            return h(
              'Tag',
              {
                props: {
                  color: status_color,
                  type: 'dot',
                  size: 'small'
                }
              },
              status_str
            );
          }
        },
        {
          title: '图片类型',
          key: 'type',
          width: 120,
          align: 'center',
          sortable: true,
          render: (h, params) => {
            let type = params.row.type;
            let type_str = '';
            let type_color = '';
            switch (type) {
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
            return h(
              'Tag',
              {
                props: {
                  color: type_color,
                  type: 'dot',
                  size: 'small'
                }
              },
              type_str
            );
          }
        },
        {
          title: '图片方向',
          key: 'rotate',
          width: 120,
          align: 'center',
          sortable: true,
          render: (h, params) => {
            let rotate = params.row.rotate;
            let _str = '';
            let _color = '';
            switch (rotate) {
              case 0:
                _str = '横向';
                _color = 'yellow';
                break;
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
            return h(
              'Tag',
              {
                props: {
                  color: _color,
                  type: 'dot',
                  size: 'small'
                }
              },
              _str
            );
          }
        },
        {
          title: '图片分辨率',
          key: 'width',
          width: 150,
          align: 'center',
          sortable: true,
          render: (h, params) => {
            return h('span', params.row.width + ' * ' + params.row.height);
          }
        },
        {
          title: '用户昵称（ID）',
          key: 'nickname',
          width: 200,
          sortable: true,
          render: (h, params) => {
            return h('span', params.row.user.nickname + '（ID:' + params.row.user.id + '）');
          }
        },
        {
          title: '上传时间',
          key: 'create_time',
          width: 160,
          sortable: true
        },
        {
          title: 'EXIF信息',
          key: 'EXIF',
          width: 110,
          render: (h, params) => {
            return h(
              'Poptip',
              {
                props: {
                  content: 'EXIF信息',
                  trigger: 'hover',
                  transfer: true,
                  placement: 'left'
                }
              },
              [
                h(
                  'Tag',
                  {
                    props: {
                      color: 'green',
                      size: 'small'
                    }
                  },
                  'EXIF信息'
                ),
                h(
                  'div',
                  {
                    slot: 'content'
                  },
                  [
                    h('p', '品牌：' + params.row.exif_brand),
                    h('p', '型号：' + params.row.exif_model),
                    h('p', '焦距：' + params.row.exif_focal_length),
                    h('p', '光圈：' + params.row.exif_f_number),
                    h('p', '快门：' + params.row.exif_shutter),
                    h('p', 'ISO：' + params.row.exif_iso),
                    h('p', '曝光：' + params.row.exif_exposure),
                    h('p', '镜头：' + params.row.exif_camera_lens),
                    h('p', '拍摄时间：' + params.row.exif_taketime)
                  ]
                )
              ]
            );
          }
        },
        {
          title: '活动信息',
          key: 'events',
          width: 110,
          render: (h, params) => {
            if (params.row.events.length == 0) {
              return h('span', '未参加活动');
            }
            return h(
              'Poptip',
              {
                props: {
                  content: '活动信息',
                  trigger: 'hover',
                  transfer: true,
                  placement: 'left'
                }
              },
              [
                h(
                  'Tag',
                  {
                    props: {
                      color: 'yellow',
                      size: 'small'
                    }
                  },
                  '活动信息'
                ),
                h(
                  'div',
                  {
                    slot: 'content'
                  },
                  [h('p', '活动ID：' + params.row.events[0].id), h('p', '活动名称：' + params.row.events[0].subject)]
                )
              ]
            );
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 60,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            let currentRow = params.row;
            return h(
              'Button',
              {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.updateProductModal(params.row);
                  }
                }
              },
              '编辑'
            );
          }
        }
      ],
      count: 0,
      isShowPage: false,
      // 编辑图片信息
      updateProductModalVisible: false,
      colorOptions: [], // 所有的颜色
      categoryOptions: [], // 所有的分类
      updateProductForm: {},
      // 批处理
      product_ids: []
    };
  },
  components: {
    'img-view': imgView
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getProductLists();
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
    // 获取图片列表
    getProductLists() {
      this.table_loading = true;
      let params = this.$util.deleteEmptyObj(this.searchForm);
      this.$axios.get('/admin/product', { params }).then(res => {
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
      this.getProductLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getProductLists();
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
    // 点击编辑按钮
    updateProductModal(row) {
      let category = row.category;
      let category_ids = [];
      for (let i = 0, category_len = category.length; i < category_len; i++) {
        category_ids.push(category[i].id);
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

      let options = {
        id: row.id,
        name: row.name,
        desc: row.desc,
        category_ids,
        tag_names,
        color_ids,
        status: row.status,
        type: row.type,
        rotate: row.rotate,
        width: row.width,
        height: row.height
      };
      this.updateProductForm = options;
      this.updateProductModalVisible = true;
    },
    // 保存编辑结果
    updateProduct() {
      this.updateProductFormLoading = true;
      this.$axios
        .put('/admin/product/' + this.updateProductForm.id, this.updateProductForm)
        .then(res => {
          if (res.code == 0) {
            this.getProductLists();
            this.$Message.success('更新成功！');
            this.updateProductFormLoading = false;
            this.updateProductModalVisible = false;
          }
        })
        .catch(error => {
          this.updateProductFormLoading = false;
        });
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
        this.getProductLists();
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
          this.getProductLists();
          this.$Message.success('取消推荐成功');
        });
    },
    // 批量上下架
    changeStatus(status) {
      let status_str = '';
      if (status === 4) status_str = '上架';
      if (status === 5) status_str = '下架';

      if (this.product_ids.length == 0) {
        this.$Message.warning('请选择需要' + status_str + '的图片');
        return false;
      }
      let params = {
        ids: this.product_ids,
        status,
        pass_str: null // 审核不通过的时候填写不通过的原因
      };
      this.$axios.get('/admin/product/change_status', { params }).then(res => {
        this.getProductLists();
        this.$Message.success(status_str + '成功');
      });
    }
  }
};
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
