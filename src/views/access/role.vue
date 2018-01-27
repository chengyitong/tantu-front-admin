<template>
  <div>
    <Button type="success" @click="addRoleModalVisible = true" style="margin-bottom: 10px;">
      <Icon type="plus" size="14"></Icon>&nbsp;新增
    </Button>

    <Table :columns="list_columns" :data="list"></Table>
    <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

    <!-- 新增角色弹框 -->
    <Modal v-model="addRoleModalVisible" title="新增角色">
      <div slot="footer">
        <Button type="text" size="large" @click="addRoleCancel('addRoleForm')">取消</Button>
        <Button type="primary" size="large" :loading="addRoleFormLoading" @click="addRole('addRoleForm')">确定</Button>
      </div>
      <Form ref="addRoleForm" :model="addRoleForm" :rules="addRoleFormRules" label-position="right" :label-width="80">
        <Form-item label="角色名称" prop="title">
          <Input v-model="addRoleForm.title" placeholder="请输入角色名称"></Input>
        </Form-item>
        <Form-item label="角色权限" prop="rules">
          一级菜单
          <!-- <Tree :data="baseData" show-checkbox></Tree> -->
        </Form-item>
      </Form>
    </Modal>
    <!-- 编辑角色弹框 -->
    <Modal v-model="updateRoleModalVisible" title="编辑角色">
      <div slot="footer">
        <Button type="text" size="large" @click="updateRoleCancel('updateRoleForm')">取消</Button>
        <Button type="primary" size="large" :loading="updateRoleFormLoading" @click="updateRole('updateRoleForm')">确定</Button>
      </div>
      <Form ref="updateRoleForm" :model="updateRoleForm" :rules="addRoleFormRules" label-position="right" :label-width="80">
        <Form-item label="角色名称" prop="title">
          <Input v-model="updateRoleForm.title" placeholder="请输入角色名称"></Input>
        </Form-item>
        <Form-item label="角色权限" prop="rules">
          <Input v-model="updateRoleForm.rules" placeholder="请输入角色权限，多个权限用英文逗号分隔"></Input>
          <!-- <Tree :data="baseData" show-checkbox></Tree> -->
        </Form-item>
        <Form-item label="状态" prop="status">
          <RadioGroup v-model="updateRoleForm.status">
            <Radio :label="0">禁用</Radio>
            <Radio :label="1">正常</Radio>
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
      addRoleFormLoading: false,
      addRoleModalVisible: false,
      addRoleForm: {
        title: null,
        rules: "0" // 用户组拥有的规则id，多个规则","隔开，
      },
      addRoleFormRules: {
        title: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
        rules: [{ required: true, message: "请输入选择角色权限", trigger: "blur" }]
      },
      list: [],
      list_columns: [
        {
          type: "index",
          width: 50,
          align: "center"
        },
        {
          title: "角色名称",
          key: "title",
          width: 180,
          render: (h, params) => {
            return h("span", params.row.title + "（ID：" + params.row.id + "）");
          }
        },
        {
          title: "角色权限",
          key: "rules",
          sortable: true
        },
        {
          title: "状态",
          key: "status",
          render: (h, params) => {
            let status_arr = ["禁用", "正常"];
            let type_arr = ["error", "success"];
            return h(
              "Button",
              {
                props: {
                  type: type_arr[params.row.status],
                  size: "small"
                }
              },
              status_arr[params.row.status]
            );
          }
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
                      // this.show(params.index)
                      this.updateRoleModal(params.row);
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
      baseData: [
        {
          expand: true,
          title: "parent 1",
          children: [
            {
              title: "parent 1-0",
              expand: true,
              disabled: true,
              children: [
                {
                  title: "leaf",
                  disableCheckbox: true
                },
                {
                  title: "leaf"
                }
              ]
            },
            {
              title: "parent 1-1",
              expand: true,
              checked: true,
              children: [
                {
                  title: '<span style="color: red">leaf</span>'
                }
              ]
            }
          ]
        }
      ],
      isShowPage: false,
      updateRoleForm: {
        id: null,
        title: null,
        rules: null,
        status: null
      },
      updateRoleModalVisible: false,
      updateRoleFormLoading: false
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getAdminGroup();
    });
  },
  methods: {
    getAdminGroup() {
      this.$axios.get("/admin/AdminGroup").then(res => {
        this.list = res.data.list;
      });
    },
    // 翻页
    handlePageChange(cur_page) {
      this.searchForm.page = cur_page;
      this.getAdminGroup();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getAdminGroup();
    },
    // 取消新增
    addRoleCancel(name) {
      this.addRoleModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 新增角色
    addRole(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.addRoleFormLoading = true;
          this.$axios.post("/admin/AdminGroup", this.addRoleForm).then(res => {
            this.addRoleFormLoading = false;
            this.$Message.success("添加成功");
            this.getAdminGroup();
            this.addRoleModalVisible = false;
            this.$refs[name].resetFields();
          });
        }
      });
    },
    // 点击“编辑”按钮
    updateRoleModal(row) {
      let options = {
        id: row.id,
        title: row.title,
        rules: row.rules,
        status: row.status
      };
      this.updateRoleForm = options;
      this.updateRoleModalVisible = true;
    },
    // 取消编辑
    updateRoleCancel(name) {
      this.updateRoleModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 保存编辑结果
    updateRole(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.updateRoleFormLoading = true;
          this.$axios
            .put(
              "/admin/AdminGroup/" + this.updateRoleForm.id,
              this.updateRoleForm
            )
            .then(res => {
              if (res.code == 0) {
                this.getAdminGroup();
                this.$Message.success("更新成功！");
                this.updateRoleFormLoading = false;
                this.updateRoleModalVisible = false;
              }
            })
            .catch(error => {
              this.updateRoleFormLoading = false;
            });
        }
      });
    }
  }
};
</script>
