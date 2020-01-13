<template>
  <div>
    <div :class="isPad ? 'isPad toastTip' : 'toastTip'" v-if="toastTip">
      <img src="../../assets/ic-tig.png" alt="">
      <p>{{toastTxt ? toastTxt : toastTxt_}}</p>
    </div>
  </div>
</template>

<script>
  import {mapState,mapActions} from 'vuex';
  export default {
    name: 'toastTip',
    props: ['toastTxt'],
    data () {
      return {
        toastTip: false,   // 提示显示 隐藏
        timer: null,
        toastTxt_: '',
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false,  // 判断是否是移动iPad
      }
    },
    methods: {
      ...mapActions([

      ]),

      // 显示隐藏
      showHide() {
        this.toastTip = true;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.toastTip = false;
        },2000)
      },
    },
    watch: {
      toastTxt: function (val) {
        console.log(val);   // 接收父组件的值
      },
    },
    mounted () {
        console.log(8888);
      this.showHide();
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .toastTip {
    opacity: 0.76;
    background: #000000;
    border-radius: 10px;
    width: 8.62rem;
    min-height: 4.28rem;
    text-align: center;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 500;
    img {
      width: 1.03rem;
      display: block;
      margin: 1.1rem auto .66rem;
    }
    p {
      color: #fff;
      font-size: .56rem;
      padding: 0 15px 15px;
    }
  }

  .isPad {
    width: 340px;
    height: 164px;
    img {
      width: 32px;
      display: block;
      margin: 46px auto 18px;
    }
    p {
      font-size: 18px;
      font-family: 'SourceHanSansCN-Medium';
    }
  }

</style>
