<template>
    <div>
        <img-view v-if="showImg" @click="showImg = false;" :imgSrc="imgSrc"></img-view>
        <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="50" inline>
            <Form-item label="类型">
                <Select v-model="searchForm.type" @on-change="getBannerLists" style="width: 180px">
                    <Option :value="1" :key="1">首页Banner</Option>
                    <Option :value="2" :key="2">个人中心默认Banner</Option>
                </Select>
            </Form-item>
            <Button type="primary" @click="getBannerLists">
                <Icon type="search" size="14"></Icon>&nbsp;查询
            </Button>
            <Button type="success" @click="addBannerModalVisible = true">
                <Icon type="plus" size="14"></Icon>&nbsp;添加Banner
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>

        <Page v-if="isShowPage" :total="count" show-total show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>


        <!-- 添加Banner弹框 -->
        <Modal v-model="addBannerModalVisible" title="添加Banner" width="800">
            <div slot="footer">
                <Button type="text" size="large" @click="addBannerCancel('addBannerForm')">取消</Button>
                <Button type="primary" size="large" :loading="addBannerFormLoading" @click="addBanner('addBannerForm')">确定</Button>
            </div>
            <Form ref="addBannerForm" :model="addBannerForm" :rules="addBannerFormRules" label-position="right" :label-width="100">
                <Form-item label="类型" prop="type">
                    <Select v-model="addBannerForm.type" style="width: 180px">
                        <Option :value="1" :key="1">首页Banner</Option>
                        <Option :value="2" :key="2">个人中心默认Banner</Option>
                    </Select>
                </Form-item>
                <Form-item label="Banner图" prop="img_url">
                    <Input v-model="addBannerForm.img_url" placeholder="请输入Banner图片的链接" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
                </Form-item>
                <Form-item label="跳转链接" prop="jump_url">
                    <Input v-model="addBannerForm.jump_url" placeholder="请输入点击图片后的跳转链接" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
                </Form-item>
                <Form-item label="图片作者ID" prop="user_id">
                    <Input v-model="addBannerForm.user_id" placeholder="请输入图片作者ID" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
                </Form-item>
                <Form-item label="备注" prop="remark">
                    <Input v-model="addBannerForm.remark" placeholder="请输入备注" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
                </Form-item>
            </Form>
        </Modal>

        <!-- 更新banner弹框 -->
        <Modal v-model="updateBannerModalVisible" title="更新Banner" width="800">
            <div slot="footer">
                <Button type="text" size="large" @click="updateBannerCancel('updateBannerForm')">取消</Button>
                <Button type="primary" size="large" :loading="updateBannerFormLoading" @click="updateBanner('updateBannerForm')">确定</Button>
            </div>
            <Form ref="updateBannerForm" :model="updateBannerForm" :rules="addBannerFormRules" label-position="right" :label-width="100">
                <Form-item label="类型" prop="type">
                    <Select v-model="updateBannerForm.type" disabled style="width: 180px">
                        <Option :value="1" :key="1">首页Banner</Option>
                        <Option :value="2" :key="2">个人中心默认Banner</Option>
                    </Select>
                </Form-item>
                <Form-item label="Banner图" prop="img_url">
                    <Input v-model="updateBannerForm.img_url" placeholder="请输入Banner图片的链接" size="large" @keyup.enter.native="updateBanner('updateBannerForm')"></Input>
                </Form-item>
                <Form-item label="跳转链接" prop="jump_url">
                    <Input v-model="updateBannerForm.jump_url" placeholder="请输入点击图片后的跳转链接" size="large" @keyup.enter.native="updateBanner('updateBannerForm')"></Input>
                </Form-item>
                <Form-item label="图片作者ID" prop="user_id">
                    <Input v-model="updateBannerForm.user_id" placeholder="请输入图片作者ID" size="large" @keyup.enter.native="updateBanner('updateBannerForm')"></Input>
                </Form-item>
                <Form-item label="备注" prop="remark">
                    <Input v-model="updateBannerForm.remark" placeholder="请输入备注" size="large" @keyup.enter.native="updateBanner('updateBannerForm')"></Input>
                </Form-item>
            </Form>
        </Modal>
    </div>
</template>

<script>
import imgView from "../my_components/img-view/img-view";
export default {
  data() {
    return {
      searchForm: {
        type: 1,
        page: 1,
        page_size: 20
      },
      imgSrc: "", // 当前点击的图片链接
      showImg: false, // 显示放大的图片
      isShowPage: false, // 是否显示分页
      list: [], // banner列表
      list_columns: [
        {
          title: "缩略图",
          key: "img_url",
          align: "center",
          render: (h, params) => {
            return h("img", {
              domProps: {
                src: params.row.img_url + "-slist",
                alt: params.row.name,
                title: params.row.name
              },
              style: {
                display: "block",
                margin: "5px auto 3px",
                maxWidth: "400px",
                maxHeight: "100px",
                cursor: "pointer"
              },
              on: {
                click: () => {
                  this.clickImg(params.row.img_url + "-topimg");
                }
              }
            });
          }
        },
        {
          title: "跳转链接",
          key: "jump_url"
        },
        {
          title: "备注",
          key: "remark"
        },
        {
          title: "图片作者ID",
          key: "user_id"
        },
        {
          title: "创建时间",
          key: "create_time",
          align: "center",
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
                      this.updateBannerModal(params.row);
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
                      this.$axios
                        .delete("/admin/banner/" + params.row.id)
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
      count: 0, // 数据总条数
      addBannerModalVisible: false,
      addBannerForm: {
        img_url: "", // 图片链接
        type: 1, // 类型：1-首页Banner，2-用户个人中心默认Banner
        user_id: "", // 图片作者ID
        remark: "", //否	string	备注
        jump_url: "" //否	string	跳转链接
      },
      addBannerFormRules: {
        type: [
          {
            type: "number",
            required: true,
            message: "请选择Banner类型",
            trigger: "change"
          }
        ],
        img_url: [
          {
            type: "url",
            required: true,
            message: "请输入banner的url",
            trigger: "blur"
          }
        ],
        jump_url: [
          {
            type: "url",
            message: "请输入点击图片后的跳转链接",
            trigger: "blur"
          }
        ]
      },
      addBannerFormLoading: false,
      updateBannerModalVisible: false,
      updateBannerForm: {},
      updateBannerFormLoading: false
    };
  },
  components: {
    "img-view": imgView
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getBannerLists();
    });
  },
  methods: {
    // 获取banner列表
    getBannerLists() {
      this.$axios
        .get("/admin/banner", { params: this.searchForm })
        .then(res => {
          this.list = res.data.list;
          this.count = res.data.count;
          if (res.data.count >= this.searchForm.page_size) {
            this.isShowPage = true;
          } else {
            this.isShowPage = false;
          }
        });
    },
    // 翻页
    handlePageChange(cur_page) {
      this.searchForm.page = cur_page;
      this.getBannerLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getBannerLists();
    },
    // 查看缩略图的放大图
    clickImg(src) {
      this.showImg = true;
      this.imgSrc = src;
    },
    // 点击确定添加按钮
    addBanner(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.addBannerFormLoading = true;
          this.$axios.post("/admin/banner", this.addBannerForm).then(res => {
            if (res.code == 0) {
              this.getBannerLists();
              this.$Message.success("添加成功！");
              this.addBannerCancel(name);
              this.addBannerFormLoading = false;
            }
          });
        } else {
          this.addBannerFormLoading = false;
        }
      });
    },
    // 取消添加
    addBannerCancel(name) {
      this.addBannerModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 点击“编辑”按钮
    updateBannerModal(row) {
      let options = {
        id: row.id,
        user_id: row.user_id,
        jump_url: row.jump_url,
        remark: row.remark,
        type: row.type,
        img_url: row.img_url
      };
      this.updateBannerForm = options;
      this.updateBannerModalVisible = true;
    },
    // 取消编辑
    updateBannerCancel(name) {
      this.updateBannerModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 保存编辑结果
    updateBanner(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.updateBannerFormLoading = true;
          this.$axios
            .put(
              "/admin/banner/" + this.updateBannerForm.id,
              this.updateBannerForm
            )
            .then(res => {
              console.log(res);
              if (res.code == 0) {
                this.getBannerLists();
                this.$Message.success("更新成功！");
                this.updateBannerFormLoading = false;
                this.updateBannerModalVisible = false;
              }
            })
            .catch(error => {
              this.updateBannerFormLoading = false;
            });
        } else {
          this.updateBannerFormLoading = false;
        }
      });
    }
  }
};
</script>
