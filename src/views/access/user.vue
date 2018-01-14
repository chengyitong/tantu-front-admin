<template>
  <div>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="40" inline>
      <Form-item label="角色">
        <Select v-model="searchForm.role" filterable @on-change="getUserLists">
          <Option :value="-1" :key="-1">不限</Option>
          <Option :value="0" :key="0">超级管理员</Option>
          <Option :value="1" :key="1">普通管理员</Option>
          <Option :value="2" :key="2">客服</Option>
          <Option :value="3" :key="3">运维</Option>
        </Select>
      </Form-item>
      <Form-item label="昵称">
        <Input v-model="searchForm.nickname" placeholder="请输入用户昵称"></Input>
      </Form-item>
      <Form-item label="姓名">
        <Input v-model="searchForm.name" placeholder="请输入用户真实姓名"></Input>
      </Form-item>
      <Form-item label="状态">
        <Select v-model="searchForm.status" filterable @on-change="getUserLists">
          <Option :value="0" :key="0">不限</Option>
          <Option :value="1" :key="1">正常</Option>
          <Option :value="2" :key="2">禁用</Option>
        </Select>
      </Form-item>
      <Button type="primary" @click="getUserLists">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
      <Button type="success" @click="addUserModalVisible = true">
        <Icon type="plus" size="14"></Icon>&nbsp;新增
      </Button>
    </Form>

    <Table :columns="list_columns" :data="list"></Table>
    <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

    <!-- 新增用户弹框 -->
    <Modal v-model="addUserModalVisible" title="新增用户">
      <div slot="footer">
        <Button type="text" size="large" @click="addUserCancel('addUserForm')">取消</Button>
        <Button type="primary" size="large" :loading="addUserFormLoading" @click="addUser('addUserForm')">确定</Button>
      </div>
      <Form ref="addUserForm" :model="addUserForm" :rules="addUserFormRules" label-position="right" :label-width="80">
        <Form-item label="角色" prop="role">
          <Select v-model="addUserForm.role" filterable clearable size="large" placeholder="请选择用户角色">
            <Option :value="0" :key="0">超级管理员</Option>
            <Option :value="1" :key="1">普通管理员</Option>
            <Option :value="2" :key="2">客服</Option>
            <Option :value="3" :key="3">运维</Option>
          </Select>
        </Form-item>
        <Form-item label="姓名" prop="name">
          <Input v-model="addUserForm.name" placeholder="请输入用户真实姓名"></Input>
        </Form-item>
        <Form-item label="昵称" prop="nickname">
          <Input v-model="addUserForm.nickname" placeholder="请输入用户昵称，用于登录"></Input>
        </Form-item>
        <Form-item label="登录密码" prop="password">
          <Input type="password" v-model="addUserForm.password" placeholder="请输入登录密码"></Input>
        </Form-item>
        <Form-item label="状态" prop="status">
          <RadioGroup v-model="addUserForm.status">
            <Radio :label="1">正常</Radio>
            <Radio :label="2">禁用</Radio>
          </RadioGroup>
        </Form-item>
      </Form>
    </Modal>
    <!-- 编辑用户弹框 -->
    <Modal v-model="updateUserModalVisible" title="编辑用户">
      <div slot="footer">
        <Button type="text" size="large" @click="updateUserCancel('updateUserForm')">取消</Button>
        <Button type="primary" size="large" :loading="updateUserFormLoading" @click="updateUser('updateUserForm')">确定</Button>
      </div>
      <Form ref="updateUserForm" :model="updateUserForm" :rules="addUserFormRules" label-position="right" :label-width="80">
        <Form-item label="角色" prop="role">
          <Select v-model="updateUserForm.role" filterable clearable size="large" placeholder="请选择用户角色">
            <Option :value="0" :key="0">超级管理员</Option>
            <Option :value="1" :key="1">普通管理员</Option>
            <Option :value="2" :key="2">客服</Option>
            <Option :value="3" :key="3">运维</Option>
          </Select>
        </Form-item>
        <Form-item label="姓名" prop="name">
          <Input v-model="updateUserForm.name" placeholder="请输入用户真实姓名"></Input>
        </Form-item>
        <Form-item label="昵称" prop="nickname">
          <Input v-model="updateUserForm.nickname" placeholder="请输入用户昵称，用于登录"></Input>
        </Form-item>
        <Form-item label="状态" prop="status">
          <RadioGroup v-model="updateUserForm.status">
            <Radio :label="1">正常</Radio>
            <Radio :label="2">禁用</Radio>
          </RadioGroup>
        </Form-item>
      </Form>
    </Modal>

    <!-- 重置用户密码弹框 -->
    <Modal v-model="resetPasswordModalVisible" title="重置用户登录密码">
      <div slot="footer">
        <Button type="text" size="large" @click="resetPasswordCancel('resetPasswordForm')">取消</Button>
        <Button type="primary" size="large" :loading="resetPasswordFormLoading" @click="resetPassword('resetPasswordForm')">确定</Button>
      </div>
      <Form ref="resetPasswordForm" :model="resetPasswordForm" :rules="resetPasswordFormRules" label-position="right" :label-width="100">
        <Form-item label="新密码" prop="password">
          <Input v-model="resetPasswordForm.password" placeholder="请输入新密码"></Input>
        </Form-item>
        <Form-item label="确认新密码" prop="confirm_password">
          <Input v-model="resetPasswordForm.confirm_password" placeholder="请再次确认新密码"></Input>
        </Form-item>
      </Form>
    </Modal>
  </div>
</template>

<script>
export default {
  data() {
    const valideRePassword = (rule, value, callback) => {
      if (value !== this.resetPasswordForm.password) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    };
    return {
      searchForm: {
        page: 1,
        page_size: 10,
        nickname: null, // 用户名
        name: null, // 用户正式姓名
        status: 0, // 状态：0:不限；1:正常；2:禁用
        role: -1
      },
      addUserFormLoading: false,
      addUserModalVisible: false,
      addUserForm: {
        role: null,
        nickname: null,
        name: null,
        status: 1,
        password: null
      },
      addUserFormRules: {
        role: [
          {
            type: "number",
            required: true,
            message: "请选择用户角色",
            trigger: "change"
          }
        ],
        name: [{ required: true, message: "请输入用户真实姓名", trigger: "blur" }],
        nickname: [
          { required: true, message: "请输入用户昵称，用于登录", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入登录密码", trigger: "blur" }]
      },
      list: [],
      list_columns: [
        {
          type: "index",
          width: 50,
          align: "center"
        },
        {
          title: "角色",
          key: "roleName",
          sortable: true
        },
        {
          title: "昵称(登录帐号)",
          key: "nickname",
          sortable: true
        },
        {
          title: "姓名",
          key: "name",
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
        },
        {
          title: "操作",
          key: "action",
          width: 200,
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
                      this.updateUserModal(params.row);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "info",
                    size: "small"
                  },
                  style: {
                    marginLeft: "5px"
                  },
                  on: {
                    click: () => {
                      // this.show(params.index)
                      this.resetPasswordModal(params.row);
                    }
                  }
                },
                "修改密码"
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
      isShowPage: false,
      updateUserForm: {
        role: null,
        nickname: null,
        name: null,
        status: 1
      },
      updateUserModalVisible: false,
      updateUserFormLoading: false,
      resetPasswordForm: {
        id: null,
        password: null,
        confirm_password: null
      },
      resetPasswordModalVisible: false,
      resetPasswordFormLoading: false,
      resetPasswordFormRules: {
        password: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          { min: 6, message: "请至少输入6个字符", trigger: "blur" },
          { max: 32, message: "最多输入32个字符", trigger: "blur" }
        ],
        confirm_password: [
          { required: true, message: "请再次输入新密码", trigger: "blur" },
          { validator: valideRePassword, trigger: "blur" }
        ]
      }
    };
  },
  mounted: function() {
    this.$nextTick(function() {});
  },
  methods: {
    getUserLists() {
      this.list = [
        {
          id: 1,
          role: 1,
          roleName: "超级管理员",
          nickname: "yitong",
          name: "一通",
          status: 1
        }
      ];
    },
    // 翻页
    handlePageChange(cur_page) {
      this.searchForm.page = cur_page;
      this.getUserLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getUserLists();
    },
    // 取消新增
    addUserCancel(name) {
      this.addUserModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 新增用户
    addUser(addUserForm) {},
    // 点击“编辑”按钮
    updateUserModal(row) {
      let options = {
        id: row.id,
        role: row.role,
        nickname: row.nickname,
        name: row.name,
        status: row.status
      };
      this.updateUserForm = options;
      this.updateUserModalVisible = true;
    },
    // 取消编辑
    updateUserCancel(name) {
      this.updateUserModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 保存编辑结果
    updateUser(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.updateUserFormLoading = true;
          this.$axios
            .put("/admin/plinks/", this.updateUserForm)
            .then(res => {
              console.log(res);
              if (res.code == 0) {
                this.getUserLists();
                this.$Message.success("更新成功！");
                this.updateUserFormLoading = false;
                this.updateUserModalVisible = false;
              }
            })
            .catch(error => {
              this.updateUserFormLoading = false;
            });
        } else {
          this.updateUserFormLoading = false;
        }
      });
    },
    // 点击“修改密码”按钮
    resetPasswordModal(row) {
      this.resetPasswordModalVisible = true;
    },
    // 取消修改密码
    resetPasswordCancel(name) {
      this.resetPasswordModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 保存密码修改
    resetPassword(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.resetPasswordFormLoading = true;
          this.$axios
            .put("/admin/plinks/", this.resetPasswordForm)
            .then(res => {
              if (res.code == 0) {
                this.getUserLists();
                this.$Message.success("修改成功！");
                this.resetPasswordFormLoading = false;
                this.resetPasswordModalVisible = false;
              }
            })
            .catch(error => {
              this.resetPasswordFormLoading = false;
            });
        } else {
          this.resetPasswordFormLoading = false;
        }
      });
    }
  }
};
</script>
