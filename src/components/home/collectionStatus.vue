<template>
  <div>
    <div :class="isDevice ? 'collectionStatus collectionStatus_' : 'collectionStatus'">
      <div class="collection_title">
        <div class="goBackBtn"  @click="goBack">
          <img src="../../assets/ic_chevron_left.png" alt="">
          <span>返回</span>
        </div>
        <span class="quitBtn" @click="quit = true;" v-if="!isDevice && !isPad">退出</span>
      </div>
      <div class="collection_content">
        <div class="collection_fl"><img src="../../assets/collection.gif" alt=""></div>
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
            <img src="../../assets/ic-wx.png" alt="" v-if="support.weixinPay.depositPay || support.weixinPay.nativePay">
            <img src="../../assets/ic-zfb.png" alt="" v-if="support.aliPay.depositPay || support.aliPay.nativePay">
            <span>付款方式</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 退出弹框提示-->
    <div :class="isPad ? 'quit_ quit' : 'quit'" v-if="quit">
      <div class="shadow"></div>
      <div class="quit_content">
        <div class="quit_title">是否确认退出？</div>
        <div class="quit_tabs">
          <span class="cancel" @click="quit=false">取消</span>
          <span class="sure" @click="sure">确认</span>
        </div>
      </div>
    </div>

    <!-- 正在查询-->
    <div :class="isPad ? 'toastTip toastTip_' : 'toastTip'" v-if="toastTip">
      <div class="close" @click="closeToast"><img src="../../assets/ic-back-white_.png" alt=""></div>
      <img src="../../assets/ic-reach.png" alt="">
      <p>正在查询支付状态 <span>{{timeVal}}s</span></p>
    </div>

    <loadingList v-if="loadingShow" :loadingText="loadingText" style="width: calc(100vw)"></loadingList>
  </div>
</template>

<script>
  import {mapState,mapActions} from 'vuex';
  import loadingList from './loading.vue'

  export default {
    name: 'collectionStatus',
    components: {loadingList},
    data () {
      return {
        toastTip: false,   // toast
        timeVal: 120,
        timer: null,
        timer_: null,
        num: 0,
        loadingShow: false,  // loading
        loadingText: '加载中...',    // loading 语
        payType: sessionStorage.getItem('payType') ? sessionStorage.getItem('payType') :1,   // 1表示收款 2表示预授权收款
        moneyVal: sessionStorage.getItem('moneyVal') ? sessionStorage.getItem('moneyVal') : '0.00', // 金额
        quit: false,      // 是否退出
        payChannel: '',   // 判断是支付宝还是微信支付
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false,  // 判断是否是移动iPad
        isDevice: sessionStorage.getItem('isDevice') == 'true' ? true : false,  // 判断是否是双屏设备
        support: {
          weixinPay: {
            depositPay: true,
            nativePay: true,
          },
          aliPay: {
            depositPay: true,
            nativePay: true,
          }
        },  // 是否支持微信和支付宝收款、预授权
        payNum: 0,
        timeVal_: '',
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto', 'orderReach', 'codeAuth'
      ]),

      // 返回上一页
      goBack() {
        sessionStorage.removeItem('moneyVal');
        clearTimeout(this.timer);
        clearTimeout(this.timer_);
        let that = this;
        window.parent.sonPageClick(0);
        window.removeEventListener('message', that.eventMessage);
        let timer = setTimeout(() => {
          clearTimeout(timer);
          this.goto(-1);
        }, 100)
      },

      // 退出事件
      sure() {
        // 需要根据不同登录点去返回
        // 需要根据不同登录点去返回
        if (sessionStorage.getItem('isPad') == 'true') {
          window.android.closeWebView();
        }else if (sessionStorage.getItem('isDevice') == 'true') {
          jsObj.LogOut();
        }else {
          this.replaceto('/login')
        }
      },

      // 通过付款成功和失败进行跳转
      collectionResult(status, orderId, deviceId) {
          console.log('this.moneyVal', this.moneyVal);
        if (status == 0) {
          // 发起普通支付请求
          this.codeAuth({
            data: {
              authCode: orderId,
              amount: parseFloat(this.moneyVal)*100,
              action: this.payType == 1 ? 'NATIVE_PAY' : 'DEPOSIT_AUTH',
              deviceId: deviceId,
              payChannel: this.payChannel
            },
            onsuccess: body => {
              clearTimeout(this.timer);
              if (body.data.code == 0 || body.data.errcode == 0) {
                this.orderReasult(body.data.data.flowId);
              }else {
                this.toastTip = false;
                this.timeVal = 120;
                setTimeout(() => {
                  jsObj.OpenBarCode();
                }, 1000);
                this.num = 0;
                clearTimeout(this.timer_);
              }
            },
            onfail: body => {

            },
            onerror: body => {
              this.closeToast();
            }
          })
        }else {
          clearTimeout(this.timer);
          clearTimeout(this.timer_);
          // 失败
          this.$nextTick(() => {
            this.replaceto('/collectionFail');
          });
        }
      },

      orderReasult(orderId) {
        this.orderReach({
          data: {
            flowId: orderId
          },
          onsuccess: body => {
            if (body.data.code == 0 || body.data.errcode == 0) {
              // 成功
              if (body.data.data.result == 'SUCCESS') {
                this.toastTip = false;
                clearTimeout(this.timer);
                clearTimeout(this.timer_);
                sessionStorage.setItem('collectionSuccessList', JSON.stringify(body.data.data.data));
                this.$nextTick(() => {
                  this.replaceto('/collectionSuccess');
                })
              }else if (body.data.data.result == 'INIT' || body.data.data.result == 'PAYING') {
                if (this.num >= 125) {
                  // 失败
                  this.toastTip = false;
                  clearTimeout(this.timer);
                  clearTimeout(this.timer_);
                  sessionStorage.setItem('codeResult', body.data.data.desc);
                  this.$nextTick(() => {
                    this.replaceto('/collectionFail');
                  });
                  return;
                }else {
                  this.timer = setTimeout(() => {
                    this.num++;
                    this.orderReasult(orderId);
                  },1000)
                }
              }else {
                this.toastTip = false;
                clearTimeout(this.timer);
                clearTimeout(this.timer_);
                // 失败
                sessionStorage.setItem('codeResult', body.data.data.desc);
                this.$nextTick(() => {
                  this.replaceto('/collectionFail');
                })
              }
            }else {
              this.toastTip = false;
              clearTimeout(this.timer);
              clearTimeout(this.timer_);
              // 失败
              sessionStorage.setItem('codeResult', body.data.errmsg || body.data.msg);
              this.$nextTick(() => {
                this.replaceto('/collectionFail');
              })
            }
          },
          onfail: body => {
            this.toastTip = false;
            clearTimeout(this.timer);
            clearTimeout(this.timer_);
            // 失败
            sessionStorage.setItem('codeResult', body.data.errmsg || body.data.msg);
            this.$nextTick(() => {
              this.replaceto('/collectionFail');
            })
          },
          onerror: body => {
            this.closeToast();
          }
        })
      },

      // 判断传过来的字符串  1.先判断是否为数字型；2.再判断是否满足支付宝或者微信授权码的格式
      getCode(str, deviceId) {
        console.log("str", str);
        console.log("deviceId", deviceId);
        let reg = /^\d+(\.\d+)?$/; //非负浮点数
        if (reg.test(str)) {
          // 表示是数字型
          let strString = str.toString();   // 转化为字符串获取前两个个字符串进行比较
          let strTwo = strString.substring(0, 2);   // 获取前两个字符串
          if ((str.length == 18 && (parseInt(strTwo) >= 10) && parseInt(strTwo) <= 15)) {
            // 为微信的授权码
            if ((this.payType == 2 && this.support.weixinPay.depositPay) || (this.payType == 1 && this.support.weixinPay.nativePay)) {
              this.toastTip = true;
              this.timeTimer();
              this.payChannel = 'WEIXINPAY';
              this.collectionResult(0, str, deviceId);
            }else {
              this.$toastMsg({
                toastTip: true,
                toastTxt_: '不支持此类型二维码',
              });
            }
            return;
          }else if (((str.length >= 16 || str.length <= 24) && (parseInt(strTwo) >= 25 || parseInt(strTwo) <= 30))) {
            //  为支付宝的授权码
            if ((this.payType == 2 && this.support.aliPay.depositPay) || (this.payType == 1 && this.support.aliPay.nativePay)) {
              this.toastTip = true;
              this.timeTimer();
              this.payChannel = 'ALIPAY';
              this.collectionResult(0, str, deviceId);
            }else {
              this.$toastMsg({
                toastTip: true,
                toastTxt_: '不支持此类型二维码',
              });
            }
            return;
          }else {
            this.toastTip = false;
            clearTimeout(this.timer);
            clearTimeout(this.timer_);
            sessionStorage.setItem('codeResult', '二维码不合法');
            this.collectionResult(1);
          }
        }else {
          this.toastTip = false;
          clearTimeout(this.timer);
          clearTimeout(this.timer_);
          sessionStorage.setItem('codeResult', '二维码不合法');
          this.collectionResult(1);
        }
      },

      // 倒计时
      timeTimer() {
        if (this.timeVal == 0) {
          this.closeToast();
        }else {
          this.timeVal--;
          this.timer_ = setTimeout(() => {
            this.timeTimer();
          },1000);
        }

      },

      // 关闭toast
      closeToast () {
        this.toastTip = false;
        this.timeVal = 120;
        this.num = 0;
        this.payNum = 0;
        clearTimeout(this.timer);
        clearTimeout(this.timer_);
        let that = this;
        this.timeVal_ = new Date().getTime();
        jsObj.OpenBarCode(this.timeVal_.toString());
        window.parent.sonPageClick(0);
        window.removeEventListener('message', that.eventMessage);
        let timer = setTimeout(() => {
          window.parent.sonPageClick(1);
          console.log(11111);
          this.payNum++;
          window.addEventListener('message', that.eventMessage);
          clearTimeout(timer);
        }, 200)
      },

      eventMessage(event) {
        let data = event.data;
        console.log(data)
        switch (data.cmd) {
          case 'getParams':
            console.log('data.params.key', data.params.key);
            console.log('data.params.deviceId', data.params.deviceId);
            console.log('data.params.timeVal', data.params.timeVal);
            let that = this;
            window.parent.sonPageClick(0);
            window.removeEventListener('message', that.eventMessage);
            console.log('this.payNum', this.payNum);
            if (this.payNum == 1 && this.timeVal_ == data.params.timeVal) {
              this.getCode(data.params.key, data.params.deviceId);
            }
        }
      },
    },
    beforeMount () {
      this.support = sessionStorage.getItem('support') ? JSON.parse(sessionStorage.getItem('support')) : {};
    },
    mounted () {
      this.payNum = 0;
      this.closeToast();
    },
    destroyed() {
        console.log('销毁了');
      let that = this;
      window.parent.sonPageClick(0);
      window.removeEventListener('message', that.eventMessage);
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .collectionStatus {
    .collection_title {
      border-bottom: 1px solid #EEEEEE;
      padding: 2.2vw 3.1vw;
      position: fixed;
      width: 93.8vw;
      left: 0;
      top: 0;
      background-color: #fff;
      text-align: left;
      z-index: 1;
      .goBackBtn {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        img {
          width: 3.8vw;
        }
        span {
          font-size: .44rem;
          color: #333;
        }
      }
      .quitBtn {
        position: absolute;
        right: 3.1vw;
        top: 50%;
        transform: translateY(-50%);
        background: #F7F7F7;
        border-radius: 4px;
        font-size: .4rem;
        padding: 1vw 2vw;
        color: #666;
      }
    }
    .collection_content {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 87vw;
      padding: 0 6.5vw 0;
      display: flex;
      justify-content: center;
      align-items: center;
      .collection_fl {
        width: 40%;
        img {
          display: block;
          width: 100%;
        }
      }
      .collection_fr {
        margin-left: 3.1vw;
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
          margin-top: 5.6vw;
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
          margin-top: 4.2vw;
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
          img:only-of-type {
            margin: 0 .28rem;
          }
        }
      }
    }
  }

  .collectionStatus_ {
    .collection_title {
      padding: 20px 60px;
      width: calc(100vw - 120px);
      .goBackBtn {
        img {
          width: 34px;
        }
        span {
          font-size: 22px;
        }
      }
    }
    .collection_content {
      .collection_fl {
        width: 32%;
      }
      .collection_fr {
        margin-left: 64px;
        .collection_money {
          span:first-of-type {
            font-size: 26px;
          }
          span:nth-of-type(2) {
            margin: 0 24px 0 15px;
            font-size: 30px;
            span {
              font-size: 62px;
            }
          }
        }
        .tips {
          margin-top: 120px;
          .tip {
            width: 420px;
            margin-bottom: 20px;
            span {
              height: 78px;
              line-height: 78px;
              font-size: 30px;
              color: #171A28;
            }
            img {
              width: 40px;
              height: 48px;
            }
          }
        }
        .tig {
          margin-top: 80px;
          span {
            font-size: 20px;
          }
          img {
            width: 30px;
            margin-left: 30px;
          }
          img:last-of-type {
            margin-right: 30px;
          }
          img:only-of-type {
            margin: 0 30px;
          }
        }
      }
    }
  }

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
    z-index: 500;
    img {
      width: 1.03rem;
      display: block;
      margin: 1.1rem auto .66rem;
    }
    p {
      color: #fff;
      font-size: .56rem;
    }
    .close {
      position: absolute;
      right: 0;
      top: -1.38rem;
      img {
        display: block;
        width: .72rem;
        margin: 0;
      }
    }
  }

  .toastTip_ {
    width: 200px;
    height: 150px;
    img {
      width: 48px;
      display: block;
      margin: 20px auto 15px;
    }
    p {
      font-size: 14px;
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

  .quit_ {
    .quit_content {
      width: 200px;
      .quit_title {
        padding: 15px 10px;
        font-size: 16px;
      }
      .quit_tabs {
        span {
          padding: 10px 0;
          font-size: 14px;
        }
        span:first-of-type:after {
          height: 26px;
        }
      }
    }
  }

</style>
