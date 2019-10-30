<template>
  <div>
    <div class="homeIndex" v-show="showIndex">
      <div class="index_title">
        <img src="../../assets/ic_chevron_left.png" alt="">
        <span>欢迎使用移动收银</span>
      </div>
      <div class="index_content">
        <div class="imgLists">
          <div class="list" @click="goto('/makeCollections')"><img src="../../assets/index_1.png" alt=""></div>
          <div class="list" @click="goto('/preLicensing')"><img src="../../assets/index_2.png" alt=""></div>
          <div class="list" @click="goto('/transactionQuery')"><img src="../../assets/index_3.png" alt=""></div>
        </div>
      </div>
    </div>
    <loadingList v-if="loadingShow" :loadingText="loadingText" style="width: calc(100vw)"></loadingList>
  </div>
</template>

<script>
  import {mapState,mapActions} from 'vuex';
  import loadingList from './loading.vue'
  export default {
    name: 'index',
    components: {loadingList},
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...',    // loading 语
        showIndex: false,   // 显示,隐藏 模板
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto',
      ]),

    },
    beforeMount () {
      this.showIndex = false;
      // 这里面要处理是否满足登录条件，没有就要跳转到登录页去
      let userAgentInfo = navigator.userAgent;
      let Agents = ["Android-Reception"];   // Android移动iPad
      let Agents_ = ["FortrunRZT"];         // 双屏设备
      let isIpad = false, isDevice = false;
      for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) != -1) {
          isIpad = true;
          break;
        }else if (userAgentInfo.indexOf(Agents_[v]) != -1) {
          isDevice = true;
        }
      }
      sessionStorage.setItem('isDevice', isDevice);
      sessionStorage.setItem('isPad', isIpad);
      if (!isDevice && !isIpad) {
          this.replaceto('/login');
      }
    },
    mounted () {
      this.showIndex = true;
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .homeIndex {
    .index_title {
      border-bottom: 1px solid #EEEEEE;
      padding: .56rem .8rem;
      position: relative;
      text-align: center;
      span {
        color: #666;
        font-size: .56rem;
      }
      img {
        position: absolute;
        left: .8rem;
        top: 50%;
        transform: translateY(-50%);
        display: block;
        width: .96rem;
        height: .96rem;
      }
    }
    .index_content {
      padding: 2.16rem 2.88rem 0;
      .imgLists {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .list {
          img {
            display: inline-flex;
            width: 5.8rem;
          }
        }
      }
    }
  }

</style>
