<template>
  <div>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="80" inline>
      <Form-item label="公告标题" prop="title">
        <Input v-model="searchForm.title" placeholder="输入公告标题"></Input>
      </Form-item>
      <Form-item label="发布时间" prop="create_time">
        <DatePicker type="daterange" v-model="searchForm.create_time" :options="datePickerOptions" placeholder="请选择发布时间周期" style="width: 180px" @on-change="searchForm.create_time=$event"></DatePicker>
      </Form-item>
      <Button type="primary" @click="getMessageLists">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
    </Form>

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
        page_size: 10,
        id: null, // 可选，精确获取某个id
        title: null, // 通知标题，过滤类型 like
        status: 2, // 状态，1草稿，2已发布 发布后不能进行删除了和不会再次发送。
        is_auto: null, // 可选，默认0，0只显示手动发送，1只显示自动发送
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
      list: [],
      list_columns: [
        {
          type: "index",
          width: 50,
          align: "center"
        },
        {
          title: "公告标题",
          key: "title",
          width: 180,
          sortable: true
        },
        {
          title: "公告正文",
          key: "content",
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: "查看详情",
                  trigger: "hover",
                  transfer: true,
                  placement: "right"
                }
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    }
                  },
                  "详情"
                ),
                h(
                  "div",
                  {
                    slot: "content"
                  },
                  [
                    h(
                      "div",
                      {
                        domProps: {
                          src: params.row.avatar
                        },
                        style: {
                          width: "500px",
                          height: "300px",
                          wordBreak: "break-all",
                          wordWrap: "break-word"
                        }
                      },
                      params.row.content
                    )
                  ]
                )
              ]
            );
          }
        },
        {
          title: "发送时间",
          key: "update_time",
          width: 180,
          sortable: true
        },
        {
          title: "操作",
          key: "action",
          fixed: "right",
          width: 120,
          align: "center",
          render: (h, params) => {
            let currentRow = params.row;
            return h("span", [
              h(
                "a",
                {
                  style: {
                    margin: "0 5px"
                  },
                  on: {
                    click: () => {
                      this.$router.push(
                        "/message/notice/edit/" + currentRow.id
                      );
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Poptip",
                {
                  props: {
                    confirm: true,
                    title: "您确定要删除这条公告吗?",
                    transfer: true,
                    placement: "top-end"
                  },
                  on: {
                    "on-ok": () => {
                      currentRow.isDeleting = true;
                      this.$axios
                        .delete("/admin/msg/" + params.row.id)
                        .then(res => {
                          this.list.splice(params.index, 1);
                        })
                        .catch(error => {
                          currentRow.isDeleting = false;
                        });
                    }
                  }
                },
                [
                  h(
                    "a",
                    {
                      props: {
                        type: "error",
                        size: "small",
                        placement: "top",
                        loading: currentRow.isDeleting
                      },
                      style: {
                        margin: "0 5px",
                        color: "#ed3f14"
                      }
                    },
                    "删除"
                  )
                ]
              )
            ]);
          }
        }
      ],
      isShowPage: false,
      table_loading: false
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
      this.table_loading = true;
      this.$axios.get("/admin/msg", { params: this.searchForm }).then(res => {
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
      this.getMessageLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getMessageLists();
    }
  }
};
</script>
