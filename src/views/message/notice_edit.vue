<template>
  <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
    <FormItem label="公告标题" prop="title">
      <Input v-model="formValidate.title" placeholder="请填写公告标题，建议不超过18个字符"></Input>
    </FormItem>
    <FormItem label="公告正文" prop="content">
      <quill-editor v-model="formValidate.content" @onEditorBlur="getQuillContent" :content="formValidate.content"></quill-editor>
    </FormItem>
    <FormItem>
      <Button type="primary" :loading="submit_loading" @click="handleSubmit('formValidate',2)">正式发布</Button>
      <Button type="ghost" :loading="submit_loading" @click="handleSubmit('formValidate',1)">保存为草稿</Button>
    </FormItem>
  </Form>
</template>
<script>
import quillEditor from "../my_components/quill-editor/quillEditor";
export default {
  data() {
    return {
      formValidate: {
        type: 2, // 1-站内信；2-系统通知
        title: "", // 公告标题
        content: "" // 公告正文
      },
      submit_loading: false,
      ruleValidate: {
        title: [
          {
            required: true,
            message: "请填写公告标题",
            trigger: "blur"
          }
        ],
        content: [
          {
            required: true,
            message: "请填写公告正文内容",
            trigger: "blur"
          }
        ]
      }
    };
  },
  components: {
    "quill-editor": quillEditor
  },
  computed: {
    notice_id() {
      return this.$route.params.notice_id;
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getMsgDetail();
    });
  },
  methods: {
    // 获取公告详情
    getMsgDetail() {
      this.$axios.get("/admin/msg/" + this.notice_id).then(res => {
        this.formValidate.title = res.data.title;
        this.formValidate.content = res.data.content;
      });
    },
    // 获取 quill-editor 子组件的输入内容
    getQuillContent(data) {
      this.formValidate.content = data;
    },
    handleSubmit(name, status) {
      this.formValidate.status = status;
      this.$refs[name].validate(valid => {
        if (valid) {
          this.submit_loading = true;
          this.$axios
            .put("/admin/msg/" + this.notice_id, this.formValidate)
            .then(res => {
              this.submit_loading = false;
              this.$Message.success("更新成功");
              setTimeout(() => {
                this.$router.push({ path: "/message/notice/list" });
              }, 200);
              this.$refs[name].resetFields();
            })
            .catch(error => {
              this.submit_loading = false;
            });
        } else {
          this.$Message.error("还有必填项未填写");
        }
      });
    },
    handleReset(name) {
      this.$refs[name].resetFields();
    }
  }
};
</script>
