<template>
  <div>
    <Button type="success" @click="addHotTagModalVisible = true" style="margin-bottom: 10px;">
      <Icon type="plus" size="14"></Icon>&nbsp;新增
    </Button>

    <!-- 添加热门标签弹框 -->
    <Modal v-model="addHotTagModalVisible" title="添加热门标签" width="800">
      <div slot="footer">
        <Button type="text" size="large" @click="addHotTagCancel('addHotTagForm')">取消</Button>
        <Button type="primary" size="large" :loading="addHotTagFormLoading" @click="addHotTag('addHotTagForm')">确定</Button>
      </div>
      <Form ref="addHotTagForm" :model="addHotTagForm" :rules="addHotTagFormRules" label-position="right" :label-width="100">
        <Form-item label="热门标签" prop="value">
          <Input v-model="addHotTagForm.value" placeholder="请输入热门标签，多个之间用英文逗号分隔" size="large" @keyup.enter.native="addHotTag('addHotTagForm')"></Input>
        </Form-item>
      </Form>
    </Modal>

    <DragableTable refs="tagTable" :columnsList="columnsList" :tableData="tableData" :start="handleOnstart" :end="handleOnend"></DragableTable>
  </div>
</template>

<script>
import DragableTable from './components/dragableTable.vue';

export default {
  components: {
    DragableTable
  },
  data() {
    return {
      addHotTagForm: {
        id: null,
        value: null,
        description: '热门标签'
      },
      addHotTagModalVisible: false,
      addHotTagFormLoading: false,
      addHotTagFormRules: {
        value: [
          {
            required: true,
            message: '请输入热门标签，多个之间用英文逗号分隔',
            trigger: 'blur'
          }
        ]
      },
      columnsList: [],
      tableData: [],
      tagArr: [],
      tagId: null,
      tagTable: {
        hasDragged: false,
        isDragging: false,
        oldIndex: 0,
        newIndex: 0,
        draggingRecord: []
      }
    };
  },
  methods: {
    // 取消“新增”
    addHotTagCancel(name) {
      this.addHotTagModalVisible = false;
      this.$refs[name].resetFields();
    },
    // 保存
    addHotTag(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.addHotTagFormLoading = true;
          let addTag = this.addHotTagForm.value.split(',');
          let value = this.tagArr.concat(addTag);
          this.$axios
            .put('/admin/config/update/' + this.tagId, { value: value.toString() })
            .then(res => {
              if (res.code == 0) {
                this.getHotTag();
                this.$Message.success('添加成功！');
                this.addHotTagFormLoading = false;
                this.addHotTagModalVisible = false;
                this.addHotTagForm.value = null;
              }
            })
            .catch(error => {
              this.addHotTagFormLoading = false;
            });
        } else {
          this.addHotTagFormLoading = false;
        }
      });
    },
    // 数组位置互换
    changeArr(arr, index, tindex) {
      if (index > tindex) {
        arr.splice(tindex, 0, arr[index]);
        arr.splice(index + 1, 1);
      } else {
        arr.splice(tindex + 1, 0, arr[index]);
        arr.splice(index, 1);
      }
      return arr;
    },
    handleOnstart(el) {
      this.tagTable.oldIndex = el.oldIndex;
      this.tagTable.hasDragged = true;
      this.tagTable.isDragging = true;
    },
    handleOnend(el) {
      this.tagTable.newIndex = el.newIndex;
      this.tagTable.isDragging = false;
      this.tagTable.draggingRecord.unshift({
        from: this.tagTable.oldIndex,
        to: this.tagTable.newIndex
      });
      let newTagArr = this.changeArr(this.tagArr, this.tagTable.oldIndex, this.tagTable.newIndex);
      this.updateTag(newTagArr.toString());
    },
    // 更新标签
    updateTag(value) {
      this.$axios
        .put('/admin/config/update/' + this.tagId, { value })
        .then(res => {
          if (res.code == 0) {
            this.getHotTag();
          }
        })
        .catch(error => {});
    },
    // 获取热门标签配置
    getHotTag() {
      this.$axios.get('/admin/config/hot_tag').then(res => {
        this.tableData = [];
        this.addHotTagForm.id = res.data.id;
        this.tagId = res.data.id;
        let tagValue = res.data.value;
        if (tagValue != '' && tagValue != null) {
          let tagArr = tagValue.split(',');
          this.tagArr = tagArr;
          console.log(this.tagArr.toString());
          tagArr.forEach((item, index) => {
            let obj = {
              order: index + 1,
              tagName: item
            };
            this.tableData.push(obj);
          });
        }
      });
    },
    getData() {
      this.columnsList = [
        {
          title: '序号',
          key: 'order',
          width: 80,
          align: 'center'
        },
        {
          title: '标签名称',
          key: 'tagName'
        },
        {
          title: '拖拽',
          key: 'drag',
          width: 90,
          align: 'center',
          render: h => {
            return h('Icon', {
              props: {
                type: 'arrow-move',
                size: 24
              }
            });
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 130,
          align: 'center',
          render: (h, params) => {
            let currentRow = params.row;
            return h('span', [
              h(
                'Poptip',
                {
                  props: {
                    confirm: true,
                    title: '您确定要删除该标签吗?',
                    transfer: true,
                    placement: 'top-end'
                  },
                  on: {
                    'on-ok': () => {
                      currentRow.isDeleting = true;
                      this.tagArr.splice(currentRow.order - 1, 1);
                      this.updateTag(this.tagArr.toString());
                    }
                  }
                },
                [
                  h(
                    'Button',
                    {
                      props: {
                        type: 'error',
                        size: 'small',
                        placement: 'top',
                        loading: currentRow.isDeleting
                      },
                      style: {
                        margin: '0 5px'
                      }
                    },
                    '删除'
                  )
                ]
              )
            ]);
          }
        }
      ];
    }
  },
  created() {
    // 可在此从服务端获取表格数据
    this.getData();
    this.getHotTag();
  }
};
</script>
