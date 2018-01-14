<template>
  <div>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="50" inline>
      <Form-item label="名称" prop="name">
        <Input v-model="searchForm.name" placeholder="请输入分类名称" @keyup.enter.native="getCategoryLists"></Input>
      </Form-item>
      <Form-item label="状态" prop="status">
        <Select v-model="searchForm.status" filterable clearable @on-change="getCategoryLists" style="width: 70px;">
          <Option :value="1" :key="1">正常</Option>
          <Option :value="2" :key="2">禁用</Option>
        </Select>
      </Form-item>
      <Button type="primary" @click="getCategoryLists">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
      <Button type="info" @click="$refs['searchForm'].resetFields();getCategoryLists()">
        <Icon type="reply" size="14"></Icon>&nbsp;重置
      </Button>
      <Button type="success" @click="addCategoryModalVisible = true">
        <Icon type="plus" size="14"></Icon>&nbsp;新增
      </Button>
    </Form>

    <Table :columns="list_columns" :data="list"></Table>
    <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

    <!-- 新增分类弹框 -->
    <Modal v-model="addCategoryModalVisible" title="新增分类">
      <div slot="footer">
        <Button type="text" size="large" @click="$refs['addCategoryForm'].resetFields();addCategoryModalVisible = false;">取消</Button>
        <Button type="primary" size="large" :loading="addCategoryFormLoading" @click="addCategory('addCategoryForm')">确定</Button>
      </div>
      <Form ref="addCategoryForm" :model="addCategoryForm" :rules="addCategoryFormRules" label-position="right" :label-width="80">
        <Form-item label="名称" prop="name">
          <Input v-model="addCategoryForm.name" placeholder="请输入分类名称" size="large" @keyup.enter.native="addCategory('addCategoryForm')"></Input>
        </Form-item>
        <Form-item label="状态" prop="status">
          <RadioGroup v-model="addCategoryForm.status">
            <Radio :label="1">正常</Radio>
            <Radio :label="2">禁用</Radio>
          </RadioGroup>
        </Form-item>
      </Form>
    </Modal>
    <!-- 更新分类弹框 -->
    <Modal v-model="updateCategoryModalVisible" title="更新分类">
      <div slot="footer">
        <Button type="text" size="large" @click="updateCategoryModalVisible = false">取消</Button>
        <Button type="primary" size="large" :loading="updateCategoryFormLoading" @click="updateCategory('updateCategoryForm')">确定</Button>
      </div>
      <Form ref="updateCategoryForm" :model="updateCategoryForm" :rules="addCategoryFormRules" label-position="right" :label-width="80">
        <Form-item label="名称" prop="name">
          <Input v-model="updateCategoryForm.name" placeholder="请输入分类名称" size="large" @keyup.enter.native="updateCategory('updateCategoryForm')"></Input>
        </Form-item>
        <Form-item label="状态" prop="status">
          <RadioGroup v-model="updateCategoryForm.status">
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
        status: null // 状态：1:正常；2:禁用
      },
      isShowPage: false,
      list: [], // 分类列表
      list_columns: [
        {
          type: "index",
          width: 50,
          align: "center"
        },
        {
          title: "排序",
          key: "sortnum",
          width: 100,
          align: "center",
          sortable: true
        },
        {
          title: "分类名称",
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
                      this.updateCategoryModal(params.row);
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
                        .delete("/admin/category/" + params.row.id)
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
      addCategoryModalVisible: false,
      addCategoryForm: {
        name: "", // 名称
        status: 1 // 状态
      },
      addCategoryFormRules: {
        name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
        sortnum: [
          {
            type: "number",
            required: true,
            message: "请输入分类排序",
            trigger: "blur"
          }
        ]
      },
      addCategoryFormLoading: false,
      updateCategoryModalVisible: false,
      updateCategoryForm: {
        id: "",
        name: "", // 名称
        status: 1 // 状态
      },
      updateCategoryFormLoading: false
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getCategoryLists();
    });
  },
  methods: {
    // 获取图片分类列表
    getCategoryLists() {
      let name = this.searchForm.name;
      name = name == null ? "" : this.$util.trim(name);
      this.$axios
        .get("/admin/category", { params: this.searchForm })
        .then(res => {
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
      this.getCategoryLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getCategoryLists();
    },
    // 点击确定添加按钮
    addCategory(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.addCategoryFormLoading = true;
          this.$axios
            .post("/admin/category", this.addCategoryForm)
            .then(res => {
              if (res.code == 0) {
                this.getCategoryLists();
                this.$Message.success("添加成功！");
                this.$refs[name].resetFields();
                this.addCategoryFormLoading = false;
              }
            })
            .catch(error => {
              this.addCategoryFormLoading = false;
            });
        } else {
          this.addCategoryFormLoading = false;
        }
      });
    },
    // 点击“编辑”按钮
    updateCategoryModal(row) {
      let options = {
        id: row.id,
        name: row.name, // 名称
        status: row.status
      };
      this.updateCategoryForm = options;
      this.updateCategoryModalVisible = true;
    },
    // 保存编辑结果
    updateCategory(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.updateCategoryFormLoading = true;
          this.$axios
            .put(
              "/admin/category/" + this.updateCategoryForm.id,
              this.updateCategoryForm
            )
            .then(res => {
              if (res.code == 0) {
                this.getCategoryLists();
                this.$Message.success("更新成功！");
                this.updateCategoryFormLoading = false;
                this.updateCategoryModalVisible = false;
              }
            })
            .catch(error => {
              this.updateCategoryFormLoading = false;
            });
        } else {
          this.updateCategoryFormLoading = false;
        }
      });
    }
  }
};
</script>
