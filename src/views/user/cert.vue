<template>
    <div>
        <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
            <Form-item label="认证ID" prop="id">
                <Input v-model="searchForm.id" placeholder="认证资料ID" @keyup.enter.native="getUserCertLists"></Input>
            </Form-item>
            <Form-item label="用户ID" prop="user_id">
                <Input v-model="searchForm.user_id" placeholder="用户ID" @keyup.enter.native="getUserCertLists"></Input>
            </Form-item>
            <Form-item label="认证类型" prop="type">
                <Select v-model="searchForm.type" filterable clearable placeholder="默认全部" @on-change="getUserCertLists" style="width: 141px;">
                    <Option :value="1" :key="1">个人</Option>
                    <Option :value="2" :key="2">机构/企业</Option>
                </Select>
            </Form-item>
            <Form-item label="认证状态" prop="status">
                <Select v-model="searchForm.status" filterable clearable placeholder="默认全部" @on-change="getUserCertLists" style="width: 141px;">
                    <Option :value="1" :key="1">未认证</Option>
                    <Option :value="2" :key="2">认证中</Option>
                    <Option :value="3" :key="3">已认证</Option>
                    <Option :value="4" :key="4">认证失败</Option>
                </Select>
            </Form-item>
            <Button type="primary" @click="getUserCertLists">
                <Icon type="search" size="14"></Icon>&nbsp;查询
            </Button>
            <Button type="info" @click="$refs['searchForm'].resetFields()">
                <Icon type="reply" size="14"></Icon>&nbsp;重置
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>
        <Page v-if="count > 0" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

        <!-- 添加用户弹框 -->
        <Modal v-model="addUserModalVisible" title="添加用户">
            <div slot="footer">
                <Button type="text" size="large" @click="addUserCancel('addUserForm')">取消</Button>
                <Button type="primary" size="large" :loading="addUserFormLoading" @click="addUser('addUserForm')">确定</Button>
            </div>
            <Form ref="addUserForm" :model="addUserForm" :rules="addUserFormRules" label-position="right" :label-width="80">
                <Form-item label="手机号" prop="mobile_num">
                    <Input v-model="addUserForm.mobile_num" placeholder="请输入手机号，可用于登录"></Input>
                </Form-item>
                <Form-item label="昵称" prop="nickname">
                    <Input v-model="addUserForm.nickname" placeholder="请输入用户昵称，用于展示在前端"></Input>
                </Form-item>
                <Form-item label="邮箱" prop="email_account">
                    <Input v-model="addUserForm.email_account" placeholder="请输入邮箱，可用于登录"></Input>
                </Form-item>
                <Form-item label="登录密码" prop="password">
                    <Input type="password" v-model="addUserForm.password" placeholder="请输入登录密码，默认密码六个8"></Input>
                </Form-item>
            </Form>
        </Modal>

        <!-- 审核弹框 -->
        <Modal v-model="updateStatusModalVisible" title="审核用户认证申请">
            <div slot="footer">
                <Button type="text" size="large" @click="updateStatusCancel('updateStatusForm')">取消</Button>
                <Button type="primary" size="large" :loading="updateStatusFormLoading" @click="updateStatus('updateStatusForm')">确定</Button>
            </div>
            <Form ref="updateStatusForm" :model="updateStatusForm" label-position="right" :label-width="100">
                <Form-item label="审核结果" prop="status">
                    <RadioGroup v-model="updateStatusForm.status">
                        <Radio :label="3">通过</Radio>
                        <Radio :label="4">驳回</Radio>
                    </RadioGroup>
                </Form-item>
                <Form-item v-if="updateStatusForm.status == 4" label="驳回的原因" prop="result">
                    <Input v-model="updateStatusForm.result" placeholder="驳回的原因"></Input>
                </Form-item>
            </Form>
        </Modal>
    </div>
</template>

<script>
import md5 from "md5";
export default {
  data() {
    const validePhone = (rule, value, callback) => {
      var re = /^1[0-9]{10}$/;
      if (!re.test(value)) {
        callback(new Error("请输入正确格式的手机号"));
      } else {
        callback();
      }
    };
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
        id: "", // 认证资料ID
        user_id: "", // 用户ID
        type: 1, // 认证类型：1-个人；2-机构/企业
        status: "" // 认证状态: 1:未认证；2:认证中；3:已认证；4:认证失败
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
      addUserFormLoading: false,
      addUserModalVisible: false,
      addUserForm: {
        nickname: "", // 昵称，必填,account: null, // 账号，不传则默认为昵称
        password: "", // 密码md5 必填
        mobile_num: "", // 手机号
        email_account: "" // 邮箱账号
      },
      addUserFormRules: {
        mobile_num: [
          { required: true, message: "请输入手机号码" },
          { validator: validePhone }
        ],
        nickname: [
          { required: true, message: "请输入用户昵称，用于展示在前端", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入登录密码", trigger: "blur" }]
      },
      list: [],
      list_columns: [
        {
          title: "认证类型",
          key: "type",
          width: 120,
          align: "center",
          sortable: true
        },
        {
          title: "头像",
          key: "avatar",
          sortable: true,
          width: 100,
          align: "center",
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: "缩略图",
                  trigger: "hover",
                  transfer: true,
                  placement: "right"
                }
              },
              [
                h("img", {
                  domProps: {
                    src: params.row.avatar,
                    alt: params.row.nickname,
                    title: params.row.nickname
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
          title: "申请认证时间",
          key: "create_at",
          width: 160,
          sortable: true
        },
        {
          title: "审核时间",
          key: "create_at",
          width: 160,
          sortable: true
        },
        {
          title: "认证资料",
          key: "认证资料",
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: "认证资料",
                  trigger: "hover",
                  transfer: true,
                  placement: "left"
                }
              },
              [
                h(
                  "Tag",
                  {
                    props: {
                      color: "green",
                      size: "small"
                    }
                  },
                  "认证资料"
                ),
                h(
                  "div",
                  {
                    slot: "content"
                  },
                  [
                    h("p", "出生日期：" + params.row.birth),
                    h("p", "学校：" + params.row.school),
                    h("p", "所在地：" + params.row.address),
                    h("p", "职业：" + params.row.occupation),
                    h("p", "空间签名：" + params.row.signature),
                    h("p", "自我介绍：" + params.row.introduce),
                    h("p", "摄影装备：" + params.row.equip)
                  ]
                )
              ]
            );
          }
        },
        {
          title: "认证状态",
          key: "cert",
          width: 110,
          render: (h, params) => {
            let cert = params.row.cert;
            let status = cert.status;
            let status_str = "";
            let status_color = "";
            switch (status) {
              case 1:
                status_str = "未认证";
                status_color = "blue";
                break;
              case 2:
                status_str = "认证中";
                status_color = "yellow";
                break;
              case 3:
                status_str = "已认证";
                status_color = "green";
                break;
              case 4:
                status_str = "认证失败";
                status_color = "red";
                break;
            }

            return h(
              "Tag",
              {
                props: {
                  color: status_color,
                  size: "small"
                }
              },
              status_str
            );
          }
        },
        {
          title: "账号状态",
          key: "status",
          width: 110,
          sortable: true,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            let status = params.row.status;
            let reason = params.row.reason;
            let _str = "";
            let _type = "";
            let _content = "";
            switch (status) {
              case 1:
                _str = "正常";
                _type = "success";
                _content = "点击按钮禁用或封号！";
                break;
              case 2:
                _str = "已禁用";
                _type = "warning";
                _content = "禁用的原因：" + reason + "；点击按钮解除禁用！";
                break;
              case 3:
                _str = "已封号";
                _type = "error";
                _content = "永久封号的原因：" + reason + "；永久封号后不可解封！";
                break;
            }
            return h(
              "Poptip",
              {
                props: {
                  content: _content,
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
                      type: _type,
                      size: "small"
                    },
                    on: {
                      click: () => {
                        // this.productCountModal(params.row);
                        // TODO：进行账号状态修改
                        // this.updateStatusModal(params.row);
                      }
                    }
                  },
                  _str
                )
              ]
            );
          }
        },
        {
          title: "操作",
          key: "action",
          fixed: "right",
          width: 160,
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
                  style: {
                    marginLeft: "5px"
                  },
                  on: {
                    click: () => {
                      // this.show(params.index)
                    }
                  }
                },
                "审核"
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
      count: 0, // 总数据条数
      isShowPage: false,
      // 审核用户认证资料
      updateStatusForm: {
        id: "", // 认证申请id
        status: 3, // 认证状态：3-通过；4-驳回
        result: "" // 驳回原因
      },
      updateStatusModalVisible: true,
      updateStatusFormLoading: false
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getUserCertLists();
    });
  },
  methods: {
    // 获取用户认证列表
    getUserCertLists() {
      this.$axios
        .get("/admin/user_cert", { params: this.searchForm })
        .then(res => {
          this.list = res.data.list;
          this.count = res.data.count;
        });
    },
    // 翻页
    handlePageChange(cur_page) {
      this.searchForm.page = cur_page;
      this.getUserCertLists();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getUserCertLists();
    },
    // 点击审核按钮
    updateStatusModal(row) {
      this.updateStatusModalVisible = true;
      let options = {
        id: row.id,
        status: row.status,
        reason: row.reason
      };
      this.updateStatusForm = options;
    },
    // 取消审核
    updateStatusCancel(name) {
      this.updateStatusModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 提交审核结构
    updateStatus(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.addUserFormLoading = true;
          this.$axios
            .put("/admin/user/", { params: this.updateStatusForm })
            .then(res => {
              if (res.code == 0) {
                this.$refs[name].resetFields();
                this.getUserLists();
                this.$Message.success("添加成功！");
                this.updateStatusFormLoading = false;
                this.updateStatusModalVisible = false;
              }
            })
            .catch(error => {
              this.$refs[name].resetFields();
              this.updateStatusFormLoading = false;
            });
        } else {
          this.updateStatusFormLoading = false;
        }
      });
    }
  }
};
</script>
