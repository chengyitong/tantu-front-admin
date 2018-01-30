<template>
    <div>
        <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
            <Form-item label="活动类型">
                <Select v-model="searchForm.event_type" filterable @on-change="getEventList(0);" style="width: 100px;">
                    <Option :value="0" :key="0">赛事</Option>
                    <Option :value="1" :key="1">任务</Option>
                    <!-- <Option :value="2" :key="2">第三方推广</Option> -->
                </Select>
            </Form-item>
            <Form-item label="活动名称">
                <Select v-model="searchForm.event_id" @on-change="getPlinks" filterable clearable style="width: 280px">
                    <Option v-for="item in event_ids" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </Form-item>
            <Form-item label="链接名称">
                <Input v-model="searchForm.name" placeholder="请输入推广链接名称" @keyup.enter.native="getPlinks"></Input>
            </Form-item>
            <Form-item label="链接状态">
                <Select v-model="searchForm.status" filterable clearable @on-change="getPlinks" style="width: 70px;">
                    <Option :value="1" :key="1">正常</Option>
                    <Option :value="2" :key="2">禁用</Option>
                </Select>
            </Form-item>
            <Button type="primary" @click="getPlinks">
                <Icon type="search" size="14"></Icon>&nbsp;查询
            </Button>
            <Button type="success" @click="addPlinksModalVisible = true;getEventList(1)">
                <Icon type="plus" size="14"></Icon>&nbsp;新增
            </Button>
        </Form>

        <Table :columns="list_columns" :data="list"></Table>
        <Page v-if="isShowPage" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

        <!-- 新增推广链接弹框 -->
        <Modal v-model="addPlinksModalVisible" title="新增推广链接" width="800">
            <div slot="footer">
                <Button type="text" size="large" @click="addPlinksCancel('addPlinksForm')">取消</Button>
                <Button type="primary" size="large" :loading="addPlinksFormLoading" @click="addPlinks('addPlinksForm')">确定</Button>
            </div>
            <Form ref="addPlinksForm" :model="addPlinksForm" :rules="addPlinksFormRules" label-position="right" :label-width="80">
                <Form-item label="活动类型" prop="event_type">
                    <RadioGroup v-model="addPlinksForm.event_type" @on-change="getEventList(1)">
                        <Radio :label="0">赛事</Radio>
                        <Radio :label="1">任务</Radio>
                        <!-- <Radio :label="2">第三方推广</Radio> -->
                    </RadioGroup>
                </Form-item>
                <Form-item label="活动名称" prop="event_id">
                    <Select v-model="addPlinksForm.event_id" filterable clearable size="large" placeholder="请选择需要推广的活动">
                        <Option v-for="item in event_ids" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </Form-item>
                <Form-item label="链接名称" prop="name">
                    <Input v-model="addPlinksForm.name" placeholder="请输入推广链接名称" size="large" @keyup.enter.native="addPlinks('addPlinksForm')"></Input>
                </Form-item>
                <Form-item label="页面链接" prop="jump_link">
                    <Input v-model="addPlinksForm.jump_link" placeholder="请输入需要推广的页面链接" size="large" @keyup.enter.native="addPlinks('addPlinksForm')"></Input>
                </Form-item>
                <Form-item label="备注" prop="mark">
                    <Input v-model="addPlinksForm.mark" placeholder="请输入备注" size="large" @keyup.enter.native="addPlinks('addPlinksForm')"></Input>
                </Form-item>
            </Form>
        </Modal>
        <!-- 更新推广链接弹框 -->
        <Modal v-model="updatePlinksModalVisible" title="更新推广链接" width="800">
            <div slot="footer">
                <Button type="text" size="large" @click="updatePlinksModalVisible = false">取消</Button>
                <Button type="primary" size="large" :loading="updatePlinksFormLoading" @click="updatePlinks('updatePlinksForm')">确定</Button>
            </div>
            <Form ref="updatePlinksForm" :model="updatePlinksForm" :rules="addPlinksFormRules" label-position="right" :label-width="80">
                <Form-item label="活动名称" prop="event_id">
                    <Select v-model="updatePlinksForm.event_id" disabled size="large" placeholder="请选择需要推广的活动">
                        <Option v-for="item in event_ids" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </Form-item>
                <Form-item label="链接名称" prop="name">
                    <Input v-model="updatePlinksForm.name" placeholder="请输入推广链接名称" size="large" @keyup.enter.native="updatePlinks('updatePlinksForm')"></Input>
                </Form-item>
                <Form-item label="页面链接" prop="jump_link">
                    <Input v-model="updatePlinksForm.jump_link" placeholder="请输入需要推广的页面链接" size="large" @keyup.enter.native="updatePlinks('updatePlinksForm')"></Input>
                </Form-item>
                <Form-item label="备注" prop="mark">
                    <Input v-model="updatePlinksForm.mark" placeholder="请输入备注" size="large" @keyup.enter.native="updatePlinks('updatePlinksForm')"></Input>
                </Form-item>
                <Form-item label="链接状态" prop="status">
                    <RadioGroup v-model="updatePlinksForm.status">
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
          title: "推广链接",
          key: "out_link",
          render: (h, params) => {
            let out_link = window.location.host + params.row.out_link;
            return h("span", [
              h(
                "a",
                {
                  domProps: {
                    href: out_link,
                    target: "_blank"
                  }
                },
                out_link
              )
            ]);
          }
        },
        {
          title: "备注",
          key: "mark"
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
          title: "创建时间",
          key: "created_at",
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
                      this.delPlinks(params);
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
      addPlinksModalVisible: false,
      addPlinksForm: {
        name: "", // 名称
        jump_link: "", // 跳转的页面
        mark: "", // 备注
        event_type: 0, // 活动类型，0:赛事；1:任务；2:第三方推广
        event_id: "" // 活动id。目前为活动id
      },
      addPlinksFormRules: {
        event_id: [
          {
            type: "number",
            required: true,
            message: "请选择需要推广的活动",
            trigger: "change"
          }
        ],
        name: [{ required: true, message: "请输入推广链接名称", trigger: "blur" }],
        jump_link: [
          { type: "url", required: true, message: "请输入推广链接", trigger: "blur" }
        ]
      },
      addPlinksFormLoading: false,
      updatePlinksModalVisible: false,
      updatePlinksForm: {},
      updatePlinksFormLoading: false
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getEventList(0);
      this.getPlinks();
    });
  },
  methods: {
    // 获取活动列表:type-0:用于查询；1:新增
    getEventList(type) {
      let _event_type =
        type == 0 ? this.searchForm.event_type : this.addPlinksForm.event_type;
      let _params = {
        page: 1,
        page_size: 1000,
        event_type: _event_type,
        subject: ""
      };
      this.event_ids = [];
      type == 0
        ? (this.searchForm.event_id = "")
        : (this.addPlinksForm.event_id = "");

      let params = this.$util.deleteEmptyObj(_params);
      this.$axios
        .get("/admin/event", { params })
        .then(res => {
          let list = res.data.list;
          if (list.length != 0) {
            for (let i = 0; i < list.length; i++) {
              const options = {};
              options.label = list[i].subject;
              options.value = list[i].id;
              this.event_ids.push(options);
            }
          }
        })
        .catch(error => {});
    },
    // 获取推广链接列表
    getPlinks() {
      let params = this.$util.deleteEmptyObj(this.searchForm);
      this.$axios
        .get("/admin/plinks", { params })
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
      this.getPlinks();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getPlinks();
    },
    // 点击确定添加按钮
    addPlinks(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.addPlinksFormLoading = true;
          let options = {
            name: this.addPlinksForm.name, // 名称
            jump_link: this.addPlinksForm.jump_link, // 跳转的页面
            mark: this.addPlinksForm.mark, // 备注
            event_id: this.addPlinksForm.event_id // 活动id。目前为活动id
          };
          this.$axios
            .post("/admin/plinks", options)
            .then(res => {
              if (res.code == 0) {
                this.getPlinks();
                this.$Message.success("添加成功！");
                this.addPlinksCancel(name);
                this.addPlinksFormLoading = false;
              }
            })
            .catch(error => {});
        } else {
          this.addPlinksFormLoading = false;
        }
      });
    },
    // 取消添加
    addPlinksCancel(name) {
      this.addPlinksModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 点击“编辑”按钮
    updatePlinksModal(row) {
      let options = {
        id: row.id,
        name: row.name, // 名称
        jump_link: row.jump_link, // 跳转的页面
        mark: row.mark, // 备注
        event_id: row.event_id, // 活动id。目前为活动id
        status: row.status
      };
      this.updatePlinksForm = options;
      this.updatePlinksModalVisible = true;
    },
    // 保存编辑结果
    updatePlinks(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.updatePlinksFormLoading = true;
          this.$axios
            .put(
              "/admin/plinks/" + this.updatePlinksForm.id,
              this.updatePlinksForm
            )
            .then(res => {
              if (res.code == 0) {
                this.getPlinks();
                this.$Message.success("更新成功！");
                this.updatePlinksFormLoading = false;
                this.updatePlinksModalVisible = false;
              }
            })
            .catch(error => {
              this.updatePlinksFormLoading = false;
            });
        } else {
          this.updatePlinksFormLoading = false;
        }
      });
    },
    // 删除推广链接
    delPlinks(params) {
      this.$axios
        .delete("/admin/plinks/" + params.row.id)
        .then(res => {
          this.list.splice(params.index, 1);
        })
        .catch(error => {});
    }
  }
};
</script>
