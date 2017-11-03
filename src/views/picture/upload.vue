<template>
    <div class="upload-wrap">
        <Row :gutter="16">
            <Col span="16">
                <Form class="upload-form" ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
                    <FormItem label="选择用户" prop="username">
                        <Select v-model="formValidate.username" filterable clearable placeholder="请选择用户">
                            <Option value="beijing">雨天</Option>
                            <Option value="shanghai">晴天</Option>
                            <Option value="shenzhen">夏天</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="选择相册" prop="album">
                        <RadioGroup v-model="formValidate.album">
                            <Radio :label="null">默认专辑</Radio>
                            <Radio :label="2">鸟语</Radio>
                            <Radio :label="3">运动</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="选择图片">
                        <Upload
                            ref="upload"
                            multiple
                            type="drag"
                            :data="{token: upload_token}"
                            :show-upload-list="true"
                            :default-file-list="defaultList"
                            :on-success="handleSuccess"
                            :on-error="handleError"
                            :format="['jpg','jpeg','png']"
                            :max-size="max_size"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :before-upload="handleBeforeUpload"
                            action="http://upload.qiniu.com/">
                            <div style="padding: 20px 0">
                                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                                <p>点击或将图片拖拽到这里上传</p>
                            </div>
                        </Upload>
                    </FormItem>
                </Form>
            </Col>
            <Col span="8">
                <h3>用户近期上传的图片</h3>
            </Col>
        </Row>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                upload_token: '',
                upload_keyPrefix: '',
                max_size: 1024*50,
                defaultList: [],
                uploadList: [],
                loadingStatus: false,
                formValidate: {
                    username: '',
                    album: null
                },
                ruleValidate: {
                    username: [
                        { required: true, message: '请选择用户', trigger: 'change' }
                    ]
                }
            }
        },
        mounted: function(){
            this.$nextTick(function(){
                this.getUploadToken();
                this.uploadList = this.$refs.upload.fileList;
            })
        },
        methods: {
            // 获取七牛token
            getUploadToken(){
                this.$axios.get('/admin/upload/token/product').then(res => {
                    this.upload_token = res.data.token;
                    this.upload_keyPrefix = res.data.keyPrefix;
                    this.$refs.upload.data.token = this.upload_token;
                })
            },
            // 删除预览图
            handleRemove (file) {
                // 从 upload 实例删除数据
                const fileList = this.$refs.upload.fileList;
                this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
            },
            // 上传成功
            handleSuccess (res, file, fileList) {
                if (res.code !== 0) {
                    this.$Notice.warning({
                        title: '上传错误',
                        desc: '文件 ' + file.name + ' 上传失败，原因： ' + res.msg,
                        duration: 15
                    });
                }
            },
            // 上传失败
            handleError(error,file) {
                this.$Message.error(error + file.name + ' 图片上传失败。');
            },
            // 文件格式不正确
            handleFormatError (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。',
                    duration: 15
                });
            },
            // 超出文件大小限制
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件 ' + file.name + ' 太大，不能超过 ' + (this.max_size/1024).toFixed(2) + ' M。',
                    duration: 15
                });
            },
            // 上传之前的操作
            handleBeforeUpload (file) {
                let file_name = file.name;
                let date = new Date();
                let s = date.getSeconds();
                let m = date.getMilliseconds();
                let key = this.upload_keyPrefix + s + m + file_name.substring(file_name.lastIndexOf('.'),file_name.length);
                this.$refs.upload.data.key = key;
                console.log(this.$refs.upload.data)
            },
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.$Message.success('提交成功!');
                    } else {
                        this.$Message.error('表单验证失败!');
                    }
                })
            },
            handleReset (name) {
                this.$refs[name].resetFields();
            }
        }
    }
</script>
<style lang="less" scoped>
.ivu-form-item {
    margin-bottom: 24px !important;
}
</style>