<template>
  <div>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
      <Form-item label="用户ID" prop="a_9_id">
        <Input v-model="searchForm.a_9_id" placeholder="用户ID" @keyup.enter.native="searchForm.page=1;getUserLists()"></Input>
      </Form-item>
      <Form-item label="用户名" prop="a_9_account">
        <Input v-model="searchForm.a_9_account" placeholder="用户名" @keyup.enter.native="searchForm.page=1;getUserLists()"></Input>
      </Form-item>
      <Form-item label="昵称" prop="a_9_nickname">
        <Input v-model="searchForm.a_9_nickname" placeholder="昵称" @keyup.enter.native="searchForm.page=1;getUserLists()"></Input>
      </Form-item>
      <Form-item label="手机号码" prop="mobile_9_num">
        <Input v-model="searchForm.mobile_9_num" placeholder="手机号码" @keyup.enter.native="searchForm.page=1;getUserLists()"></Input>
      </Form-item>
      <Form-item label="邮箱" prop="email_9_account">
        <Input v-model="searchForm.email_9_account" placeholder="邮箱" @keyup.enter.native="searchForm.page=1;getUserLists()"></Input>
      </Form-item>
      <Form-item label="是否推荐" prop="a_9_is_recommend">
        <Select v-model="searchForm.a_9_is_recommend" placeholder="默认全部" @on-change="searchForm.page=1;getUserLists()" style="width: 141px;">
          <Option :value="0" :key="0">不推荐</Option>
          <Option :value="1" :key="1">推荐</Option>
        </Select>
      </Form-item>
      <Form-item label="账号状态" prop="a_9_status">
        <Select v-model="searchForm.a_9_status" placeholder="默认全部" @on-change="searchForm.page=1;getUserLists()" style="width: 141px;">
          <Option :value="1" :key="1">正常</Option>
          <Option :value="2" :key="2">普通禁用</Option>
          <Option :value="3" :key="3">永久封号</Option>
        </Select>
      </Form-item>
      <Form-item label="认证状态" prop="cert_9_status">
        <Select v-model="searchForm.cert_9_status" clearable placeholder="默认全部" @on-change="searchForm.page=1;getUserLists()" style="width: 141px;">
          <Option :value="1" :key="1">未认证</Option>
          <Option :value="2" :key="2">认证中</Option>
          <Option :value="3" :key="3">已认证</Option>
          <Option :value="4" :key="4">认证失败</Option>
        </Select>
      </Form-item>
      <Form-item label="注册时间" prop="a_9_create_time">
        <DatePicker type="daterange" v-model="searchForm.a_9_create_time" :options="datePickerOptions" placeholder="请选择注册时间周期" style="width: 180px" @on-change="searchForm.a_9_create_time=$event"></DatePicker>
      </Form-item>
      <Button type="primary" @click="searchForm.page=1;getUserLists()">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
      <Button type="info" @click="$refs['searchForm'].resetFields()">
        <Icon type="reply" size="14"></Icon>&nbsp;重置
      </Button>
      <Button type="success" @click="addUserModalVisible = true">
        <Icon type="plus" size="14"></Icon>&nbsp;添加用户
      </Button>
    </Form>
    <div style="margin-bottom: 10px;">
      <Button v-show="searchForm.a_9_is_recommend == 0" @click="userRecommends">批量推荐</Button>
      <Button v-show="searchForm.a_9_is_recommend == 1" @click="userCancelRecommends">取消推荐</Button>
    </div>
    <Table ref="selection" :loading="table_loading" @on-selection-change="handleSelectionChange" :columns="list_columns" :data="list"></Table>
    <Page v-if="count > 0" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

    <!-- 添加用户弹框 -->
    <Modal v-model="addUserModalVisible" title="添加用户">
      <div slot="footer">
        <Button type="text" size="large" @click="addUserCancel('addUserForm')">取消</Button>
        <Button type="primary" size="large" :loading="addUserFormLoading" @click="addUser('addUserForm')">确定</Button>
      </div>
      <Form ref="addUserForm" :model="addUserForm" :rules="addUserFormRules" label-position="right" :label-width="80">
        <Form-item label="手机号码" prop="mobile_num">
          <Input v-model="addUserForm.mobile_num" placeholder="请输入手机号码，可用于登录"></Input>
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

    <!-- 修改用户状态弹框 -->
    <Modal v-model="updateStatusModalVisible" title="修改用户状态">
      <div slot="footer">
        <Button type="text" size="large" @click="updateStatusCancel('updateStatusForm')">取消</Button>
        <Button type="primary" size="large" :loading="updateStatusFormLoading" @click="updateStatus('updateStatusForm')">确定</Button>
      </div>
      <Form ref="updateStatusForm" :model="updateStatusForm" label-position="right" :label-width="100">
        <Form-item label="状态" prop="status">
          <RadioGroup v-model="updateStatusForm.status">
            <Radio :label="1">正常</Radio>
            <Radio :label="2">禁用</Radio>
            <Radio :label="3">永久封号</Radio>
          </RadioGroup>
        </Form-item>
        <Form-item v-if="updateStatusForm.status != 1" label="禁用/封号的原因" prop="reason">
          <Input v-model="updateStatusForm.reason" placeholder="禁用/封号的原因"></Input>
          <small v-if="updateStatusForm.status == 3">永久封号之后，不可解封！</small>
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
          <Input type="password" v-model="resetPasswordForm.password" placeholder="请输入新密码"></Input>
        </Form-item>
        <Form-item label="确认新密码" prop="confirm_password">
          <Input type="password" v-model="resetPasswordForm.confirm_password" placeholder="请再次确认新密码"></Input>
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
        callback(new Error("请输入正确格式的手机号码"));
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
        a_9_id: null, // 用户ID
        a_9_account: null, // 用户名
        a_9_nickname: null, // 用户昵称
        a_9_is_recommend: 0, // 是否推荐 0-否；1-是
        a_9_status: 1, // 账号状态：1:正常；2:普通禁用；3:永久封号
        a_9_create_time: [], //注册时间段，数组
        mobile_9_num: null, //手机号码
        email_9_account: null, //邮箱账号
        cert_9_status: null // 认证状态: 1:未认证；2:认证中；3:已认证；4:认证失败
      },
      table_loading: false,
      user_ids: [], // 批量推荐或取消推荐的用户ID
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
        nickname: null, // 昵称，必填,account: null, // 账号，不传则默认为昵称
        password: null, // 密码md5 必填
        mobile_num: null, // 手机号码
        email_account: null // 邮箱账号
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
          type: "selection",
          fixed: "left",
          width: 60,
          align: "center"
        },
        {
          title: "昵称",
          key: "nickname",
          width: 120,
          fixed: "left",
          align: "center",
          render: (h, params) => {
            return h("span", [
              h("p", params.row.nickname),
              h("p", "ID:" + params.row.id)
            ]);
          }
        },
        {
          title: "用户名",
          key: "account",
          width: 120,
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
          title: "手机号码",
          key: "mobile_9_num",
          width: 160,
          align: "center",
          sortable: true,
          render: (h, params) => {
            let mobile = params.row.mobile;
            if (!mobile || !mobile.num) return false;
            let is_verified = mobile.is_verified; // 0:未验证；1:已验证
            let is_secrecy = mobile.is_secrecy; // 0:保密；1:不保密
            let is_verified_str = "";
            let is_verified_color = "";
            let is_secrecy_str = "";
            let is_secrecy_color = "";
            switch (is_verified) {
              case 0:
                is_verified_str = "未验证";
                is_verified_color = "yellow";
                break;
              case 1:
                is_verified_str = "已验证";
                is_verified_color = "green";
                break;
            }
            switch (is_secrecy) {
              case 0:
                is_secrecy_str = "保密";
                is_secrecy_color = "green";
                break;
              case 1:
                is_secrecy_str = "不保密";
                is_secrecy_color = "yellow";
                break;
            }
            return h("span", [
              h("span", mobile.num),
              h(
                "Tag",
                {
                  props: {
                    color: is_verified_color,
                    size: "small"
                  }
                },
                is_verified_str
              ),
              h(
                "Tag",
                {
                  props: {
                    color: is_secrecy_color,
                    size: "small"
                  }
                },
                is_secrecy_str
              )
            ]);
          }
        },
        {
          title: "邮箱",
          key: "email",
          width: 180,
          align: "center",
          sortable: true,
          render: (h, params) => {
            let email = params.row.email;
            if (!email || !email.account) return false;
            let is_verified = email.is_verified; // 0:未验证；1:已验证
            let is_secrecy = email.is_secrecy; // 0:保密；1:不保密
            let is_verified_str = "";
            let is_verified_color = "";
            let is_secrecy_str = "";
            let is_secrecy_color = "";
            switch (is_verified) {
              case 0:
                is_verified_str = "未验证";
                is_verified_color = "yellow";
                break;
              case 1:
                is_verified_str = "已验证";
                is_verified_color = "green";
                break;
            }
            switch (is_secrecy) {
              case 0:
                is_secrecy_str = "保密";
                is_secrecy_color = "green";
                break;
              case 1:
                is_secrecy_str = "不保密";
                is_secrecy_color = "yellow";
                break;
            }
            return h("span", [
              h("span", email.account),
              h(
                "Tag",
                {
                  props: {
                    color: is_verified_color,
                    size: "small"
                  }
                },
                is_verified_str
              ),
              h(
                "Tag",
                {
                  props: {
                    color: is_secrecy_color,
                    size: "small"
                  }
                },
                is_secrecy_str
              )
            ]);
          }
        },
        {
          title: "QQ号",
          key: "qq",
          width: 120,
          sortable: true,
          render: (h, params) => {
            let qq = params.row.qq;
            if (!qq || !qq.account) return false;
            let is_secrecy = qq.is_secrecy; // 0:保密；1:不保密
            let is_secrecy_str = "";
            let is_secrecy_color = "";
            switch (is_secrecy) {
              case 0:
                is_secrecy_str = "保密";
                is_secrecy_color = "green";
                break;
              case 1:
                is_secrecy_str = "不保密";
                is_secrecy_color = "yellow";
                break;
            }
            return h("span", [
              h("p", qq.account),
              h(
                "Tag",
                {
                  props: {
                    color: is_secrecy_color,
                    size: "small"
                  }
                },
                is_secrecy_str
              )
            ]);
          }
        },
        {
          title: "微信号",
          key: "weixin",
          width: 120,
          sortable: true,
          render: (h, params) => {
            let weixin = params.row.weixin;
            if (!weixin || !weixin.account) return false;
            let is_secrecy = weixin.is_secrecy; // 0:保密；1:不保密
            let is_secrecy_str = "";
            let is_secrecy_color = "";
            switch (is_secrecy) {
              case 0:
                is_secrecy_str = "保密";
                is_secrecy_color = "green";
                break;
              case 1:
                is_secrecy_str = "不保密";
                is_secrecy_color = "yellow";
                break;
            }
            return h("span", [
              h("span", weixin.account),
              h(
                "Tag",
                {
                  props: {
                    color: is_secrecy_color,
                    size: "small"
                  }
                },
                is_secrecy_str
              )
            ]);
          }
        },
        {
          title: "关注用户数",
          key: "statistic.follows",
          width: 120,
          align: "center",
          sortable: true,
          render: (h, params) => {
            if (!params.row.statistic) return false;
            return h("span", params.row.statistic.follows);
          }
        },
        {
          title: "拥有粉丝数",
          key: "statistic.fans",
          width: 120,
          align: "center",
          sortable: true,
          render: (h, params) => {
            if (!params.row.statistic) return false;
            return h("span", params.row.statistic.fans);
          }
        },
        {
          title: "总作品数",
          key: "statistic.products",
          width: 120,
          align: "center",
          sortable: true,
          render: (h, params) => {
            if (!params.row.statistic) return false;
            return h("span", params.row.statistic.products);
          }
        },
        {
          title: "上次登录时间",
          key: "login_time",
          width: 160,
          sortable: true
        },
        {
          title: "注册时间",
          key: "create_time",
          width: 160,
          align: "center",
          sortable: true
        },
        {
          title: "其他信息",
          key: "其他信息",
          width: 110,
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: "其他信息",
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
                  "其他信息"
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
          title: "账号绑定",
          key: "账号绑定",
          width: 110,
          render: (h, params) => {
            let qq = params.row.qq;
            let weixin = params.row.weixin;
            let qq_str = "未绑定";
            let weixin_str = "未绑定";

            if (qq)
              qq_str = "昵称（" + qq.nickname + "）；openid（" + qq.openid + "）";
            if (weixin)
              weixin_str =
                "昵称（" + weixin.nickname + "）；openid（" + weixin.openid + "）";

            return h(
              "Poptip",
              {
                props: {
                  content: "账号绑定",
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
                      color: "yellow",
                      size: "small"
                    }
                  },
                  "账号绑定"
                ),
                h(
                  "div",
                  {
                    slot: "content"
                  },
                  [h("p", "QQ：" + qq_str), h("p", "微信：" + weixin_str)]
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
            let status = 1;
            if (cert != null) status = cert.status;
            let status_str = ""; // 认证状态：1：未认证，2：认证中，3：通过认证，4不通过（驳回）
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
            let reason = params.row.reason || "--";
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
                      this.resetPasswordModal(params.row);
                    }
                  }
                },
                "重置密码"
              )
              // h(
              //   "Poptip",
              //   {
              //     props: {
              //       confirm: true,
              //       title: "您确定要删除这条数据吗?",
              //       transfer: true,
              //       placement: "top-end"
              //     },
              //     on: {
              //       "on-ok": () => {
              //         currentRow.isDeleting = true;
              //         this.list.splice(params.index, 1);
              //       }
              //     }
              //   },
              //   [
              //     h(
              //       "Button",
              //       {
              //         props: {
              //           type: "error",
              //           size: "small",
              //           placement: "top",
              //           loading: currentRow.isDeleting
              //         },
              //         style: {
              //           margin: "0 5px"
              //         }
              //       },
              //       "删除"
              //     )
              //   ]
              // )
            ]);
          }
        }
      ],
      count: 0, // 总数据条数
      isShowPage: false,
      // 修改用户状态
      updateStatusForm: {
        id: "",
        status: 1,
        reason: ""
      },
      updateStatusModalVisible: false,
      updateStatusFormLoading: false,
      // 重置密码
      resetPasswordForm: {
        id: "",
        password: "",
        confirm_password: ""
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
    this.$nextTick(function() {
      this.getUserLists();
    });
  },
  methods: {
    // 全选或取消用户列表
    handleSelectionChange(selection) {
      let user_ids = [];
      for (let i in selection) {
        user_ids.push(selection[i].id);
      }
      this.user_ids = user_ids;
    },
    // 批量推荐
    userRecommends() {
      if (this.user_ids.length == 0) {
        this.$Message.warning("请选择需要推荐的用户");
        return false;
      }
      this.$axios
        .get("/admin/user/recommends", { params: { ids: this.user_ids } })
        .then(res => {
          this.getUserLists();
          this.$Message.success("推荐成功");
        });
    },
    // 批量取消推荐
    userCancelRecommends() {
      if (this.user_ids.length == 0) {
        this.$Message.warning("请选择需要取消推荐的用户");
        return false;
      }
      this.$axios
        .get("/admin/user/cancel_recommends", {
          params: { ids: this.user_ids }
        })
        .then(res => {
          this.getUserLists();
          this.$Message.success("取消成功");
        });
    },
    // 获取用户列表
    getUserLists() {
      let params = this.$util.deleteEmptyObj(this.searchForm);
      this.table_loading = true;
      this.$axios.get("/admin/user", { params }).then(res => {
        this.list = res.data.list;
        this.count = res.data.count;
        this.table_loading = false;
      });
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
    // 取消添加
    addUserCancel(name) {
      this.addUserModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 添加用户
    addUser(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.addUserFormLoading = true;
          this.addUserForm.password = md5(this.addUserForm.password);
          this.$axios
            .post("/admin/user/", this.addUserForm)
            .then(res => {
              if (res.code == 0) {
                this.$refs[name].resetFields();
                this.getUserLists();
                this.$Message.success("添加成功！");
                this.addUserFormLoading = false;
                this.addUserModalVisible = false;
              }
            })
            .catch(error => {
              this.$refs[name].resetFields();
              this.addUserFormLoading = false;
            });
        } else {
          this.addUserFormLoading = false;
        }
      });
    },
    // 点击修改状态按钮
    updateStatusModal(row) {
      this.updateStatusModalVisible = true;
      let options = {
        id: row.id,
        status: row.status,
        reason: row.reason
      };
      this.updateStatusForm = options;
    },
    // 取消修改状态
    updateStatusCancel(name) {
      this.updateStatusModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 点击“修改密码”按钮
    resetPasswordModal(row) {
      this.resetPasswordForm.id = row.id;
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
            .put("/admin/user/reset_password/" + this.resetPasswordForm.id, {
              password: md5(this.resetPasswordForm.password)
            })
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
