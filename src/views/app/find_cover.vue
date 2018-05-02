<template>
  <div>
    <p style="margin: 20px 0;font-size: 20px;">在该页面进行APP端“发现”模块的作品封面设置</p>
    <Table :columns="list_columns" :data="list"></Table>

    <!-- 更新封面弹框 -->
    <Modal v-model="updateCoverModalVisible" title="更新封面" width="800">
      <div slot="footer">
        <Button type="text" size="large" @click="updateCoverCancel('updateCoverForm')">取消</Button>
        <Button type="primary" size="large" :loading="updateCoverFormLoading" @click="updateCover('updateCoverForm')">确定</Button>
      </div>
      <Form ref="updateCoverForm" :model="updateCoverForm" :rules="updateCoverFormRules" label-position="right" :label-width="100">
        <Form-item label="封面" prop="value">
          <Input v-model="updateCoverForm.value" disabled placeholder="请输入封面的链接" size="large" @keyup.enter.native="updateCover('updateCoverForm')"></Input>
          <Upload ref="update_cover_upload" :action="upload_domain" :data="upload_data" :show-upload-list="false" :before-upload="handleBeforeUpload" :on-success="addCoverHandleSuccess" :format="['jpg','jpeg','png']">
            <Button type="primary" icon="ios-cloud-upload-outline">上传封面</Button> 建议尺寸：750 * 236、建议添加遮罩效果：黑色45%透明度
          </Upload>
        </Form-item>
        <!-- <Form-item label="备注" prop="description">
          <Input v-model="updateCoverForm.description" placeholder="请输入备注" size="large" @keyup.enter.native="updateCover('updateCoverForm')"></Input>
        </Form-item> -->
      </Form>
    </Modal>
  </div>
</template>

<script>
import md5 from 'md5';
export default {
  data() {
    return {
      list: [],
      list_columns: [
        {
          type: 'index',
          width: 50,
          align: 'center'
        },
        {
          title: 'NAME',
          key: 'name',
          width: 180
        },
        {
          title: '描述',
          key: 'description'
        },
        {
          title: '封面图',
          key: 'value',
          align: 'center',
          render: (h, params) => {
            let value = params.row.value;
            if (!value) {
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
                    src: value
                  },
                  style: {
                    marginTop: '5px',
                    width: '100%',
                    height: '100%',
                    maxWidth: '400px',
                    maxHeight: '160px',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      this.clickImg(value);
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
                        src: value
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
      updateCoverModalVisible: false,
      updateCoverForm: {
        id: null, // 封面ID
        value: null, // 封面连接
        description: null // 备注
      },
      updateCoverFormLoading: false,
      updateCoverFormRules: {
        value: [
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
      this.getFindCover();
    });
  },
  methods: {
    // 获取发现页头部配置
    getFindCover() {
      this.$axios.get('/admin/config/find_top').then(res => {
        this.list = res.data;
      });
    },
    // 点击“编辑”按钮
    updateCoverModal(row) {
      let options = {
        id: row.id,
        value: row.value,
        description: row.description
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
            .put('/admin/config/update/' + this.updateCoverForm.id, this.updateCoverForm)
            .then(res => {
              if (res.code == 0) {
                this.getFindCover();
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
      return this.getFreeUploadToken('find_cover', file);
    },
    // 上传成功
    addCoverHandleSuccess(response, file, fileList) {
      this.$axios
        .post(response.hReturnUrl, { upload_ret: JSON.stringify(response) })
        .then(res => {
          let full_url = res.data.full_url;
          this.updateCoverForm.value = full_url;
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
