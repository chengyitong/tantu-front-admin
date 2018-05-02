<template>
  <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="120">
    <Form-item label="活动类型" prop="event_type">
      <Select v-model="formValidate.event_type" placeholder="请选择活动类型" style="width: 200px;">
        <Option :value="0" :key="0">赛事</Option>
        <Option :value="1" :key="1">任务</Option>
        <!-- <Option :value="2" :key="2">第三方推广</Option> -->
      </Select>
    </Form-item>
    <FormItem label="首页显示" prop="is_crousel">
      <RadioGroup v-model="formValidate.is_crousel">
        <Radio :label="1">是</Radio>
        <Radio :label="0">否</Radio>
      </RadioGroup>
    </FormItem>
    <FormItem label="活动标题" prop="subject">
      <Input v-model="formValidate.subject" placeholder="请填写任务标题，建议不超过18个字符"></Input>
    </FormItem>
    <FormItem label="活动开始日期" prop="start_time">
      <FormItem prop="start_time">
        <DatePicker type="date" placeholder="请选择活动开始日期" v-model="formValidate.start_time"></DatePicker>
      </FormItem>
    </FormItem>
    <FormItem label="活动结束日期" prop="end_time">
      <FormItem prop="end_time">
        <DatePicker type="date" placeholder="请选择活动结束日期" v-model="formValidate.end_time"></DatePicker>
      </FormItem>
    </FormItem>
    <FormItem label="活动奖品" prop="award">
      <Input v-model="formValidate.award" type="textarea" placeholder="请填写活动奖品，建议不超过18个字符"></Input>
    </FormItem>
    <Form-item label="首页活动缩略图" prop="subject_banner_index">
      <Input v-model="formValidate.subject_banner_index" disabled placeholder="请上传用于展示在首页活动列表的缩略图" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
      <Upload ref="subject_banner_index_upload" :action="upload_domain" :data="upload_data" :show-upload-list="false" :before-upload="beforeUpload" :on-success="uploadSuccess" :format="['jpg','jpeg','png']">
        <Button type="primary" icon="ios-cloud-upload-outline" id="subject_banner_index">上传首页活动缩略图</Button> 建议尺寸：354 * 176
      </Upload>
    </Form-item>
    <Form-item label="活动列表缩略图" prop="subject_banner_list">
      <Input v-model="formValidate.subject_banner_list" disabled placeholder="请上传活动列表缩略图" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
      <Upload ref="subject_banner_list_upload" :action="upload_domain" :data="upload_data" :before-upload="beforeUpload" :on-success="uploadSuccess" :format="['jpg','jpeg','png']">
        <Button type="primary" icon="ios-cloud-upload-outline" id="subject_banner_list">上传活动列表缩略图</Button> 建议尺寸：566 * 260
      </Upload>
    </Form-item>
    <Form-item label="活动详情页缩略图" prop="subject_banner_detail">
      <Input v-model="formValidate.subject_banner_detail" disabled placeholder="请上传活动详情页缩略图" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
      <Upload ref="subject_banner_detail_upload" :action="upload_domain" :data="upload_data" :before-upload="beforeUpload" :on-success="uploadSuccess" :format="['jpg','jpeg','png']">
        <Button type="primary" icon="ios-cloud-upload-outline" id="subject_banner_detail">上传活动详情页缩略图</Button> 建议尺寸：1920 * 520
      </Upload>
    </Form-item>
    <Form-item label="APP活动封面" prop="subject_banner_app">
      <Input v-model="formValidate.subject_banner_app" disabled placeholder="请上传APP活动封面" size="large" @keyup.enter.native="addBanner('addBannerForm')"></Input>
      <Upload ref="subject_banner_app_upload" :action="upload_domain" :data="upload_data" :before-upload="beforeUpload" :on-success="uploadSuccess" :format="['jpg','jpeg','png']">
        <Button type="primary" icon="ios-cloud-upload-outline" id="subject_banner_app">上传APP活动封面</Button> 建议尺寸：750 * 424
      </Upload>
    </Form-item>
    <FormItem label="活动外链" prop="link">
      <Input v-model="formValidate.link" placeholder="请填写活动外链"></Input>
    </FormItem>
    <FormItem label="活动介绍" prop="description">
      <quill-editor v-model="formValidate.description" @onEditorChange="getQuillContent" @onEditorBlur="getQuillContent" :content="formValidate.description"></quill-editor>
    </FormItem>
    <FormItem>
      <Button type="primary" @click="handleSubmit('formValidate',2)">正式发布任务</Button>
      <Button type="info" @click="handleSubmit('formValidate',1)">保存为草稿</Button>

      <!-- // 这个部分仅为了用于修改旧数据，用完之后需要删除 -->
      <Button @click="handleSubmit('formValidate')">保存当前结果不改变状态</Button>
    </FormItem>
  </Form>
</template>
<script>
import quillEditor from '../my_components/quill-editor/quillEditor';
import md5 from 'md5';
export default {
  data() {
    return {
      formValidate: {
        event_type: 0, // 活动类型：0-赛事；1-任务
        is_crousel: 1, // 是否在首页显示轮播，0不轮播，1轮播
        subject: '', // 活动标题
        award: '', // 奖品
        start_time: '', // 开始时间
        end_time: '', // 结束时间
        subject_banner_index: '', // 首页活动缩略图
        subject_banner_detail: '', // 活动详情页缩略图
        subject_banner_list: '', // 活动列表缩略图
        subject_banner_app: '', // APP活动封面
        link: '', // 首页外链url
        status: '', // 活动状态：1草稿，2发布，3评奖，4公示，5结束
        description: '' // 活动介绍
      },
      ruleValidate: {
        event_type: [
          {
            required: true,
            type: 'number',
            message: '请选择活动类型',
            trigger: 'change'
          }
        ],
        is_crousel: [
          {
            required: true,
            type: 'number',
            message: '请选择是否在首页展示',
            trigger: 'change'
          }
        ],
        subject: [
          {
            required: true,
            message: '请填写活动标题',
            trigger: 'blur'
          }
        ],
        award: [
          {
            required: true,
            message: '请填写活动奖品',
            trigger: 'blur'
          }
        ],
        start_time: [
          {
            required: true,
            type: 'date',
            message: '请选择活动开始日期',
            trigger: 'change'
          }
        ],
        end_time: [
          {
            required: true,
            type: 'date',
            message: '请选择活动结束日期',
            trigger: 'change'
          }
        ],
        subject_banner_index: [
          {
            required: true,
            type: 'url',
            message: '请上传首页活动缩略图',
            trigger: 'blur'
          }
        ],
        subject_banner_detail: [
          {
            required: true,
            type: 'url',
            message: '请上传活动详情页缩略图',
            trigger: 'blur'
          }
        ],
        subject_banner_list: [
          {
            required: true,
            type: 'url',
            message: '请上传活动列表缩略图',
            trigger: 'blur'
          }
        ],
        subject_banner_app: [
          {
            required: true,
            type: 'url',
            message: '请上传APP活动封面',
            trigger: 'blur'
          }
        ],
        description: [
          {
            required: true,
            message: '请填写活动详情',
            trigger: 'blur'
          }
        ]
      },
      upload_data: {
        token: '',
        key: ''
      },
      upload_domain: '',
      cur_upload: '' // 当前上传的目标
    };
  },
  components: {
    'quill-editor': quillEditor
  },
  mounted: function() {
    this.$nextTick(function() {
      this.getEventDetail();
    });
  },
  methods: {
    // 获取活动详情
    getEventDetail() {
      this.$axios.get('/admin/event/details/' + this.$route.params.event_id).then(res => {
        let options = {
          event_type: res.data.event_type, // 活动类型：0-赛事；1-任务
          is_crousel: res.data.is_crousel, // 是否在首页显示轮播，0不轮播，1轮播
          subject: res.data.subject, // 活动标题
          award: res.data.award, // 奖品
          start_time: res.data.start_time, // 开始时间
          end_time: res.data.end_time, // 结束时间
          subject_banner_index: res.data.subject_banner_index, // 首页活动缩略图
          subject_banner_detail: res.data.subject_banner_detail, // 活动详情页缩略图
          subject_banner_list: res.data.subject_banner_list, // 活动列表缩略图
          subject_banner_app: res.data.subject_banner_app, // APP活动封面
          link: res.data.link, // 首页外链url
          status: res.data.status, // 活动状态：1草稿，2发布，3评奖，4公示，5结束
          description: res.data.description // 活动介绍
        };
        this.formValidate = options;
      });
    },
    // 获取上传七牛token
    getFreeUploadToken(type, file) {
      return this.$axios.post('/admin/upload/token/free', { type }).then(res => {
        this.upload_domain = window.location.protocol + '//' + res.data.upload_domain;
        let key = res.data.keyPrefix;
        if (file != undefined) {
          let ext = this.$util.getFileExtension(file.name);
          key = key + md5(file.name).substring(26, 32) + '.' + ext;
        }
        this.upload_data = {
          token: res.data.token,
          key
        };
        this.$Spin.show({
          render: h => {
            return h('div', [
              h('Icon', {
                class: 'demo-spin-icon-load',
                props: {
                  type: 'load-c',
                  size: 18
                }
              }),
              h('div', '正在上传')
            ]);
          }
        });
      });
    },
    beforeUpload(file) {
      let node_child = event.currentTarget.parentNode.children;
      this.cur_upload = node_child[1].id;
      return this.getFreeUploadToken('event_thumb', file);
    },
    // 图片上传成功回调
    uploadSuccess(response, file, fileList) {
      this.$axios.post(response.hReturnUrl, { upload_ret: JSON.stringify(response) }).then(res => {
        this.$Spin.hide();
        let cur_upload = this.cur_upload;
        this.$refs[cur_upload + '_upload'].clearFiles(); // 插入成功后清除input的内容
        let banner_url = res.data.full_url;
        this.formValidate[cur_upload] = banner_url;
      });
    },
    // 获取 quill-editor 子组件的输入内容
    getQuillContent(data) {
      this.formValidate.description = data;
    },
    handleSubmit(name, status) {
      // 这个部分仅为了用于修改旧数据，用完之后需要删除
      if (status == undefined) {
        status = this.formValidate.status;
      }
      this.$refs[name].validate(valid => {
        if (valid) {
          let options = this.formValidate;
          options.status = status;
          options.start_time = this.$util.crtTimeFtt(options.start_time);
          options.end_time = this.$util.crtTimeFtt(options.end_time);
          this.$axios.put('/admin/event/' + this.$route.params.event_id, options).then(res => {
            if (status == 1) {
              this.$Message.success('草稿保存成功，可在活动列表中查看！');
            } else if (status == 2) {
              this.$Message.success('活动发布成功，可在活动列表中查看！');
              this.$refs[name].resetFields();
            }
            setTimeout(() => {
              this.$router.push({ path: '/activity/list' });
            }, 200);
          });
        } else {
          this.$Message.error('还有必填项未填写');
        }
      });
    }
  }
};
</script>
