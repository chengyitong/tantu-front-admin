<template>
    <div>
        <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="80" inline>
            <Form-item label="目标用户ID" prop="id">
                <Input v-model="searchForm.id" placeholder="输入目标用户ID" style="width: 100px;"></Input>
            </Form-item>
            <Form-item label="消息内容" prop="title">
                <Input v-model="searchForm.title" placeholder="输入消息标题"></Input>
            </Form-item>
            <Form-item label="发布时间" prop="create_time">
                <DatePicker type="daterange" v-model="searchForm.create_time" :options="datePickerOptions" placeholder="请选择发布时间周期" style="width: 180px" @on-change="searchForm.create_time=$event"></DatePicker>
            </Form-item>
            <Form-item label="发送方式" prop="is_auto">
                <Select v-model="searchForm.is_auto" placeholder="发送方式" @on-change="getMessageLists" style="width: 141px;">
                    <Option :value="0" :key="0">管理员手动发送</Option>
                    <Option :value="1" :key="1">系统自动发送</Option>
                </Select>
            </Form-item>
            <Button type="primary" @click="getMessageLists">
                <Icon type="search" size="14"></Icon>&nbsp;查询
            </Button>
            <Button type="success" @click="sendMessageModalVisible = true">
                <Icon type="plus" size="14"></Icon>&nbsp;发送消息
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>
        <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

        <!-- 发送消息弹框 -->
        <Modal v-model="sendMessageModalVisible" title="发送消息">
            <div slot="footer">
                <Button type="text" size="large" @click="sendMessageCancel('sendMessageForm')">取消</Button>
                <Button type="primary" size="large" :loading="sendMessageFormLoading" @click="sendMessage('sendMessageForm')">确定</Button>
            </div>
            <Form ref="sendMessageForm" :model="sendMessageForm" :rules="sendMessageFormRules" label-position="right" :label-width="100">
                <Form-item label="消息类型" prop="status">
                    <RadioGroup v-model="sendMessageForm.type">
                        <Radio :label="1">站内信</Radio>
                        <Radio :label="2">系统通知</Radio>
                    </RadioGroup>
                </Form-item>
                <Form-item v-if="sendMessageForm.type == 1" label="目标用户ID" prop="to_user_ids">
                    <Input v-model="sendMessageForm.to_user_ids" placeholder="用英文逗号隔开，指定的用户，都必须存在"></Input>
                </Form-item>
                <Form-item label="消息标题" prop="title">
                    <Input v-model="sendMessageForm.title" placeholder="请输入消息标题"></Input>
                </Form-item>
                <Form-item label="消息内容" prop="content">
                    <Input v-model="sendMessageForm.content" placeholder="请输入消息内容"></Input>
                </Form-item>
            </Form>
        </Modal>
    </div>
</template>

<script>
export default {
  data() {
    const validePhone = (rule, value, callback) => {
      var re = /^1[0-9]{10}$/;
      if (!re.test(value)) {
        callback(new Error("请输入正确格式的手机号"));
      } else {
        callback();
      }
    };
    return {
      searchForm: {
        page: 1,
        page_size: 10,
        id: null, // 可选，精确获取某个id
        title: null, // 通知标题，过滤类型 like
        status: 2, // 状态，1草稿，2已发布 发布后不能进行删除了和不会再次发送。
        is_auto: 0, // 可选，默认0，0只显示手动发送，1只显示自动发送
        create_time: [] // 发布时间段
      },
      datePickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            }
          },
          {
            text: "最近一个月",
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            }
          },
          {
            text: "最近三个月",
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            }
          }
        ]
      },
      sendMessageFormLoading: false,
      sendMessageModalVisible: false,
      sendMessageForm: {
        type: 1, // 1-站内信；2-系统通知
        title: null, // 消息标题
        content: null, // 消息内容，支持富文本
        to_user_ids: null // 发给那些用户的id，用英文逗号隔开。若需发送系统消息，这个参数不能传。指定的用户，都必须存在，指定后为站内信发送。
      },
      sendMessageFormRules: {
        title: [{ required: true, message: "请输入消息标题", trigger: "blur" }],
        content: [{ required: true, message: "请输入消息内容", trigger: "blur" }]
      },
      list: [],
      list_columns: [
        {
          type: "index",
          width: 50,
          align: "center"
        },
        {
          title: "消息类型",
          key: "to_user_ids",
          width: 160,
          sortable: true,
          render: (h, params) => {
            if (params.row.to_user_ids == null) return h("span", "系统通知");
            return h("span", "站内信");
          }
        },
        {
          title: "目标用户ID",
          key: "to_user_ids",
          width: 160,
          sortable: true,
          render: (h, params) => {
            return h("span", params.row.to_user_ids.toString());
          }
        },
        {
          title: "消息标题",
          key: "title",
          width: 180,
          sortable: true
        },
        {
          title: "消息内容",
          key: "content",
          sortable: true
        },
        {
          title: "发送时间",
          key: "update_time",
          width: 180,
          sortable: true
        }
      ],
      isShowPage: false
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getMessageLists();
    });
  },
  methods: {
    // 获取消息列表
    getMessageLists() {
      this.$axios.get("/admin/msg", { params: this.searchForm }).then(res => {
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
      this.getMessageLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getMessageLists();
    },
    // 发送站内信
    sendMessage(name) {
      if (this.sendMessageForm.type == 1) {
        if (
          this.sendMessageForm.to_user_ids == null ||
          this.sendMessageForm.to_user_ids == ""
        ) {
          this.$Message.warning("发送站内信需要填写目标用户的ID");
          return false;
        }
      }
      this.$refs[name].validate(valid => {
        if (valid) {
          this.sendMessageFormLoading = true;
          this.$axios
            .post("/admin/msg/", this.sendMessageForm)
            .then(res => {
              console.log(res);
              if (res.code == 0) {
                this.$refs[name].resetFields();
                this.getMessageLists();
                this.$Message.success("发送成功！");
                this.sendMessageFormLoading = false;
                this.sendMessageModalVisible = false;
              }
            })
            .catch(error => {
              this.$refs[name].resetFields();
              this.sendMessageFormLoading = false;
            });
        } else {
          this.sendMessageFormLoading = false;
        }
      });
    },
    // 取消发送
    sendMessageCancel(name) {
      this.sendMessageModalVisible = false;
      this.$refs[name].resetFields();
    }
  }
};
</script>
