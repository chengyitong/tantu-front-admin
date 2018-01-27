<template>
  <div>
    <Table :loading="table_loading" :columns="list_columns" :data="list"></Table>
    <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchForm: {
        page: 1,
        page_size: 10
      },
      list: [],
      list_columns: [
        {
          type: "index",
          width: 50,
          align: "center"
        },
        {
          title: "用户IP",
          key: "ip",
          sortable: true
        },
        {
          title: "用户QQ",
          key: "qq",
          sortable: true
        },
        {
          title: "用户手机号",
          key: "phone",
          sortable: true
        },
        {
          title: "反馈意见",
          key: "content",
          sortable: true
        },
        {
          title: "反馈提交时间",
          key: "create_time",
          width: 180,
          sortable: true
        }
      ],
      isShowPage: false,
      table_loading: false
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getFeedbackLists();
    });
  },
  methods: {
    // 获取反馈意见列表
    getFeedbackLists() {
      this.table_loading = true;
      this.$axios
        .get("/admin/feedback", { params: this.searchForm })
        .then(res => {
          this.table_loading = false;
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
      this.getFeedbackLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getFeedbackLists();
    }
  }
};
</script>
