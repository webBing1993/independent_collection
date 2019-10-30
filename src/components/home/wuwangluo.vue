<template>
  <div>
    <div class="wuwangluo">
      <img src="../../assets/wangluocuowu.png" alt="">
      <p>网络连接异常，请检查网络</p>
    </div>
  </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  export default {
    name: 'wuwangluo',
    data () {
      return {

      }
    },
    methods: {
      ...mapActions([

      ]),

    },

    mounted () {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .wuwangluo {
    position: fixed;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    img {
      width: 160px;
    }
    p {
      font-size: 28px;
      color: #303133;
      margin-top: 40px;
    }
  }

</style>
