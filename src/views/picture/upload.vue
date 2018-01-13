<template>
    <div class="upload-wrap">
        <Row :gutter="16">
            <Col span="16">
                <Steps class="upload_steps" :current="step_current">
                    <Step title="选择用户" content=""></Step>
                    <Step title="选择专辑" content=""></Step>
                    <Step title="选择图片并上传" content="上传图片期间，请勿关闭窗口！"></Step>
                </Steps>
                <Form class="upload-form" ref="formValidate" :model="formValidate" :label-width="80">
                    <FormItem label="查询用户" prop="user_id">
                        <Select v-model="formValidate.search_type" @on-change="$refs['formValidate'].resetFields();" placeholder="请选择查询条件" style="width: 100px;">
                            <Option value="nickname">用户昵称</Option>
                            <Option value="account">用户名</Option>
                            <Option value="mobile_9_num">手机号码</Option>
                        </Select>
                        <Select v-model="formValidate.user_id" filterable clearable remote :remote-method="getUserLists" :loading="select_loading" @on-change="getFolderLists" placeholder="输入用户信息" style="width: 180px;">
                            <Option v-if="formValidate.search_type=='nickname'" v-for="item in user_lists" :key="item.id" :value="item.id">{{ item.nickname }}</Option>
                            <Option v-if="formValidate.search_type=='account'" v-for="item in user_lists" :key="item.id" :value="item.id">{{ item.account }}</Option>
                            <Option v-if="formValidate.search_type=='mobile_9_num'" v-for="item in user_lists" :key="item.id" :value="item.id">{{ item.mobile.num }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="选择专辑" prop="folder_id" v-show="formValidate.user_id !== ''">
                        <RadioGroup v-model="formValidate.folder_id" @on-change="getUploadToken">
                            <Radio v-for="item in folder_lists" :key="item.id" :label="item.id">{{ item.name }}</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="图片类型" prop="type" v-show="formValidate.user_id !== ''">
                        <RadioGroup v-model="formValidate.type" @on-change="getUploadToken">
                            <Radio :label="3">免费</Radio>
                            <Radio :label="1">版权</Radio>
                            <Radio :label="2">售卖</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="图片状态" prop="status" v-show="false">
                        <RadioGroup v-model="formValidate.status" @on-change="getUploadToken">
                            <Radio :label="1">待处理</Radio>
                            <Radio :label="2">待审核</Radio>
                            <Radio :label="3">不通过</Radio>
                            <Radio :label="4">已上架</Radio>
                            <Radio :label="5">已下架</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="选择图片" v-show="formValidate.user_id !== '' && formValidate.folder_id !== ''">
                        <Upload
                            ref="upload"
                            multiple
                            type="drag"
                            :data="{token: upload_token}"
                            :show-upload-list="true"
                            :default-file-list="defaultList"
                            :on-success="handleSuccess"
                            :on-error="handleError"
                            :format="['jpg','jpeg','png']"
                            :max-size="max_size"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :before-upload="handleBeforeUpload"
                            action="http://upload.qiniu.com/">
                            <div style="padding: 20px 0">
                                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                                <p>点击或将图片拖拽到这里上传</p>
                            </div>
                        </Upload>
                    </FormItem>
                </Form>
            </Col>
            <Col span="8">
                <h3>用户近期上传的图片</h3>
            </Col>
        </Row>
    </div>
</template>
<script>
export default {
  data() {
    return {
      upload_token: "",
      upload_keyPrefix: "",
      max_size: 1024 * 50,
      defaultList: [],
      uploadList: [],
      select_loading: false,
      user_lists: [],
      folder_lists: [],
      formValidate: {
        search_type: "nickname",
        user_id: "",
        folder_id: "",
        type: 3,
        status: 1
      }
    };
  },
  computed: {
    step_current() {
      if (this.formValidate.user_id) {
        return 2;
      }
      if (this.formValidate.folder_id) {
        return 3;
      }
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      this.uploadList = this.$refs.upload.fileList;
    });
  },
  methods: {
    // 获取用户列表
    getUserLists(query) {
      if (query !== "") {
        this.select_loading = true;
        let search_type = this.formValidate.search_type;
        let params = {};
        if (search_type == "nickname") {
          params = {
            nickname: query
          };
        }
        if (search_type == "account") {
          params = {
            account: query
          };
        }
        if (search_type == "mobile_9_num") {
          params = {
            mobile_9_num: query
          };
        }
        this.$axios.get("/admin/user", { params }).then(res => {
          this.user_lists = res.data.list;
          this.select_loading = false;
        });
      } else {
        this.user_lists = [];
      }
    },
    // 根据用户ID获取用户专辑列表
    getFolderLists() {
      let user_id = this.formValidate.user_id;
      this.folder_lists = [];
      if (!user_id) return false;
      this.$axios.get("/admin/folder", { params: { user_id } }).then(res => {
        this.folder_lists = res.data.list;
        this.folder_lists.splice(0, 0, { id: 0, name: "默认专辑" });
        this.formValidate.folder_id = 0;
        this.getUploadToken();
      });
    },
    // 获取七牛token
    getUploadToken() {
      let params = {
        user_id: this.formValidate.user_id,
        folder_id: this.formValidate.folder_id,
        type: this.formValidate.type,
        status: this.formValidate.status
      };
      this.$axios.get("/admin/upload/token/product", { params }).then(res => {
        this.upload_token = res.data.token;
        this.upload_keyPrefix = res.data.keyPrefix;
        this.$refs.upload.data.token = this.upload_token;
      });
    },
    // 删除预览图
    handleRemove(file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
    },
    // 上传成功
    handleSuccess(res, file, fileList) {
      if (res.code !== 0) {
        this.$Notice.warning({
          title: "上传错误",
          desc: "文件 " + file.name + " 上传失败，原因： " + res.msg,
          duration: 0
        });
      } else {
        this.$Notice.success({
          title: "上传成功",
          desc: "文件 " + file.name + " 上传成功。",
          duration: 15
        });
      }
    },
    // 上传失败
    handleError(error, file) {
      this.$Message.error(error + file.name + " 图片上传失败。");
    },
    // 文件格式不正确
    handleFormatError(file) {
      this.$Notice.warning({
        title: "文件格式不正确",
        desc: "文件 " + file.name + " 格式不正确，请上传 jpg 或 png 格式的图片。",
        duration: 0
      });
    },
    // 超出文件大小限制
    handleMaxSize(file) {
      this.$Notice.warning({
        title: "超出文件大小限制",
        desc:
          "文件 " +
          file.name +
          " 太大，不能超过 " +
          (this.max_size / 1024).toFixed(2) +
          " M。",
        duration: 0
      });
    },
    // 上传之前的操作
    handleBeforeUpload(file) {
      let file_name = file.name;
      let date = new Date();
      let s = date.getSeconds();
      let m = date.getMilliseconds();
      let key =
        this.upload_keyPrefix +
        s +
        m +
        file_name.substring(file_name.lastIndexOf("."), file_name.length);
      this.$refs.upload.data.key = key;
    }
  }
};
</script>
<style lang="less" scoped>
.upload_steps {
  margin-bottom: 15px;
  padding: 20px;
  background-color: #fff;
}
.ivu-upload-list {
  max-height: 400px !important;
  overflow: auto;
}
.ivu-form-item {
  margin-bottom: 24px !important;
}
</style>
