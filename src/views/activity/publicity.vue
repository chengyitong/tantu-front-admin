<template>
  <div style="background-color: #fff;padding: 20px;">
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
      <FormItem label="公示截止日期" prop="publicity_end_date">
        <FormItem prop="publicity_end_date">
          <DatePicker type="date" placeholder="选择公示截止日期" v-model="formValidate.publicity_end_date" format="yyyy-MM-dd"></DatePicker>
        </FormItem>
      </FormItem>
      <FormItem label="活动公示详情" prop="award_result">
        <quill-editor v-model="formValidate.award_result" @onEditorBlur="getQuillContent" :content="formValidate.award_result"></quill-editor>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleSubmit('formValidate')">发布</Button>
        <Button type="ghost" @click="handleReset('formValidate')" style="margin-left: 8px">重置</Button>
      </FormItem>
    </Form>
  </div>
</template>
<script>
import quillEditor from "../my_components/quill-editor/quillEditor";
export default {
  data() {
    return {
      formValidate: {
        award_result: "", // 获奖公示详情
        publicity_end_date: "" // 公示截止日期
      },
      ruleValidate: {
        publicity_end_date: [
          {
            required: true,
            type: "date",
            message: "请选择活动公示截止日期",
            trigger: "change"
          }
        ],
        award_result: [
          {
            required: true,
            message: "请填写活动公示详情",
            trigger: "blur"
          }
        ]
      }
    };
  },
  components: {
    "quill-editor": quillEditor
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getPublicityDetail();
    });
  },
  methods: {
    // 获取 quill-editor 子组件的输入内容
    getQuillContent(data) {
      console.log(data);
      this.formValidate.award_result = data;
    },
    // 获取活动公告详情
    getPublicityDetail() {
      this.$axios
        .get("/admin/event/details/" + this.$route.params.event_id)
        .then(res => {
          let options = {
            subject: res.data.subject,
            award_result: res.data.award_result,
            publicity_end_date: res.data.publicity_end_date
          };
          this.formValidate = options;
        });
    },
    // 发布获奖公示
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          let options = {
            award_result: this.formValidate.award_result,
            publicity_end_date: this.$util.crtTimeFtt(
              this.formValidate.publicity_end_date
            )
          };
          this.$axios
            .put(
              "/admin/event/publicity/" + this.$route.params.event_id,
              options
            )
            .then(res => {
              this.$Message.success("发布成功");
              setTimeout(() => {
                this.$router.push({ path: "/activity/list" });
              }, 200);
              this.$refs[name].resetFields();
            })
            .catch(error => {
              this.$refs[name].resetFields();
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
