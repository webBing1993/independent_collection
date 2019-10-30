<template>
  <div>
    <div class="collectionStatus">
      <div class="collection_title">
        <img src="../../assets/ic_chevron_left.png" alt="" @click="goto(-1)">
        <span class="quitBtn" @click="quit = true;">退出</span>
      </div>
      <div class="collection_content">
        <div class="collection_fl"><img src="../../assets/collection.png" alt=""></div>
        <div class="collection_fr">
          <div class="collection_money">
            <span>{{payType == 1 ? "收款金额" : "预授权金额"}}</span>
            <span>¥ <span>{{moneyVal}}</span></span>
          </div>
          <div class="tips">
            <div class="tip"><span>请住客出示付款码</span></div>
            <div class="tip"><img src="../../assets/ic-down.png" alt=""></div>
            <div class="tip"><span>靠近扫码设备</span></div>
          </div>
          <div class="tig">
            <span>支持</span>
            <img src="../../assets/ic-wx.png" alt="">
            <img src="../../assets/ic-zfb.png" alt="">
            <span>付款方式</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 退出弹框提示-->
    <div class="quit" v-if="quit">
      <div class="shadow"></div>
      <div class="quit_content">
        <div class="quit_title">是否确认退出？</div>
        <div class="quit_tabs">
          <span class="cancel" @click="quit=false">取消</span>
          <span class="sure" @click="sure">确认</span>
        </div>
      </div>
    </div>
    <loadingList v-if="loadingShow" :loadingText="loadingText" style="width: calc(100vw)"></loadingList>
    <toast :toastTxt="toastTxt" v-if="toastShow"></toast>
  </div>
</template>

<script>
  import {mapState,mapActions} from 'vuex';
  import loadingList from './loading.vue'
  import toast from './toast.vue'
  export default {
    name: 'collectionStatus',
    components: {loadingList, toast},
    data () {
      return {
        toastShow: false,   // toast
        toastTxt: '',       // toast txt   正在查询支付状态
        loadingShow: false,  // loading
        loadingText: '加载中...',    // loading 语
        payType: sessionStorage.getItem('payType') ? sessionStorage.getItem('payType') :1,   // 1表示收款 2表示预授权收款
        moneyVal: sessionStorage.getItem('moneyVal') ? sessionStorage.getItem('moneyVal') : '0.00', // 金额
        quit: false,      // 是否退出
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto',
      ]),

      // 退出事件
      sure() {
        // 需要根据不同登录点去返回
      },

      // 通过付款成功和失败进行跳转
      collectionResult(status) {
        if (status == 0) {
          // 成功
          this.replaceto('/collectionSuccess');
        }else {
          // 失败
          this.replaceto('/collectionFail');
        }
      },
    },
    mounted () {
      setTimeout(() => {
          this.collectionResult(0);
      })
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .collectionStatus {
    .collection_title {
      border-bottom: 1px solid #EEEEEE;
      padding: .56rem .8rem;
      position: relative;
      text-align: left;
      img {
        display: inline-block;
        width: .56rem;
        height: .56rem;
      }
      span {
        position: absolute;
        right: .8rem;
        top: 50%;
        transform: translateY(-50%);
        background: #F7F7F7;
        border-radius: 4px;
        font-size: .4rem;
        padding: .26rem .5rem;
        color: #666;
      }
    }
    .collection_content {
      padding: 2.28rem 2.48rem;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .collection_fl {
        img {
          display: block;
          width: 8.86rem;
        }
      }
      .collection_fr {
        margin-left: 2.24rem;
        .collection_money {
          text-align: left;
          span:first-of-type {
            color: #666;
            font-size: .48rem;
          }
          span:nth-of-type(2) {
            margin: 0 .22rem 0 .38rem;
            color: #FF4B66;
            font-size: .68rem;
            span {
              color: #FF4B66;
              font-size: 1.2rem;
            }
          }
        }
        .tips {
          margin-top: 1.34rem;
          .tip {
            width: 6.36rem;
            display: block;
            margin-bottom: .2rem;
            span {
              display: block;
              width: 100%;
              opacity: 0.34;
              background: #BAF0FC;
              border-radius: 6px;
              height: 1.18rem;
              line-height: 1.18rem;
              text-align: center;
              color: #252E5B;
              font-size: .48rem;
            }
            img {
              display: block;
              margin: 0 auto;
              width: .74rem;
              height: .88rem;
            }
          }
        }
        .tig {
          margin-top: 1.14rem;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          span {
            color: #AEAEAE;
            font-size: .44rem;
          }
          img {
            width: .52rem;
            margin-left: .28rem;
          }
          img:last-of-type {
            margin-right: .28rem;
          }
        }
      }
    }
  }

  .quit {
    .shadow {
      position: fixed;
      z-index: 10;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, .6);
    }
    .quit_content {
      background: #FFFFFF;
      border-radius: 20px;
      width: 375px;
      position: fixed;
      z-index: 12;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      .quit_title {
        padding: 50px 30px;
        border-bottom: 1px solid #D8D8D8;
        color: #0B0B0B;
        font-size: 26px;
        text-align: center;
        font-weight: bold;
      }
      .quit_tabs {
        display: flex;
        justify-content: center;
        span {
          display: inline-block;
          width: 50%;
          position: relative;
          padding: 30px 0;
          font-size: 24px;
          text-align: center;
        }
        span:first-of-type {
          color: #909399;
        }
        span:last-of-type {
          color: #1AAD19;
        }
        span:first-of-type:after {
          content: '';
          display: block;
          background-color: #D8D8D8;
          width: 1px;
          height: 64px;
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
  }

</style>
