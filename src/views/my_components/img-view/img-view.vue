<template>
  <!-- 过渡动画 -->
  <transition name="fade">
    <div class="img-view" @click="imgView">
      <!-- 遮罩层 -->
      <div class="img-layer">
        <img :src="imgSrc">
        <Icon type="close-circled" class="img-close" size="30" @click="imgView"></Icon>
        <Spin fix>
          <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
          <div>Loading</div>
        </Spin>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: ["imgSrc"],
  methods: {
    imgView() {
      // 发送事件
      this.$emit("click");
    }
  }
};
</script>
<style lang="less" scoped>
/*动画*/
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s linear;
  transform: translate3D(0, 0, 0);
}
.fade-enter,
.fade-leave-active {
  transform: translate3D(100%, 0, 0);
}

/* bigimg */
.img-view {
  position: relative;
  width: 100%;
  height: 100%;
  .ivu-spin-fix {
    background: rgba(0, 0, 0, 0) !important;
    color: #fff;
  }
  /*遮罩层样式*/
  .img-layer {
    position: fixed;
    z-index: 10000;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.7);
    width: 100%;
    height: 100%;
    overflow: hidden;
    /*不限制图片大小，实现居中*/
    img {
      max-width: 100%;
      max-height: 100%;
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      z-index: 10000;
    }
  }
}

.img-close {
  position: absolute;
  top: 15px;
  right: 15px;
  color: #fff;
  cursor: pointer;
  z-index: 10000;
  transition: all 0.2s linear;
  transform: translate3D(0, 0, 0);
  &:hover {
    transform: rotate(90deg);
    -ms-transform: rotate(90deg); /* IE 9 */
    -moz-transform: rotate(90deg); /* Firefox */
    -webkit-transform: rotate(90deg); /* Safari 和 Chrome */
    -o-transform: rotate(90deg); /* Opera */
  }
}
</style>
