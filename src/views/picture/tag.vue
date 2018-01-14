<template>
  <div>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="50" inline>
      <Form-item label="名称" prop="name">
        <Input v-model="searchForm.name" placeholder="请输入标签名称" @keyup.enter.native="getTagLists"></Input>
      </Form-item>
      <Form-item label="状态" prop="status">
        <Select v-model="searchForm.status" filterable clearable @on-change="getTagLists" style="width: 70px;">
          <Option :value="1" :key="1">正常</Option>
          <Option :value="2" :key="2">禁用</Option>
        </Select>
      </Form-item>
      <Button type="primary" @click="getTagLists">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
      <Button type="info" @click="$refs['searchForm'].resetFields();getTagLists();">
        <Icon type="reply" size="14"></Icon>&nbsp;重置
      </Button>
      <Button type="success" @click="addTagModalVisible = true">
        <Icon type="plus" size="14"></Icon>&nbsp;新增
      </Button>
    </Form>

    <Table :columns="list_columns" :data="list"></Table>
    <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

    <!-- 新增标签弹框 -->
    <Modal v-model="addTagModalVisible" title="新增标签">
      <div slot="footer">
        <Button type="text" size="large" @click="$refs['addTagForm'].resetFields();addTagModalVisible = false;">取消</Button>
        <Button type="primary" size="large" :loading="addTagFormLoading" @click="addTag('addTagForm')">确定</Button>
      </div>
      <Form ref="addTagForm" :model="addTagForm" :rules="addTagFormRules" label-position="right" :label-width="80">
        <Form-item label="所属分类" prop="category_id">
          <Select v-model="addTagForm.category_id" multiple>
            <Option v-for="item in category_ids" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        </Form-item>
        <Form-item label="名称" prop="name">
          <Input v-model="addTagForm.name" placeholder="请输入标签名称" size="large" @keyup.enter.native="addTag('addTagForm')"></Input>
        </Form-item>
        <Form-item label="状态" prop="status">
          <RadioGroup v-model="addTagForm.status">
            <Radio :label="1">正常</Radio>
            <Radio :label="2">禁用</Radio>
          </RadioGroup>
        </Form-item>
      </Form>
    </Modal>
    <!-- 更新标签弹框 -->
    <Modal v-model="updateTagModalVisible" title="更新标签">
      <div slot="footer">
        <Button type="text" size="large" @click="updateTagModalVisible = false">取消</Button>
        <Button type="primary" size="large" :loading="updateTagFormLoading" @click="updateTag('updateTagForm')">确定</Button>
      </div>
      <Form ref="updateTagForm" :model="updateTagForm" :rules="addTagFormRules" label-position="right" :label-width="80">
        <Form-item label="所属分类" prop="category_id">
          <Select v-model="updateTagForm.category_id" multiple>
            <Option v-for="item in category_ids" :value="item.id" :key="item.id">{{ item.name }}</Option>
          </Select>
        </Form-item>
        <Form-item label="名称" prop="name">
          <Input v-model="updateTagForm.name" placeholder="请输入标签名称" size="large" @keyup.enter.native="updateTag('updateTagForm')"></Input>
        </Form-item>
        <Form-item label="状态" prop="status">
          <RadioGroup v-model="updateTagForm.status">
            <Radio :label="1">正常</Radio>
            <Radio :label="2">禁用</Radio>
          </RadioGroup>
        </Form-item>
      </Form>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchForm: {
        page: 1,
        page_size: 10,
        name: null, // 名称
        status: 1 // 状态：1:正常；2:禁用
      },
      category_ids: [],
      isShowPage: false,
      list: [], // 标签列表
      list_columns: [
        {
          type: "index",
          width: 50,
          align: "center"
        },
        {
          title: "所属分类",
          key: "category_id",
          sortable: true
        },
        {
          title: "标签名称",
          key: "name",
          sortable: true
        },
        {
          title: "状态",
          key: "status",
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
        },
        {
          title: "添加时间",
          key: "create_time",
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
                      this.updateTagModal(params.row);
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
                        .delete("/admin/tag/" + params.row.id)
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
      addTagModalVisible: false,
      addTagForm: {
        name: "", // 名称
        status: 1, // 状态
        category_id: []
      },
      addTagFormRules: {
        category_id: [
          { type: "array", required: true, message: "请选择分类", trigger: "change" }
        ],
        name: [{ required: true, message: "请输入标签名称", trigger: "blur" }]
      },
      addTagFormLoading: false,
      updateTagModalVisible: false,
      updateTagForm: {
        id: "",
        name: "", // 名称
        status: 1, // 状态
        category_id: []
      },
      updateTagFormLoading: false
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getTagLists();
      this.getCategoryLists();
    });
  },
  methods: {
    // 获取分类列表用于新增图片标签
    getCategoryLists() {
      this.$axios.get("/admin/category").then(res => {
        this.category_ids = res.data.list;
      });
    },
    // 获取图片标签列表
    getTagLists() {
      let name = this.searchForm.name;
      name = name == null ? "" : this.$util.trim(name);
      this.$axios
        .get("/admin/tag", { params: this.searchForm })
        .then(res => {
          this.list = res.data.list;
          this.count = res.data.count;
          if (res.data.count > 0) {
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
      this.getTagLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getTagLists();
    },
    // 点击确定添加按钮
    addTag(name) {
      console.log(this.addTagForm);
      this.$refs[name].validate(valid => {
        if (valid) {
          this.addTagFormLoading = true;
          this.$axios
            .post("/admin/tag", this.addTagForm)
            .then(res => {
              if (res.code == 0) {
                this.getTagLists();
                this.$Message.success("添加成功！");
                this.$refs[name].resetFields();
                this.addTagFormLoading = false;
              }
            })
            .catch(error => {
              this.addTagFormLoading = false;
            });
        } else {
          this.addTagFormLoading = false;
        }
      });
    },
    // 点击“编辑”按钮
    updateTagModal(row) {
      let options = {
        id: row.id,
        name: row.name, // 名称
        status: row.status,
        category_id: row.category_id
      };
      this.updateTagForm = options;
      this.updateTagModalVisible = true;
    },
    // 保存编辑结果
    updateTag(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.updateTagFormLoading = true;
          this.$axios
            .put("/admin/tag/" + this.updateTagForm.id, this.updateTagForm)
            .then(res => {
              if (res.code == 0) {
                this.getTagLists();
                this.$Message.success("更新成功！");
                this.updateTagFormLoading = false;
                this.updateTagModalVisible = false;
              }
            })
            .catch(error => {
              this.updateTagFormLoading = false;
            });
        } else {
          this.updateTagFormLoading = false;
        }
      });
    }
  }
};
</script>
