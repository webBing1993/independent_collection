<template>
    <div style="position: fixed;z-index: 99999999;left: 0;top: 50%;transform: translate(0, -50%);">
      <div :class="isPad ? 'loading isPad' : 'loading'" ref="loading">
        <img src="../../assets/loading.gif" alt="">
        <p>{{loadingText}}</p>
      </div>
    </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';

  export default {
    props: ['loadingText'],
    data () {
      return {
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false
      }
    },
    watch: {
      loadingText: function (val) {
        console.log(val);   // 接收父组件的值
      },
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

  .loading {
    width: 100%;

    img {
      width: 180px;
      display: block;
      margin: 0 auto;
    }
    p {
      font-size: 26px;
      color: #000;
      text-align: center;
      height: 30px;
    }
  }

  .isPad {
    img {
      width: 100px;
    }
    p {
      font-size: 16px;
      color: #000;
      text-align: center;
      height: 30px;
    }
  }

</style>
