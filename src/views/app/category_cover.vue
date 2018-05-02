<template>
  <div>
    <p style="margin: 20px 0;font-size: 20px;">在该页面进行APP端“发现”模块的分类封面设置</p>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="50" inline>
      <Form-item label="名称" prop="name">
        <Input v-model="searchForm.name" placeholder="请输入分类名称" @keyup.enter.native="getCategoryLists"></Input>
      </Form-item>
      <Button type="primary" @click="getCategoryLists">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
      <Button type="info" @click="$refs['searchForm'].resetFields();getCategoryLists()">
        <Icon type="reply" size="14"></Icon>&nbsp;重置
      </Button>
    </Form>

    <Table :columns="list_columns" :data="list"></Table>
    <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

    <!-- 更新封面弹框 -->
    <Modal v-model="updateCoverModalVisible" title="更新封面" width="800">
      <div slot="footer">
        <Button type="text" size="large" @click="updateCoverCancel('updateCoverForm')">取消</Button>
        <Button type="primary" size="large" :loading="updateCoverFormLoading" @click="updateCover('updateCoverForm')">确定</Button>
      </div>
      <Form ref="updateCoverForm" :model="updateCoverForm" :rules="updateCoverFormRules" label-position="right" :label-width="100">
        <Form-item label="封面" prop="banner_url">
          <Input v-model="updateCoverForm.banner_url" disabled placeholder="请输入封面的链接" size="large" @keyup.enter.native="updateCover('updateCoverForm')"></Input>
          <Upload ref="update_cover_upload" :action="upload_domain" :data="upload_data" :show-upload-list="false" :before-upload="handleBeforeUpload" :on-success="addCoverHandleSuccess" :format="['jpg','jpeg','png']">
            <Button type="primary" icon="ios-cloud-upload-outline">上传封面</Button> 建议尺寸：489 * 333
          </Upload>
        </Form-item>
      </Form>
    </Modal>
  </div>
</template>

<script>
import md5 from 'md5';
export default {
  data() {
    return {
      searchForm: {
        page: 1,
        page_size: 10,
        name: null, // 名称
        status: null // 状态：1:正常；2:禁用
      },
      isShowPage: false,
      list: [], // 分类列表
      list_columns: [
        {
          type: 'index',
          width: 50,
          align: 'center'
        },
        {
          title: '分类名称',
          key: 'name'
        },
        {
          title: '封面图',
          key: 'banner_url',
          align: 'center',
          render: (h, params) => {
            let banner = params.row.banner;
            if (!banner) {
              return h('span', '尚未设置封面');
            }
            return h(
              'Poptip',
              {
                props: {
                  content: '封面图',
                  trigger: 'hover',
                  transfer: true,
                  placement: 'left'
                }
              },
              [
                h('img', {
                  domProps: {
                    src: banner.banner_url
                  },
                  style: {
                    marginTop: '5px',
                    height: '100%',
                    maxWidth: '400px',
                    maxHeight: '80px',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      this.clickImg(banner.banner_url);
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
                        src: banner.banner_url
                      },
                      style: {
                        maxWidth: '500px',
                        maxHeight: '400px'
                      }
                    })
                  ]
                )
              ]
            );
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 130,
          align: 'center',
          render: (h, params) => {
            let currentRow = params.row;
            return h('span', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.updateCoverModal(params.row);
                    }
                  }
                },
                '编辑封面'
              )
            ]);
          }
        }
      ],
      count: 0, // 数据总条数
      updateCoverModalVisible: false,
      updateCoverForm: {
        category_id: null, // 分类ID
        banner_url: null, // 封面连接
        type: 1 // 种类，1是app的封面
      },
      updateCoverFormLoading: false,
      updateCoverFormRules: {
        banner_url: [
          {
            type: 'url',
            message: '请输入封面图链接',
            trigger: 'blur'
          }
        ]
      },
      upload_domain: '',
      upload_data: {}
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getCategoryLists();
    });
  },
  methods: {
    // 获取图片分类列表
    getCategoryLists() {
      let name = this.searchForm.name;
      name = name == null ? '' : this.$util.trim(name);
      this.$axios.get('/admin/category', { params: this.searchForm }).then(res => {
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
      this.getCategoryLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getCategoryLists();
    },
    // 点击“编辑”按钮
    updateCoverModal(row) {
      let options = {
        category_id: row.id,
        banner_url: row.banner_url,
        type: 1
      };
      this.updateCoverForm = options;
      this.updateCoverModalVisible = true;
    },
    // 取消编辑
    updateCoverCancel(name) {
      this.updateCoverModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 保存编辑结果
    updateCover(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.updateCoverFormLoading = true;
          this.$axios
            .put('/admin/category/category_banner_update/' + this.updateCoverForm.category_id, this.updateCoverForm)
            .then(res => {
              if (res.code == 0) {
                this.getCategoryLists();
                this.$Message.success('更新成功！');
                this.updateCoverFormLoading = false;
                this.updateCoverModalVisible = false;
              }
            })
            .catch(error => {
              this.updateCoverFormLoading = false;
            });
        }
      });
    },
    // 获取上传七牛token
    getFreeUploadToken(type, file) {
      return this.$axios.post('/admin/upload/token/free', { type }).then(res => {
        this.upload_domain = window.location.protocol + '//' + res.data.upload_domain;
        let key = res.data.keyPrefix;
        if (file != undefined) {
          let ext = this.$util.getFileExtension(file.name);
          key = key + md5(file.name).substring(26, 32) + '.' + ext;
        }
        this.upload_data = {
          token: res.data.token,
          key
        };
      });
    },
    // 上传之前的操作
    handleBeforeUpload(file) {
      return this.getFreeUploadToken('categary_cover', file);
    },
    // 上传成功
    addCoverHandleSuccess(response, file, fileList) {
      this.$axios
        .post(response.hReturnUrl, { upload_ret: JSON.stringify(response) })
        .then(res => {
          let full_url = res.data.full_url;
          this.updateCoverForm.banner_url = full_url;
          this.$Message.success('上传成功');
        })
        .catch(error => {
          this.$Notice.warning({
            title: '上传错误',
            desc: '文件 ' + file.name + ' 上传失败，原因： ' + error,
            duration: 0
          });
        });
    }
  }
};
</script>
