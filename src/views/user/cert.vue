<template>
  <div>
    <img-view v-if="showImg" @click="showImg = false;" :imgSrc="imgSrc"></img-view>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
      <Form-item label="用户ID" prop="user_id">
        <Input v-model="searchForm.user_id" placeholder="用户ID" @keyup.enter.native="getUserCertLists"></Input>
      </Form-item>
      <Form-item label="认证类型" prop="type">
        <Select v-model="searchForm.type" filterable clearable placeholder="默认全部" @on-change="getUserCertLists" style="width: 141px;">
          <Option :value="1" :key="1">个人</Option>
          <Option :value="2" :key="2">企业/机构</Option>
        </Select>
      </Form-item>
      <Form-item label="认证状态" prop="status">
        <Select v-model="searchForm.status" filterable clearable placeholder="默认全部" @on-change="getUserCertLists" style="width: 141px;">
          <Option :value="1" :key="1">未认证</Option>
          <Option :value="2" :key="2">认证中</Option>
          <Option :value="3" :key="3">已认证</Option>
          <Option :value="4" :key="4">已驳回</Option>
        </Select>
      </Form-item>
      <Button type="primary" @click="getUserCertLists">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
      <Button type="info" @click="$refs['searchForm'].resetFields()">
        <Icon type="reply" size="14"></Icon>&nbsp;重置
      </Button>
    </Form>

    <Table :loading="table_loading" :columns="list_columns" :data="list"></Table>
    <Page v-if="count > 0" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

    <!-- 查看认证资料弹框 -->
    <Modal v-model="certInfoModalVisible" title="认证资料" width="920">
      <div slot="footer">
        <Button type="text" size="large" @click="certInfoModalVisible=false">关闭</Button>
        <Button v-if="certInfoDetail.status==2" type="primary" size="large" @click="updateStatusModal(certInfoDetail.id)">审核</Button>
      </div>
      <Form label-position="right" :label-width="160">
        <Form-item label="当前认证状态">
          <template v-if="certInfoDetail.status == 2">认证中，等待审核&nbsp;&nbsp;<Button type="primary" size="small" @click="updateStatusModal(certInfoDetail.id)">审核</Button></template>
          <template v-if="certInfoDetail.status == 3">认证通过&nbsp;&nbsp;{{certInfoDetail.result}}</template>
          <template v-if="certInfoDetail.status == 4">认证不通过，原因：{{certInfoDetail.result}}</template>
        </Form-item>
        <Form-item label="认证类型">
          <template v-if="certInfoDetail.type == 1">个人</template>
          <template v-if="certInfoDetail.type == 2">企业/机构</template>
        </Form-item>
        <template v-if="certInfoDetail.type == 1">
          <Form-item label="真实姓名">
            {{certInfoDetail.realname}}
          </Form-item>
          <Form-item label="身份证号码">
            {{certInfoDetail.card_num}}
          </Form-item>
          <Form-item label="身份证到期日期">
            <template v-if="certInfoDetail.is_long == 1">长期</template>
            <template v-else>{{certInfoDetail.card_date}}</template>
          </Form-item>
          <Form-item label="手持身份证信息面照片">
            <img :src="certInfoDetail.card_img_a" @click="clickImg(certInfoDetail.card_img_a)" alt="" width="300">
          </Form-item>
          <Form-item label="手持身份证国徽面照片">
            <img :src="certInfoDetail.card_img_b" @click="clickImg(certInfoDetail.card_img_b)" alt="" width="300">
          </Form-item>
        </template>

        <template v-if="certInfoDetail.type == 2">
          <Form-item label="公司全称">
            {{certInfoDetail.company_name}}
          </Form-item>
          <Form-item label="统一社会信用代码">
            {{certInfoDetail.social_code}}
          </Form-item>
          <Form-item label="联系人姓名">
            {{certInfoDetail.contact_name}}
          </Form-item>
          <Form-item label="联系人手机">
            {{certInfoDetail.contact_phone}}
          </Form-item>
          <Form-item label="营业执照副本">
            <img :src="certInfoDetail.business_license_img" @click="clickImg(certInfoDetail.business_license_img)" alt="" width="300">
          </Form-item>
          <Form-item label="法人手持身份证信息面照片">
            <img :src="certInfoDetail.card_img_a" @click="clickImg(certInfoDetail.card_img_a)" alt="" width="300">
          </Form-item>
          <Form-item label="法人手持身份证国徽面照片">
            <img :src="certInfoDetail.card_img_b" @click="clickImg(certInfoDetail.card_img_b)" alt="" width="300">
          </Form-item>
          <Form-item label="法人身份证到期日期">
            <template v-if="certInfoDetail.is_long == 1">长期</template>
            <template v-else>{{certInfoDetail.card_date}}</template>
          </Form-item>
        </template>
      </Form>
    </Modal>

    <!-- 审核弹框 -->
    <Modal v-model="updateStatusModalVisible" title="审核用户认证申请">
      <div slot="footer">
        <Button type="text" size="large" @click="updateStatusCancel('updateStatusForm')">取消</Button>
        <Button type="primary" size="large" :loading="updateStatusFormLoading" @click="updateStatus('updateStatusForm')">确定</Button>
      </div>
      <Form ref="updateStatusForm" :model="updateStatusForm" label-position="right" :label-width="100">
        <Form-item label="审核结果" prop="status">
          <RadioGroup v-model="updateStatusForm.status">
            <Radio :label="3">通过</Radio>
            <Radio :label="4">驳回</Radio>
          </RadioGroup>
        </Form-item>
        <Form-item v-if="updateStatusForm.status == 4" label="驳回的原因" prop="result">
          <Input v-model="updateStatusForm.result" placeholder="驳回的原因"></Input>
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
      searchForm: {
        page: 1,
        page_size: 10,
        user_id: '', // 用户ID
        type: '', // 认证类型：1-个人；2-企业/机构
        status: '' // 认证状态: 1:未认证；2:认证中；3:已认证；4:认证审核不通过
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
          title: '用户昵称',
          key: 'nickname',
          render: (h, params) => {
            return h('span', params.row.user.nickname + '（ID：' + params.row.user.id + '）');
          }
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
                  click: () => {
                    this.certInfoDetail = params.row;
                    this.certInfoModalVisible = true;
                  }
                }
              },
              operate_str
            );
          }
        }
      ],
      count: 0, // 总数据条数
      isShowPage: false,
      certInfoModalVisible: false,
      certInfoDetail: {}, // 认证资料
      // 审核用户认证资料
      updateStatusForm: {
        id: '', // 认证申请id
        status: 3, // 认证状态：3-通过；4-驳回
        result: '' // 驳回原因
      },
      updateStatusModalVisible: false,
      updateStatusFormLoading: false,
      imgSrc: '', // 当前点击的图片链接
      showImg: false // 显示放大的图片
    };
  },
  components: {
    'img-view': imgView
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getUserCertLists();
    });
  },
  methods: {
    // 获取用户认证列表
    getUserCertLists() {
      this.table_loading = true;
      let params = this.$util.deleteEmptyObj(this.searchForm);
      this.$axios.get('/admin/user_cert', { params }).then(res => {
        this.list = res.data.list;
        this.count = res.data.count;
        this.table_loading = false;
      });
    },
    // 翻页
    handlePageChange(cur_page) {
      this.searchForm.page = cur_page;
      this.getUserCertLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getUserCertLists();
    },
    // 查看缩略图的放大图
    clickImg(src) {
      this.showImg = true;
      this.imgSrc = src;
    },
    // 点击审核按钮
    updateStatusModal(id) {
      this.updateStatusModalVisible = true;
      this.updateStatusForm.id = id;
    },
    // 取消审核
    updateStatusCancel(name) {
      this.updateStatusModalVisible = false;
      this.updateStatusForm.id = null;
      this.$refs[name].resetFields();
    },
    // 提交审核结果
    updateStatus(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          if (this.updateStatusForm.status == 4 && this.updateStatusForm.result.length == 0) {
            this.$Message.warning('驳回需要填写原因');
            return false;
          }
          this.updateStatusFormLoading = true;
          this.$axios
            .put('/admin/user_cert/check', this.updateStatusForm)
            .then(res => {
              if (res.code == 0) {
                this.$refs[name].resetFields();
                this.getUserCertLists();
                this.$Message.success('审核结果已提交');
                this.certInfoModalVisible = false;
                this.updateStatusFormLoading = false;
                this.updateStatusModalVisible = false;
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
