<template>
  <div>
    <img-view v-if="showImg" @click="showImg = false;" :imgSrc="imgSrc"></img-view>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="60" inline>
      <Form-item label="用户ID" prop="a_9_id">
        <Input v-model="searchForm.a_9_id" placeholder="请输入用户ID" @on-enter="getUserAuthLists"></Input>
      </Form-item>
      <Form-item label="第三方" prop="type">
        <Select v-model="searchForm.type" placeholder="默认全部" @on-change="searchForm.page = 1;getUserAuthLists()" style="width: 60px;">
          <Option value="qq" key="qq">QQ</Option>
          <Option value="weixin" key="weixin">微信</Option>
        </Select>
      </Form-item>
      <Button type="primary" @on-enter="getUserAuthLists" @click="getUserAuthLists">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
    </Form>

    <Table :loading="table_loading" :columns="list_columns" :data="list"></Table>
    <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>
  </div>
</template>

<script>
import imgView from "../my_components/img-view/img-view";
export default {
  data() {
    return {
      searchForm: {
        page: 1,
        page_size: 10,
        a_9_id: null,
        type: "qq" // 第三方类型：qq、weixin
      },
      imgSrc: "", // 当前点击的图片链接
      showImg: false, // 显示放大的图片
      list: [],
      list_columns: [
        {
          title: "用户ID",
          key: "user_id",
          width: 100,
          render: (h, params) => {
            if (params.row.qq) {
              return h("span", params.row.qq.user_id);
            }
          }
        },
        {
          title: "用户昵称",
          key: "nickname",
          width: 160
        },
        {
          title: "第三方昵称",
          key: "nickname",
          width: 160,
          render: (h, params) => {
            let nickname = "";
            if (this.searchForm.type == "qq") {
              let qq = params.row.qq;
              if (qq && qq.nickname) {
                nickname = qq.nickname;
              }
            }
            if (this.searchForm.type == "weixin") {
              let weixin = params.row.weixin;
              if (weixin && weixin.nickname) {
                nickname = weixin.nickname;
              }
            }
            return h("span", nickname);
          }
        },
        {
          title: "用户当前头像",
          key: "avatar",
          width: 120,
          align: "center",
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: "用户当前头像",
                  trigger: "hover",
                  transfer: true,
                  placement: "right"
                }
              },
              [
                h("img", {
                  domProps: {
                    src: params.row.avatar
                  },
                  style: {
                    marginTop: "5px",
                    width: "50px",
                    height: "50px",
                    cursor: "pointer"
                  }
                }),
                h(
                  "div",
                  {
                    slot: "content"
                  },
                  [
                    h("img", {
                      domProps: {
                        src: params.row.avatar
                      },
                      style: {
                        maxWidth: "200px",
                        maxHeight: "200px"
                      }
                    })
                  ]
                )
              ]
            );
          }
        },
        {
          title: "第三方头像",
          key: "avatar",
          width: 120,
          align: "center",
          render: (h, params) => {
            let img_url = "";
            if (this.searchForm.type == "qq") {
              let qq = params.row.qq;
              if (qq && qq.figureurl_qq_2) {
                img_url = qq.figureurl_qq_2;
              }
            }
            if (this.searchForm.type == "weixin") {
              let weixin = params.row.weixin;
              if (weixin && weixin.headimgurl) {
                img_url = weixin.headimgurl;
              }
            }
            if (img_url == "") return false;
            return h(
              "Poptip",
              {
                props: {
                  content: "第三方头像",
                  trigger: "hover",
                  transfer: true,
                  placement: "right"
                }
              },
              [
                h("img", {
                  domProps: {
                    src: img_url
                  },
                  style: {
                    marginTop: "5px",
                    width: "50px",
                    height: "50px",
                    cursor: "pointer"
                  }
                }),
                h(
                  "div",
                  {
                    slot: "content"
                  },
                  [
                    h("img", {
                      domProps: {
                        src: img_url
                      },
                      style: {
                        maxWidth: "200px",
                        maxHeight: "200px"
                      }
                    })
                  ]
                )
              ]
            );
          }
        },
        {
          title: "第三方openid",
          key: "openid",
          render: (h, params) => {
            if (params.row.qq) {
              return h("span", params.row.qq.openid);
            }
          }
        },
        {
          title: "绑定时间",
          key: "create_time",
          sortable: true
        }
      ],
      isShowPage: false,
      table_loading: false
    };
  },
  components: {
    "img-view": imgView
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getUserAuthLists();
    });
  },
  methods: {
    // 获取用户认证列表
    getUserAuthLists() {
      let params = this.$util.deleteEmptyObj(this.searchForm);
      this.table_loading = true;
      this.$axios.get("/admin/third_party", { params }).then(res => {
        this.list = res.data.list;
        this.count = res.data.count;
        if (res.data.count > 0) {
          this.isShowPage = true;
        } else {
          this.isShowPage = false;
        }
        this.table_loading = false;
      });
    },
    // 翻页
    handlePageChange(cur_page) {
      this.searchForm.page = cur_page;
      this.getUserAuthLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getUserAuthLists();
    },
    // 查看缩略图的放大图
    clickImg(src) {
      this.showImg = true;
      this.imgSrc = src;
    }
  }
};
</script>
