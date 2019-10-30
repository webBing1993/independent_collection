<template>
  <div>
    <div class="toastTip" v-if="toastTip">
      <img src="../../assets/ic-tig.png" alt="">
      <p>{{toastTxt}}</p>
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
      }
    },
    methods: {
      ...mapActions([

      ]),

    },
    watch: {
      toastTxt: function (val) {
        console.log(val);   // 接收父组件的值
      },
    },
    mounted () {
      this.toastTip = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.toastTip = false;
      },2000)
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
    height: 4.28rem;
    text-align: center;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
    img {
      width: 1.03rem;
      display: block;
      margin: 1.1rem auto .66rem;
    }
    p {
      color: #fff;
      font-size: .56rem;
    }
  }

</style>
