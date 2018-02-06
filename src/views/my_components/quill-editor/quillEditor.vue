<template>
  <div>
    <div class="quill-editor-example" id="quill_editor">
      <!-- quill-editor -->
      <!-- <quill-editor ref="myQuillEditor" :content="content" @change="onEditorChange($event)" @blur="onEditorBlur($event)" @focus="onEditorFocus($event)" @ready="onEditorReady($event)"></quill-editor> -->
      <quill-editor ref="myQuillEditor" :content="content" :options="editorOption" @change="onEditorChange($event)" @blur="onEditorBlur($event)" @focus="onEditorFocus($event)" @ready="onEditorReady($event)"></quill-editor>
      <Upload ref="upload" :action="upload_domain" :data="upload_data" :before-upload="beforeUpload" :on-success="uploadSuccess" style="display: none;">
        <Button type="ghost" icon="ios-cloud-upload-outline" id="imgInput">Upload files</Button>
      </Upload>
    </div>
  </div>
</template>

<script>
// import hljs from "highlight.js";
// import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
// import "quill/dist/quill.bubble.css";
// import { quillRedefine } from "vue-quill-editor-upload";
import { Quill, quillEditor } from "vue-quill-editor";
import md5 from "md5";
export default {
  data() {
    return {
      editorOption: {
        theme: "snow",
        boundary: document.body,
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ["clean"],
            // ["link", "image", "video"]
            ["link", "image"]
          ]
        },
        placeholder: "请在这里输入 ...",
        readOnly: false
      },
      upload_domain: "",
      upload_data: {
        token: "",
        key: ""
      } // 图片上传七牛时的参数
    };
  },
  components: {
    quillEditor
  },
  props: ["content"],
  computed: {
    editor() {
      return this.$refs.myQuillEditor.quill;
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      // 为图片ICON绑定事件  getModule 为编辑器的内部属性
      this.$refs.myQuillEditor.quill
        .getModule("toolbar")
        .addHandler("image", this.imgHandler);
    });
  },
  methods: {
    // 获取上传七牛token
    getFreeUploadToken(type, file) {
      return this.$axios
        .post("/admin/upload/token/free", { type })
        .then(res => {
          this.upload_domain =
            window.location.protocol + "//" + res.data.upload_domain;
          let key = res.data.keyPrefix;
          if (file != undefined) {
            let ext = this.$util.getFileExtension(file.name);
            key = key + md5(file.name).substring(26, 32) + "." + ext;
          }

          this.upload_data = {
            token: res.data.token,
            key
          };
          this.$Spin.show({
            render: h => {
              return h("div", [
                h("Icon", {
                  class: "demo-spin-icon-load",
                  props: {
                    type: "load-c",
                    size: 18
                  }
                }),
                h("div", "正在上传")
              ]);
            }
          });
        });
    },
    // 点击图片ICON触发事件
    imgHandler(state) {
      this.addRange = this.$refs.myQuillEditor.quill.getSelection();
      if (state) {
        let fileInput = document.getElementById("imgInput");
        fileInput.click(); // 加一个触发事件
      }
    },
    beforeUpload(file) {
      return this.getFreeUploadToken("editor", file);
    },
    // 图片上传成功回调 插入到编辑器中
    uploadSuccess(response, file, fileList) {
      this.$axios
        .post(response.hReturnUrl, { upload_ret: JSON.stringify(response) })
        .then(res => {
          let vm = this;
          let full_url = res.data.full_url;
          if (full_url != null && full_url.length > 0) {
            // 将文件上传后的URL地址插入到编辑器文本中
            let value = full_url;
            vm.addRange = vm.$refs.myQuillEditor.quill.getSelection();
            value = value.indexOf("http") !== -1 ? value : "http:" + value;
            vm.$refs.myQuillEditor.quill.insertEmbed(
              vm.addRange !== null ? vm.addRange.index : 0,
              "image",
              value,
              Quill.sources.USER
            ); // 调用编辑器的 insertEmbed 方法，插入URL
          } else {
            this.$Message.warning("插入失败");
          }
          this.$Spin.hide();
          this.$refs["upload"].clearFiles(); // 插入成功后清除input的内容
        });
    },
    onEditorBlur(editor) {
      // console.log("editor blur!", editor);
      this.$emit("onEditorBlur", editor.container.firstChild.innerHTML);
    },
    onEditorFocus(editor) {
      // console.log("editor focus!", editor);
      this.$emit("onEditorBlur", editor.container.firstChild.innerHTML);
    },
    onEditorChange(editor) {
      // console.log(editor.html);
      this.$emit("onEditorChange", editor.html);
    },
    onEditorReady(editor) {
      // document.querySelector(".ql-preview").innerHTML =
      //   '<i class="ivu-icon ivu-icon-ios-eye" style="font-size: 20px; vertical-align: top !important;"></i>';
      // console.log("editor ready!", editor);
      this.$emit("onEditorBlur", editor.container.firstChild.innerHTML);
    }
  }
};
</script>

<style lang="less">
.ql-toolbar.ql-snow {
  padding: 4px !important;
}
.ql-container {
  font-size: 14px;
}
.ql-editor {
  min-height: 400px;
  font-size: 14px;
}
.ql-snow .ql-picker-label {
  line-height: 24px;
  vertical-align: top;
}
.ql-full-screen {
  border: 1px solid #ddd;
}
.ql-indent-loop(@n, @i:1) when (@i <= @n) {
  .ql-indent-loop(@n, (@i+1));
  .ql-indent-@{i}:not(.ql-direction-rtl) {
    padding-left: 0 !important;
    text-indent: @i * 2em;
  }
}
.ql-editor {
  .ql-indent-loop(9, 1);
}
</style>
