<template>
  <div>
    <img-view v-if="showImg" @click="showImg = false" :imgSrc="imgSrc"></img-view>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
      <Form-item label="活动类型">
        <Select v-model="searchForm.event_type" filterable @on-change="getActivityLists" style="width: 100px;">
          <Option :value="0" :key="0">赛事</Option>
          <Option :value="1" :key="1">任务</Option>
          <!-- <Option :value="2" :key="2">第三方推广</Option> -->
        </Select>
      </Form-item>
      <Form-item label="活动状态">
        <Select v-model="searchForm.status" clearable filterable placeholder="默认为全部" @on-change="getActivityLists" style="width: 100px;">
          <Option :value="1" :key="1">草稿</Option>
          <Option :value="2" :key="2">已发布(进行中)</Option>
          <Option :value="3" :key="3">评奖中</Option>
          <Option :value="4" :key="4">公示中</Option>
          <Option :value="5" :key="5">已结束</Option>
        </Select>
      </Form-item>
      <Form-item label="活动时间" prop="datePickerValue">
        <DatePicker type="daterange" v-model="datePickerValue" :options="datePickerOptions" placeholder="请选择时间周期" style="width: 180px" @on-change="datePickerValue=$event"></DatePicker>
      </Form-item>
      <Form-item label="标题">
        <Input v-model="searchForm.subject" placeholder="活动标题" @keyup.enter.native="getActivityLists"></Input>
      </Form-item>
      <Form-item label="奖品">
        <Input v-model="searchForm.award" placeholder="活动奖品" @keyup.enter.native="getActivityLists"></Input>
      </Form-item>
      <Button type="primary" @click="getActivityLists">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
    </Form>

    <Table :columns="list_columns" :data="list"></Table>
    <Page v-if="isShowPage" :total="count" show-total show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

    <!-- S 投稿明细 -->
    <Modal v-model="productCountModalVisible" title="投稿明细" width="95%" :styles="{top: '20px'}">
      <div slot="footer">
        <Button type="primary" size="large" @click="productCountModalVisible = false">关闭</Button>
      </div>
      <Table :columns="product_list_columns" :data="product_list"></Table>
      <Page v-if="isShowPageProduct" :total="product_count" show-total @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>
    </Modal>
    <!-- E 投稿明细 -->

    <!-- S 参与用户明细 -->
    <Modal v-model="userCountModalVisible" title="参与用户明细" :styles="{top: '20px'}">
      <div slot="footer">
        <Button type="primary" size="large" @click="userCountModalVisible = false">关闭</Button>
      </div>
      <Table :columns="user_list_columns" :data="user_list"></Table>
      <Page v-if="isShowPageUser" :total="user_count" show-total @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>
    </Modal>
    <!-- E 参与用户明细 -->
  </div>
</template>

<script>
import imgView from "../my_components/img-view/img-view";
export default {
  data() {
    return {
      // 搜索
      searchForm: {
        page: 1,
        page_size: 10,
        event_type: null, // 活动类型
        start_time: [], // 活动开始时间 2017-08-10
        end_time: [], // 活动结束时间
        subject: null, // 活动标题
        award: null, // 奖品
        status: null // 活动状态：1草稿，2发布，3评奖，4公示，5结束
      },
      datePickerValue: ["", ""],
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
      // 活动列表
      imgSrc: "", // 当前点击的图片链接
      showImg: false, // 显示放大的图片
      list: [],
      list_columns: [
        {
          type: "index",
          width: 50,
          align: "center",
          fixed: "left"
        },
        {
          title: "类型",
          key: "event_type",
          sortable: true,
          width: 110,
          align: "center",
          fixed: "left",
          render: (h, params) => {
            let event_type = params.row.event_type;
            let event_type_str = event_type == 0 ? "赛事" : "任务";
            let event_type_color = event_type == 0 ? "green" : "red";
            return h(
              "Tag",
              {
                props: {
                  color: event_type_color,
                  type: "dot",
                  size: "small"
                }
              },
              event_type_str
            );
          }
        },
        {
          title: "活动名称",
          key: "subject",
          width: 280,
          fixed: "left",
          render: (h, params) => {
            return h(
              "span",
              "（ID:" + params.row.id + "） " + params.row.subject
            );
          }
        },
        {
          title: "投稿数量",
          key: "product_count",
          width: 110,
          align: "center",
          sortable: true,
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: "点击数字查看投稿明细",
                  trigger: "hover",
                  transfer: true,
                  placement: "top"
                }
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "success",
                      size: "small"
                    }
                    // on: {
                    //   click: () => {
                    //     this.productCountModal(params.row);
                    //   }
                    // }
                  },
                  params.row.product_count || 0
                )
              ]
            );
          }
        },
        {
          title: "参与人数",
          key: "user_count",
          width: 110,
          align: "center",
          sortable: true,
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: "点击数字查看参与明细",
                  trigger: "hover",
                  transfer: true,
                  placement: "top"
                }
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "warning",
                      size: "small"
                    }
                    // on: {
                    //   click: () => {
                    //     this.userCountModal(params.row);
                    //   }
                    // }
                  },
                  params.row.user_count || 0
                )
              ]
            );
          }
        },
        {
          title: "开始日期",
          key: "start_time",
          width: 110,
          sortable: true
        },
        {
          title: "结束日期",
          key: "end_time",
          width: 110,
          sortable: true
        },
        {
          title: "奖品",
          key: "award",
          width: 240,
          sortable: true
        },
        {
          title: "主页缩略图",
          key: "subject_banner_index",
          width: 160,
          align: "center",
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: "主页缩略图",
                  trigger: "hover",
                  transfer: true,
                  placement: "left"
                }
              },
              [
                h("img", {
                  domProps: {
                    src: params.row.subject_banner_index + "-h160?_="
                  },
                  style: {
                    marginTop: "5px",
                    width: "100%",
                    height: "100%",
                    maxWidth: "200px",
                    maxHeight: "160px",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      this.clickImg(params.row.subject_banner_index);
                    }
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
                        src: params.row.subject_banner_index + "-h160?_="
                      },
                      style: {
                        maxWidth: "500px",
                        maxHeight: "400px"
                      }
                    })
                  ]
                )
              ]
            );
          }
        },
        {
          title: "首页Banner图",
          key: "subject_banner_detail",
          width: 160,
          align: "center",
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: "首页Banner图",
                  trigger: "hover",
                  transfer: true,
                  placement: "left"
                }
              },
              [
                h("img", {
                  domProps: {
                    src: params.row.subject_banner_detail + "-h160?_="
                  },
                  style: {
                    marginTop: "5px",
                    width: "100%",
                    height: "100%",
                    maxWidth: "200px",
                    maxHeight: "160px",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      this.clickImg(params.row.subject_banner_detail);
                    }
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
                        src: params.row.subject_banner_detail + "-h160?_="
                      },
                      style: {
                        maxWidth: "500px",
                        maxHeight: "400px"
                      }
                    })
                  ]
                )
              ]
            );
          }
        },
        {
          title: "列表缩略图",
          key: "subject_banner_list",
          width: 160,
          align: "center",
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: "列表缩略图",
                  trigger: "hover",
                  transfer: true,
                  placement: "left"
                }
              },
              [
                h("img", {
                  domProps: {
                    src: params.row.subject_banner_list + "-h160?_="
                  },
                  style: {
                    marginTop: "5px",
                    width: "100%",
                    height: "100%",
                    maxWidth: "200px",
                    maxHeight: "160px",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      this.clickImg(params.row.subject_banner_list);
                    }
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
                        src: params.row.subject_banner_list + "-h160?_="
                      },
                      style: {
                        maxWidth: "500px",
                        maxHeight: "400px"
                      }
                    })
                  ]
                )
              ]
            );
          }
        },
        {
          title: "排序",
          key: "sortnum",
          width: 80,
          sortable: true
        },
        {
          title: "外链",
          key: "link",
          width: 100,
          sortable: true,
          render: (h, params) => {
            let link = params.row.link;
            if (link == "") {
              return h(
                "Tag",
                {
                  props: {
                    color: "red",
                    type: "dot",
                    size: "small"
                  }
                },
                "无"
              );
            } else {
              return h(
                "Poptip",
                {
                  props: {
                    content: link,
                    trigger: "hover",
                    transfer: true,
                    placement: "top"
                  }
                },
                [
                  h(
                    "Tag",
                    {
                      props: {
                        color: "green",
                        type: "dot",
                        size: "small"
                      }
                    },
                    "有"
                  )
                ]
              );
            }
          }
        },
        {
          title: "操作",
          key: "action",
          width: 130,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            let currentRow = params.row;
            let status = params.row.status; // 1草稿，2发布，3评奖，4公示，5结束
            let status_str = ["", "草稿", "进行中", "评奖中", "公示中", "已结束"];
            if (status == 1 || status == 2) {
              return h("span", [
                h("p", status_str[status]),
                h(
                  "a",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    on: {
                      click: () => {
                        this.$router.push("/activity/edit/" + currentRow.id);
                      }
                    }
                  },
                  "编辑详情"
                )
              ]);
            } else {
              return h("span", [
                h("p", status_str[status]),
                h(
                  "a",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    on: {
                      click: () => {
                        this.$router.push("/activity/edit/" + currentRow.id);
                      }
                    }
                  },
                  "编辑详情"
                ),
                h("p", [
                  h(
                    "a",
                    {
                      props: {
                        type: "primary",
                        size: "small"
                      },
                      on: {
                        click: () => {
                          this.$router.push(
                            "/activity/publicity/" + currentRow.id
                          );
                        }
                      }
                    },
                    "编辑公示"
                  )
                ])
              ]);
            }

            // if (status == 1) {
            //   return h("span", [
            //     h(
            //       "a",
            //       {
            //         props: {
            //           type: "primary",
            //           size: "small"
            //         },
            //         on: {
            //           click: () => {
            //             this.$router.push("/activity/edit/" + currentRow.id);
            //             // this.productCountModal(params.row);
            //           }
            //         }
            //       },
            //       "编辑草稿"
            //     ),
            //     h(
            //       "Poptip",
            //       {
            //         props: {
            //           confirm: true,
            //           title: "您确定要删除这条数据吗?",
            //           transfer: true,
            //           placement: "top-end"
            //         },
            //         on: {
            //           "on-ok": () => {
            //             currentRow.isDeleting = true;
            //             this.$axios
            //               .delete("/admin/event/" + params.row.id)
            //               .then(res => {
            //                 this.$Message.success("删除成功");
            //                 this.getActivityLists();
            //               })
            //               .catch(error => {
            //                 currentRow.isDeleting = false;
            //               });
            //           }
            //         }
            //       },
            //       [
            //         h(
            //           "a",
            //           {
            //             props: {
            //               type: "error",
            //               size: "small",
            //               placement: "top",
            //               loading: currentRow.isDeleting
            //             },
            //             style: {
            //               marginLeft: "10px"
            //             }
            //           },
            //           "删除"
            //         )
            //       ]
            //     )
            //   ]);
            // }
            // if (status == 3) {
            //   return h("span", [
            //     h("p", "公示中"),
            //     h(
            //       "a",
            //       {
            //         props: {
            //           type: "primary",
            //           size: "small"
            //         },
            //         on: {
            //           click: () => {
            //             this.$router.push("/activity/edit/" + currentRow.id);
            //           }
            //         }
            //       },
            //       "编辑详情"
            //     ),
            //     h("p", [
            //       h(
            //         "a",
            //         {
            //           props: {
            //             type: "primary",
            //             size: "small"
            //           },
            //           on: {
            //             click: () => {
            //               this.$router.push(
            //                 "/activity/publicity/" + currentRow.id
            //               );
            //             }
            //           }
            //         },
            //         "编辑公示"
            //       )
            //     ])
            //   ]);
            // }
            // // 1草稿，2发布，3评奖，4公示，5结束
            // if (status == 2) {
            //   return h("span", [
            //     h("p", "进行中"),
            //     h(
            //       "a",
            //       {
            //         props: {
            //           type: "primary",
            //           size: "small"
            //         },
            //         on: {
            //           click: () => {
            //             this.$router.push("/activity/edit/" + currentRow.id);
            //             // this.productCountModal(params.row);
            //           }
            //         }
            //       },
            //       "编辑"
            //     )
            //   ]);
            // }
            // if (status == 4) {
            //   // return h("span", "公示中");
            //   return h("span", [
            //     h("p", "公示中"),
            //     h(
            //       "a",
            //       {
            //         props: {
            //           type: "primary",
            //           size: "small"
            //         },
            //         on: {
            //           click: () => {
            //             this.$router.push("/activity/edit/" + currentRow.id);
            //             // this.productCountModal(params.row);
            //           }
            //         }
            //       },
            //       "编辑"
            //     )
            //   ]);
            // }
            // if (status == 5) {
            //   // return h("span", "已结束");
            //   return h("span", [
            //     h("p", "已结束"),
            //     h(
            //       "a",
            //       {
            //         props: {
            //           type: "primary",
            //           size: "small"
            //         },
            //         on: {
            //           click: () => {
            //             this.$router.push("/activity/edit/" + currentRow.id);
            //             // this.productCountModal(params.row);
            //           }
            //         }
            //       },
            //       "编辑"
            //     )
            //   ]);
            // }
          }
        }
      ],
      count: 0,
      isShowPage: false,
      // 投稿明细
      productCountModalVisible: false,
      productCountFormLoading: false,
      product_list: [],
      product_list_columns: [
        {
          type: "index",
          width: 50,
          align: "center",
          fixed: "left"
        },
        {
          title: "ID",
          key: "id",
          width: 80,
          align: "center",
          sortable: true
        },
        {
          title: "预览图",
          key: "imgkey",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h("img", {
              domProps: {
                src: params.row.imgkey
              },
              style: {
                marginTop: "5px",
                maxWidth: "140px",
                maxHeight: "60px"
              }
            });
          }
        },
        {
          title: "名称",
          key: "name",
          width: 180,
          sortable: true
        },
        {
          title: "分类",
          key: "classname",
          sortable: true
        },
        {
          title: "标签",
          key: "tagname",
          sortable: true
        },
        {
          title: "颜色",
          key: "colorname",
          sortable: true
        },
        {
          title: "状态",
          key: "status",
          width: 130,
          align: "center",
          sortable: true,
          render: (h, params) => {
            let status = params.row.status;
            let status_str = status == 1 ? "已上架" : "已下架";
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
          }
        },
        {
          title: "用户",
          key: "nickname",
          sortable: true
        },
        {
          title: "属性",
          key: "isfree",
          width: 120,
          align: "center",
          sortable: true,
          render: (h, params) => {
            let isfree = params.row.isfree;
            let isfree_str = isfree == true ? "免费" : "收费";
            let isfree_color = isfree == true ? "green" : "red";
            return h(
              "Tag",
              {
                props: {
                  color: isfree_color,
                  type: "dot",
                  size: "small"
                }
              },
              isfree_str
            );
          }
        },
        {
          title: "上传时间",
          key: "ctime",
          width: 160,
          sortable: true
        },
        {
          title: "操作",
          key: "action",
          width: 130,
          align: "center",
          render: (h, params) => {
            let currentRow = params.row;
            return h("span", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.updatePlinksModal(params.row);
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
                    title: "您确定要删除这条数据吗?",
                    transfer: true,
                    placement: "top-end"
                  },
                  on: {
                    "on-ok": () => {
                      currentRow.isDeleting = true;
                      this.list.splice(params.index, 1);
                    }
                  }
                },
                [
                  h(
                    "Button",
                    {
                      props: {
                        type: "error",
                        size: "small",
                        placement: "top",
                        loading: currentRow.isDeleting
                      },
                      style: {
                        margin: "0 5px"
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
      product_count: 0,
      isShowPageProduct: false,
      // 参与用户明细
      userCountModalVisible: false,
      userCountFormLoading: false,
      user_list: [],
      user_list_columns: [
        {
          type: "index",
          width: 50,
          align: "center"
        },
        {
          title: "用户ID",
          key: "uid",
          sortable: true
        },
        {
          title: "用户昵称",
          key: "nickname",
          sortable: true
        },
        {
          title: "投稿数量",
          key: "count",
          sortable: true
        }
      ],
      user_count: 0,
      isShowPageUser: false
    };
  },
  components: {
    "img-view": imgView
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getActivityLists();
      // this.productCountModal();
    });
  },
  methods: {
    getActivityLists() {
      let datePickerValue = this.datePickerValue;
      let start_time = datePickerValue[0];
      let end_time = datePickerValue[1];
      if (start_time == "" || start_time == undefined) {
        this.searchForm.start_time = [];
      } else {
        this.searchForm.start_time = [start_time];
      }
      if (end_time == "" || end_time == undefined) {
        this.searchForm.end_time = [];
      } else {
        this.searchForm.end_time = [end_time];
      }

      if (this.searchForm.type == "") this.searchForm.type = null;
      if (this.searchForm.status == "") this.searchForm.status = null;
      if (this.searchForm.subject == "") this.searchForm.subject = null;
      if (this.searchForm.award == "") this.searchForm.award = null;

      this.$axios.get("/admin/event", { params: this.searchForm }).then(res => {
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
      this.getActivityLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getActivityLists();
    },
    // 点击查看投稿数量明细
    productCountModal() {
      let data = this.$mock.mock({
        "list|1-10": [
          {
            "id|+1": 10000,
            "imgkey|1": [
              "http://mis.tantupix.com/static/uploadfiles/event/59cfc071dd7e2.jpg",
              "http://mis.tantupix.com/static/uploadfiles/event/59cfc07fa8913.jpg",
              "http://mis.tantupix.com/static/uploadfiles/event/59cfc0876bcc3.jpg",
              "http://mis.tantupix.com/static/uploadfiles/event/59cfc407d1a91.jpg"
            ], // 预览图
            size: "@integer(1024, 102400)", // 大小
            foldername: "@ctitle(2, 6)", // 相册
            name: "@ctitle(2, 18)", // 图片名称
            classids: "@range(7, 9)", // 分类id
            classname: "@ctitle(2,5)", // 分类名称
            tagids: "@range(3, 7)", // 标签id
            tagname: "@ctitle(2, 4)", // 标签名称
            colorids: "@range(4, 6)", // 颜色id
            colorvalue: "@color", // 颜色值
            "status|1": [0, 1], // 状态：0-下架；1-上架
            "haspass|1": [-2, -1, 0, 1], // 审核结果：-2：待处理；-1:未通过；0:待审核；1:已发布
            nickname: "@ctitle(2, 8)", // 用户昵称
            "isfree|1": [true, false], // 是否收费 boolean
            ctime: "@datetime" // 上传时间
          }
        ]
      });
      this.product_list = data.list;
      this.productCountModalVisible = true;
    },
    // 点击查看参与用户明细
    userCountModal() {
      let data = this.$mock.mock({
        "list|1-20": [
          {
            "id|+1": 10000,
            "uid|+1": 10000,
            nickname: "@ctitle(2, 8)", // 用户昵称
            count: "@natural(60, 100)" // 投稿数量
          }
        ]
      });
      this.user_list = data.list;
      this.userCountModalVisible = true;
    },
    // 查看预览图的放大图
    clickImg(src) {
      this.showImg = true;
      this.imgSrc = src;
    }
  }
};
</script>
