<template>
  <div>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
      <Form-item label="活动类型">
        <Select v-model="searchForm.event_type" filterable @on-change="getEventList" style="width: 100px;">
          <Option :value="0" :key="0">赛事</Option>
          <Option :value="1" :key="1">任务</Option>
          <!-- <Option :value="2" :key="2">第三方推广</Option> -->
        </Select>
      </Form-item>
      <Form-item label="活动名称">
        <Select v-model="searchForm.event_id" @on-change="getPlinksStatistics" filterable clearable style="width: 280px">
          <Option v-for="item in event_ids" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </Form-item>
      <Form-item label="链接名称">
        <Input v-model="searchForm.name" placeholder="请输入推广链接名称" @keyup.enter.native="getPlinksStatistics"></Input>
      </Form-item>
      <Form-item label="链接状态">
        <Select v-model="searchForm.status" filterable clearable @on-change="getPlinksStatistics" style="width: 70px;">
          <Option :value="1" :key="1">正常</Option>
          <Option :value="2" :key="2">禁用</Option>
        </Select>
      </Form-item>
      <Button type="primary" @click="getPlinksStatistics">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
    </Form>

    <Table :columns="list_columns" :data="list"></Table>
    <Page v-if="isShowPage" :total="count" show-total show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchForm: {
        page: 1,
        page_size: 10,
        event_type: 0, // 活动类型，0:赛事；1:任务；2:第三方推广
        name: "", // 名称
        status: 1, // 状态：1:正常；2:禁用
        event_id: "" // 活动id
      },
      event_ids: [], // 活动列表
      isShowPage: false,
      list: [], // 推广链接列表
      list_columns: [
        {
          type: "index",
          width: 50,
          align: "center"
        },
        {
          title: "活动名称",
          key: "event_id",
          sortable: true,
          render: (h, params) => {
            let subject = params.row.event.subject;
            return h("span", subject);
          }
        },
        {
          title: "链接名称",
          key: "name",
          sortable: true
        },
        {
          title: "用户数",
          key: "user_count",
          sortable: true
        },
        {
          title: "图片数",
          key: "event_images_count",
          sortable: true
        },
        {
          title: "状态",
          key: "status",
          width: 120,
          align: "center",
          render: (h, params) => {
            let status = params.row.status;
            let status_str = status == 1 ? "正常" : "禁用";
            let status_color = status == 1 ? "green" : "red";
            return h(
              "Tag",
              {
                props: {
                  color: status_color,
                  type: "dot",
                  size: "small"
                }
              },
              status_str
            );
          },
          sortable: true
        }
      ],
      count: 0 // 数据总条数
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getEventList();
      this.getPlinksStatistics();
    });
  },
  methods: {
    // 获取活动列表用于查询推广链接列表
    getEventList() {
      let _params = {
        page: 1,
        page_size: 1000,
        event_type: this.searchForm.event_type,
        subject: ""
      };
      this.event_ids = [];
      this.$axios
        .get("/admin/event", { params: _params })
        .then(res => {
          let list = res.data.list;
          for (let i = 0; i < list.length; i++) {
            const options = {};
            options.label = list[i].subject;
            options.value = list[i].id;
            this.event_ids.push(options);
          }
        })
        .catch(error => {});
      this.searchForm.event_id = "";
    },
    // 获取推广链接列表
    getPlinksStatistics() {
      this.$axios
        .get("/admin/plinks_statistics", { params: this.searchForm })
        .then(res => {
          this.list = res.data.list;
          if (res.data.count >= this.searchForm.page_size) {
            this.count = res.data.count;
            this.isShowPage = true;
          } else {
            this.isShowPage = false;
          }
        })
        .catch(error => {});
    },
    // 翻页
    handlePageChange(cur_page) {
      this.searchForm.page = cur_page;
      this.getPlinksStatistics();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getPlinksStatistics();
    }
  }
};
</script>
