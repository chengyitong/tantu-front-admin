<template>
  <div>
    <Form class="search-form" ref="searchForm" :model="searchForm" label-position="right" :label-width="70" inline>
      <Form-item label="收款账户" prop="a_9_account_num">
        <Input v-model="searchForm.a_9_account_num" placeholder="收款账户" @keyup.enter.native="searchForm.page=1;getWithdrawals();"></Input>
      </Form-item>
      <Form-item label="账户类型" prop="a_9_account_type">
        <Select v-model="searchForm.a_9_account_type" filterable clearable placeholder="默认全部" @on-change="searchForm.page=1;getWithdrawals();" style="width: 141px;">
          <Option :value="1" :key="1">支付宝</Option>
          <Option :value="2" :key="2">银行卡</Option>
        </Select>
      </Form-item>
      <Form-item label="状态" prop="a_9_status">
        <Select v-model="searchForm.a_9_status" filterable clearable placeholder="默认全部" @on-change="searchForm.page=1;getWithdrawals();" style="width: 141px;">
          <Option :value="1" :key="1">待处理</Option>
          <Option :value="2" :key="2">已打款</Option>
          <Option :value="3" :key="3">不打款</Option>
        </Select>
      </Form-item>
      <Form-item label="用户ID" prop="a_9_user_id">
        <Input v-model="searchForm.a_9_user_id" placeholder="用户ID" @keyup.enter.native="searchForm.page=1;getWithdrawals();"></Input>
      </Form-item>
      <Form-item label="用户昵称" prop="user_9_nickname">
        <Input v-model="searchForm.user_9_nickname" placeholder="用户昵称" @keyup.enter.native="searchForm.page=1;getWithdrawals();"></Input>
      </Form-item>
      <Form-item label="申请时间" prop="a_9_create_time">
        <DatePicker type="daterange" v-model="searchForm.a_9_create_time" :options="datePickerOptions" placeholder="请选择提现申请时间周期" style="width: 180px" @on-change="searchForm.a_9_create_time=$event"></DatePicker>
      </Form-item>
      <Button type="primary" @click="searchForm.page=1;getWithdrawals();">
        <Icon type="search" size="14"></Icon>&nbsp;查询
      </Button>
      <Button type="info" @click="$refs['searchForm'].resetFields()">
        <Icon type="reply" size="14"></Icon>&nbsp;重置
      </Button>
    </Form>

    <Table :loading="table_loading" :columns="list_columns" :data="list"></Table>
    <Page v-if="count > 0" :total="count" show-total :page-size-opts="[10,20,30,40]" show-sizer @on-change="handlePageChange" @on-page-size-change="handlePageSizeChange"></Page>

    <!-- 审核弹框 -->
    <Modal v-model="updateStatusModalVisible" title="审核用户提现申请">
      <div slot="footer">
        <Button type="text" size="large" @click="updateStatusCancel('updateStatusForm')">取消</Button>
        <Button type="primary" size="large" :loading="updateStatusFormLoading" @click="updateStatus('updateStatusForm')">确定</Button>
      </div>
      <Form ref="updateStatusForm" :model="updateStatusForm" label-position="right" :label-width="100">
        <p style="margin-left: 40px;">提示：请完成资料审核和线下打款后再进行此操作！</p>
        <Form-item label="审核结果" prop="status">
          <RadioGroup v-model="updateStatusForm.status">
            <Radio :label="2">已打款</Radio>
            <Radio :label="3">不打款</Radio>
          </RadioGroup>
        </Form-item>
        <Form-item v-if="updateStatusForm.status == 3" label="不打款的原因" prop="result">
          <Input type="textarea" v-model="updateStatusForm.result" placeholder="填写不打款的原因"></Input>
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
        a_9_account_num: '',
        a_9_account_type: '',
        a_9_status: '',
        a_9_user_id: '',
        user_9_nickname: '',
        page: 1,
        page_size: 10,
        a_9_create_time: ''
      },
      updateStatusFormLoading: false,
      updateStatusModalVisible: false,
      updateStatusForm: {
        id: '',
        status: 2, // 状态，1待处理，即申请中，2审核通过，3审核不通过
        result: ''
      },
      datePickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            }
          },
          {
            text: '最近一个月',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            }
          },
          {
            text: '最近三个月',
            value() {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            }
          }
        ]
      },
      table_loading: false,
      list: [],
      list_columns: [
        {
          title: '用户昵称',
          key: 'money',
          width: 150,
          render: (h, params) => {
            return h('span', params.row.user.nickname + '（ID：' + params.row.user.id + '）');
          }
        },
        {
          title: '提现金额',
          key: 'money',
          width: 90,
          render: (h, params) => {
            return h('span', (params.row.money / 100).toFixed(2));
          }
        },
        {
          title: '手续费',
          key: 'service_charge',
          width: 90,
          render: (h, params) => {
            return h('span', (params.row.service_charge / 100).toFixed(2));
          }
        },
        {
          title: '可打款金额',
          key: 'pay_money',
          width: 120,
          render: (h, params) => {
            return h('span', (parseInt(params.row.money - params.row.service_charge) / 100).toFixed(2));
          }
        },
        {
          title: '收款账户',
          key: 'account_type',
          width: 290,
          render: (h, params) => {
            let type = params.row.account_type;
            let type_str = '';
            let receivable_account = params.row.receivable_account;
            if (type == 1) {
              type_str = receivable_account.payee + '-' + params.row.account_num + '-支付宝';
            }
            if (type == 2) {
              type_str = receivable_account.payee + '-' + params.row.account_num + '-' + receivable_account.bank + receivable_account.branch;
            }
            return h('span', type_str);
          }
        },
        {
          title: '用户绑定的手机号',
          key: 'tel',
          width: 160,
          render: (h, params) => {
            return h('span', params.row.user.tel);
          }
        },
        {
          title: '申请时间',
          key: 'create_time',
          width: 160,
          sortable: true
        },
        {
          title: '处理时间',
          key: 'update_time',
          width: 160,
          sortable: true
        },
        {
          title: '状态',
          key: 'status',
          width: 110,
          align: 'center',
          render: (h, params) => {
            let status = params.row.status;
            let status_str = '';
            let status_color = '';
            switch (status) {
              case 1:
                status_str = '待处理';
                status_color = 'blue';
                break;
              case 2:
                status_str = '已打款';
                status_color = 'green';
                break;
              case 3:
                status_str = '不打款';
                status_color = 'red';
                break;
            }

            if (status != 3) {
              return h(
                'Tag',
                {
                  props: {
                    color: status_color,
                    size: 'small'
                  }
                },
                status_str
              );
            }

            if (status == 3) {
              return h(
                'Poptip',
                {
                  props: {
                    content: '原因：' + params.row.result,
                    trigger: 'hover',
                    transfer: true,
                    placement: 'top'
                  }
                },
                [
                  h(
                    'Tag',
                    {
                      props: {
                        color: status_color,
                        size: 'small'
                      }
                    },
                    status_str
                  )
                ]
              );
            }
          }
        },
        {
          title: '操作',
          fixed: 'right',
          width: 90,
          align: 'center',
          render: (h, params) => {
            if (params.row.status == 1) {
              let operate_str = '审核';
              return h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.updateStatusModal(params.row.id);
                    }
                  }
                },
                operate_str
              );
            }
          }
        }
      ],
      count: 0, // 总数据条数
      isShowPage: false
    };
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getWithdrawals();
    });
  },
  methods: {
    // 获取订单列表
    getWithdrawals() {
      this.table_loading = true;
      let params = this.$util.deleteEmptyObj(this.searchForm);
      this.$axios.get('/admin/withdrawals', { params }).then(res => {
        this.list = res.data.list;
        this.count = res.data.count;
        this.table_loading = false;
      });
    },
    // 翻页
    handlePageChange(cur_page) {
      this.searchForm.page = cur_page;
      this.getWithdrawals();
    },
    // 改变每页大小
    handlePageSizeChange(page_size) {
      this.searchForm.page_size = page_size;
      this.getWithdrawals();
    },
    // 点击审核按钮
    updateStatusModal(id) {
      this.updateStatusModalVisible = true;
      this.updateStatusForm.id = id;
    },
    // 取消审核
    updateStatusCancel(name) {
      this.updateStatusModalVisible = false;
      this.updateStatusForm.id = null;
      this.$refs[name].resetFields();
    },
    // 提交审核结果
    updateStatus(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          if (this.updateStatusForm.status == 3 && this.updateStatusForm.result.length == 0) {
            this.$Message.warning('不打款需要填写原因');
            return false;
          }
          this.updateStatusFormLoading = true;
          let params = this.$util.deleteEmptyObj(this.updateStatusForm);
          this.$axios
            .put('/admin/withdrawals/withdrawals_auditing/' + this.updateStatusForm.id, params)
            .then(res => {
              if (res.code == 0) {
                this.$refs[name].resetFields();
                this.getWithdrawals();
                this.$Message.success('审核结果已提交');
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
