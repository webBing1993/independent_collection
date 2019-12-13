<template>
  <div>
    <div :class="isPad ? 'collectionFail_ collectionFail' : isDevice ? 'collectionFail collectionFailDevice' : 'collectionFail'" v-show="collectionFail">
      <div class="collection_title">
        <span>{{payType == 1 ? '收款' : '预授权收款'}}</span>
      </div>
      <div class="collection_content">
        <div class="fail_content">
          <div class="fail_icon"><img src="../../assets/ic-waring.png" alt=""></div>
          <div class="fail_reason">
            <div class="title">支付失败</div>
            <div class="reason">原因：{{reason}}</div>
          </div>
        </div>
        <div class="btns" @click="goBack"><span>我知道了</span></div>
      </div>
    </div>
    <loadingList v-if="loadingShow" :loadingText="loadingText" style="width: calc(100vw)"></loadingList>
  </div>
</template>

<script>
  import {mapState,mapActions} from 'vuex';
  import loadingList from './loading.vue'
  export default {
    name: 'collectionFail',
    components: {loadingList},
    data () {
      return {
        loadingShow: false,  // loading
        loadingText: '加载中...',    // loading 语
        collectionFail: false,   // 模板的显示和隐藏
        payType: sessionStorage.getItem('payType') ? sessionStorage.getItem('payType') : 1,   // 1表示收款 2表示预授权收款
        reason: sessionStorage.getItem('codeResult') ? sessionStorage.getItem('codeResult') != 'null' ? sessionStorage.getItem('codeResult').indexOf(':') != -1 ? sessionStorage.getItem('codeResult').split(':')[1] : '支付超时了' : sessionStorage.getItem('codeResult') : '支付超时了', // 支付失败的原因
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false,  // 判断是否是移动iPad
        isDevice: sessionStorage.getItem('isDevice') == 'true' ? true : false,  // 判断是否是双屏设备
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto',
      ]),

      goBack () {
//        this.replaceto('/makeCollections');
        this.goto(-1)
      }

    },
    mounted () {
      this.collectionFail = true;
      if (this.isPad) {
        window.getBack = this.goBack;
      }
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .collectionFail {
    .collection_title {
      border-bottom: 1px solid #EEEEEE;
      padding: 2.2vw 3.1vw;
      text-align: center;
      color: #666;
      font-size: .56rem;
      position: fixed;
      width: 93.8vw;
      background-color: #fff;
      left: 0;
      top: 0;
      z-index: 1;
    }
    .collection_content {
      position: fixed;
      transform: translate(-50%, -50%);
      left: 50%;
      top: 50%;
      .fail_content {
        display: flex;
        justify-content: center;
        align-items: center;
        .fail_icon {
          margin-right: .44rem;
          img {
            display: inline-flex;
            width: 1.68rem;
          }
        }
        .fail_reason {
          text-align: left;
          .title {
            color: #333;
            font-size: .68rem;
            margin-bottom: .42rem;
            font-family: 'SourceHanSansCN-Medium';
          }
          .reason {
            color: #888;
            font-size: .48rem;
            line-height: 1.4;
          }
        }
      }
      .btns {
        margin-top: 12vw;
        text-align: center;
        span {
          display: inline-block;
          background: #4C88FF;
          border-radius: 40px;
          width: 7.8rem;
          padding: .38rem 0;
          color: #fff;
          font-size: .48rem;
          text-align: center;
        }
      }
    }
  }

  .collectionFail_ {
    .collection_title {
      padding: 12px 15px;
      width: calc(100vw - 30px);
      font-size: 18px;
    }
    .collection_content {
      .fail_content {
        .fail_icon {
          margin-right: 15px;
          img {
            width: 38px;
          }
        }
        .fail_reason {
          .title {
            font-size: 18px;
            margin-bottom: 6px;
          }
          .reason {
            font-size: 14px;
          }
        }
      }
      .btns {
        margin-top: 60px;
        span {
          border-radius: 40px;
          width: 240px;
          padding: 8px 0;
          font-size: 14px;
          letter-spacing: 4px;
        }
      }
    }
  }

  .collectionFailDevice {
    .collection_title {
      padding: 20px 60px;
      font-size: 26px;
      width: calc(100vw -120px);
    }
    .collection_content {
      .fail_content {
        .fail_icon {
          margin-right: 40px;
          img {
            width: 100px;
          }
        }
        .fail_reason {
          text-align: left;
          .title {
            font-size: 44px;
            margin-bottom: 26px;
          }
          .reason {
            font-size: 30px;
          }
        }
      }
      .btns {
        margin-top: 200px;
        span {
          width: 450px;
          padding: 20px 0;
          font-size: 26px;
        }
      }
    }
  }

</style>
