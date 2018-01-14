<template>
  <div>
    <Form>
      <Button type="success" @click="addColorModalVisible = true">
        <Icon type="plus" size="14"></Icon>&nbsp;新增
      </Button>
    </Form>

    <Table :columns="list_columns" :data="list"></Table>

    <!-- 新增颜色弹框 -->
    <Modal v-model="addColorModalVisible" title="新增颜色">
      <div slot="footer">
        <Button type="text" size="large" @click="$refs['addColorForm'].resetFields();addColorModalVisible = false">取消</Button>
        <Button type="primary" size="large" :loading="addColorFormLoading" @click="addColor('addColorForm')">确定</Button>
      </div>
      <Form ref="addColorForm" :model="addColorForm" :rules="addColorFormRules" label-position="right" :label-width="80">
        <Form-item label="颜色名称" prop="name">
          <Input v-model="addColorForm.name" placeholder="请输入颜色名称" size="large" @keyup.enter.native="addColor('addColorForm')"></Input>
        </Form-item>
        <Form-item label="颜色代码" prop="color_value">
          <Input v-model="addColorForm.color_value" placeholder="请输入颜色代码，十六进制，如：#e07303" size="large" @keyup.enter.native="addColor('addColorForm')"></Input>
          <a href="http://www.atool.org/colorpicker.php" target="_blank">颜色代码表</a>
        </Form-item>
        <Form-item label="状态" prop="status">
          <RadioGroup v-model="addColorForm.status">
            <Radio :label="1">正常</Radio>
            <Radio :label="2">禁用</Radio>
          </RadioGroup>
        </Form-item>
      </Form>
    </Modal>
    <!-- 更新颜色弹框 -->
    <Modal v-model="updateColorModalVisible" title="更新颜色">
      <div slot="footer">
        <Button type="text" size="large" @click="updateColorModalVisible = false">取消</Button>
        <Button type="primary" size="large" :loading="updateColorFormLoading" @click="updateColor('updateColorForm')">确定</Button>
      </div>
      <Form ref="updateColorForm" :model="updateColorForm" :rules="addColorFormRules" label-position="right" :label-width="80">
        <Form-item label="颜色名称" prop="name">
          <Input v-model="updateColorForm.name" placeholder="请输入颜色名称" size="large" @keyup.enter.native="updateColor('updateColorForm')"></Input>
        </Form-item>
        <Form-item label="颜色代码" prop="color_value">
          <Input v-model="updateColorForm.color_value" placeholder="请输入颜色代码，十六进制，如：#e07303" size="large" @keyup.enter.native="updateColor('updateColorForm')"></Input>
          <a href="http://www.atool.org/colorpicker.php" target="_blank">颜色代码表</a>
        </Form-item>
        <Form-item label="状态" prop="status">
          <RadioGroup v-model="updateColorForm.status">
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
    const validateColor = (rule, value, callback) => {
      if (!/^#[0-9a-fA-F]{3,6}$/.test(value)) {
        callback(new Error("请输入十六进制的颜色代码"));
      } else {
        callback();
      }
    };
    return {
      list: [], // 颜色列表
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
          title: "颜色名称",
          key: "name",
          sortable: true,
          render: (h, params) => {
            return h("span", [
              h(
                "span",
                {
                  style: {
                    float: "left"
                  }
                },
                params.row.name
              ),
              h("span", {
                style: {
                  display: "inline-block",
                  marginLeft: "5px",
                  width: "30px",
                  height: "20px",
                  borderRadius: "4px",
                  border: "1px solid #eee",
                  backgroundColor: params.row.color_value
                }
              })
            ]);
          }
        },
        {
          title: "颜色代码",
          key: "color_value",
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
                      this.updateColorModal(params.row);
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
                        .delete("/admin/color/" + params.row.id)
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
      addColorModalVisible: false,
      addColorForm: {
        name: "", // 名称
        color_value: "", // 颜色代码
        status: 1 // 状态：1-正常；2-禁用
      },
      addColorFormRules: {
        name: [{ required: true, message: "请输入颜色名称", trigger: "blur" }],
        color_value: [
          { required: true, message: "请输入颜色代码", trigger: "blur" },
          { validator: validateColor, trigger: "blur" }
        ]
      },
      addColorFormLoading: false,
      updateColorModalVisible: false,
      updateColorForm: {
        id: "",
        name: "", // 名称
        color_value: ""
      },
      updateColorFormLoading: false
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getColorLists();
    });
  },
  methods: {
    // 获取图片颜色列表
    getColorLists() {
      this.$axios.get("/admin/color").then(res => {
        this.list = res.data.list;
      });
    },
    // 点击确定添加按钮
    addColor(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.addColorFormLoading = true;
          this.$axios
            .post("/admin/color", this.addColorForm)
            .then(res => {
              if (res.code == 0) {
                this.getColorLists();
                this.$Message.success("添加成功！");
                this.$refs[name].resetFields();
                this.addColorFormLoading = false;
              }
            })
            .catch(error => {
              this.addColorFormLoading = false;
            });
        } else {
          this.addColorFormLoading = false;
        }
      });
    },
    // 点击“编辑”按钮
    updateColorModal(row) {
      let options = {
        id: row.id,
        name: row.name, // 名称
        status: row.status,
        color_value: row.color_value
      };
      this.updateColorForm = options;
      this.updateColorModalVisible = true;
    },
    // 保存编辑结果
    updateColor(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.updateColorFormLoading = true;
          this.$axios
            .put(
              "/admin/color/" + this.updateColorForm.id,
              this.updateColorForm
            )
            .then(res => {
              if (res.code == 0) {
                this.getColorLists();
                this.$Message.success("更新成功！");
                this.updateColorFormLoading = false;
                this.updateColorModalVisible = false;
              }
            })
            .catch(error => {
              this.updateColorFormLoading = false;
            });
        } else {
          this.updateColorFormLoading = false;
        }
      });
    }
  }
};
</script>
