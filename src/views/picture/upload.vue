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
        <FormItem label="查询用户" prop="a_9_user_id">
          <Select v-model="formValidate.search_type" @on-change="$refs['formValidate'].resetFields();" placeholder="请选择查询条件" style="width: 100px;">
            <Option value="a_9_nickname">用户昵称</Option>
            <Option value="a_9_account">用户名</Option>
            <Option value="mobile_9_num">手机号码</Option>
          </Select>
          <Select v-model="formValidate.a_9_user_id" filterable clearable remote :remote-method="getUserLists" :loading="select_loading" @on-change="getFolderLists" placeholder="输入用户信息" style="width: 180px;">
            <Option v-if="formValidate.search_type=='a_9_nickname'" v-for="item in user_lists" :key="item.id" :value="item.id">{{ item.nickname }}</Option>
            <Option v-if="formValidate.search_type=='a_9_account'" v-for="item in user_lists" :key="item.id" :value="item.id">{{ item.account }}</Option>
            <Option v-if="formValidate.search_type=='mobile_9_num'" v-for="item in user_lists" :key="item.id" :value="item.id">{{ item.mobile.num }}</Option>
          </Select>
        </FormItem>
        <FormItem label="选择专辑" prop="folder_id" v-show="formValidate.a_9_user_id !== ''">
          <RadioGroup v-model="formValidate.folder_id" @on-change="getUploadToken">
            <Radio v-for="item in folder_lists" :key="item.id" :label="item.id">{{ item.name }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="图片类型" prop="type" v-show="formValidate.a_9_user_id !== '' && formValidate.folder_id !== ''">
          <RadioGroup v-model="formValidate.type" @on-change="getUploadToken">
            <Radio :label="3">免费</Radio>
            <Radio :label="1">版权</Radio>
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
        <FormItem label="选择图片" v-show="formValidate.a_9_user_id !== '' && formValidate.folder_id !== ''">
          <Upload ref="upload" multiple type="drag" :data="upload_data" :action="upload_domain" :show-upload-list="true" :default-file-list="defaultList" :on-success="handleSuccess" :on-error="handleError" :format="['jpg','jpeg','png']" :max-size="max_size" :on-format-error="handleFormatError" :on-exceeded-size="handleMaxSize" :before-upload="handleBeforeUpload">
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
      <div class="img-list">
        <template v-if="user_product_list.length == 0">
          <p>该用户暂无图片</p>
        </template>
        <template v-if="user_product_list.length !== 0">
          <span v-for="item in user_product_list" class="img-box" :style="'background: url(' + item.thumbkey + '-min400x300?_=) center no-repeat;background-size: contain;'"></span>
        </template>
      </div>
      </Col>
    </Row>
  </div>
</template>
<script>
import md5 from "md5";
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
        search_type: "a_9_nickname",
        a_9_user_id: "",
        folder_id: "",
        type: 3,
        status: 1
      },
      user_product_list: [],
      upload_data: {}, // 七牛请求数据
      upload_domain: "" // 七牛请求路径
    };
  },
  computed: {
    step_current() {
      if (this.formValidate.a_9_user_id) {
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
        if (search_type == "a_9_nickname") {
          params = {
            a_9_nickname: query
          };
        }
        if (search_type == "a_9_account") {
          params = {
            a_9_account: query
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
      let user_id = this.formValidate.a_9_user_id;
      this.folder_lists = [];
      if (!user_id) return false;
      this.$axios.get("/admin/folder", { params: { user_id } }).then(res => {
        this.folder_lists = res.data.list;
        this.folder_lists.forEach(item => {
          if (item.is_default == 1) {
            this.formValidate.folder_id = item.id;
          }
        });
      });
      this.getProductLists();
    },
    // 根据用户ID获取图片列表
    getProductLists() {
      let user_id = this.formValidate.a_9_user_id;
      this.$axios
        .get("/admin/product", {
          params: {
            a_9_user_id: user_id,
            page: 1,
            page_size: 12
          }
        })
        .then(res => {
          this.user_product_list = res.data.list;
        });
    },
    // 获取七牛token
    getUploadToken(file) {
      return this.$axios
        .get("/admin/upload/token/product", {
          params: {
            user_id: this.formValidate.a_9_user_id,
            folder_id: this.formValidate.folder_id,
            type: this.formValidate.type,
            status: this.formValidate.status
          }
        })
        .then(res => {
          this.upload_domain =
            window.location.protocol + "//" + res.data.upload_domain;
          let key = res.data.keyPrefix;
          if (file != undefined) {
            let ext = this.$util.getFileExtension(file.name);
            key = key + md5(file.name).substring(26, 32) + "." + ext;
          }

          this.upload_data = {
            token: res.data.token,
            key
          };
        });
    },
    // 删除预览图
    handleRemove(file) {
      // 从 upload 实例删除数据
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
    },
    // 上传之前的操作
    handleBeforeUpload(file) {
      return this.getUploadToken(file);
    },
    // 上传成功
    handleSuccess(response, file, fileList) {
      this.$axios
        .post(response.hReturnUrl, { upload_ret: JSON.stringify(response) })
        .then(res => {
          if (res.code == 0) {
            this.getProductLists();
            this.$Notice.success({
              title: "上传成功",
              desc: "文件 " + file.name + " 上传成功",
              duration: 10
            });
          } else {
            this.$Notice.warning({
              title: "上传错误",
              desc: "文件 " + file.name + " 上传失败，原因： " + response.msg,
              duration: 10
            });
          }
          this.$Spin.hide();
          this.$refs["upload"].clearFiles(); // 插入成功后清除input的内容
        })
        .catch(error => {
          this.$Notice.warning({
            title: "上传错误",
            desc: "文件 " + file.name + " 上传失败，原因： " + error.data.msg,
            duration: 10
          });
        });
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
        duration: 10
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
        duration: 10
      });
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
.img-list {
  padding: 10px;
  .img-box {
    margin: 5px;
    display: inline-block;
    border: 1px solid #ddd;
    width: 200px;
    height: 200px;
    background-size: contain;
  }
}
</style>
