<template>
  <div>
    <div :class="isPad ? 'makeCollections makeCollections_' : 'makeCollections'" v-show="showMakeCollections">
      <div class="collection_title">
        <img src="../../assets/ic_chevron_left.png" alt="" @click="goBack">
        <span class="quitBtn" @click="quit = true;" v-if="!isDevice && !isPad">退出</span>
      </div>
      <div class="depositTip" v-if="depositTip && configList.depositNative">
        <span>
          受限于第三方支付规则，预授权自动撤销时间为交易日后的第30天
        </span>
        <img src="../../assets/ic_pinkclose.png" alt="" @click="depositTipShow">
      </div>
      <div class="collection_content">
        <!-- 输入金额-->
        <div class="collectionContent">
          <div class="collectionContent_fl">
            <div class="input">
              <span>¥</span>
              <input type="text" placeholder="0.0" v-model="moneyVal" ref="numberWidth" @input="changeInput(moneyVal)" v-if="!isPad">
              <input type="text" placeholder="0.0" v-model="moneyVal" ref="numberWidth"  v-else disabled>
            </div>
            <div class="keyBords">
              <span v-for="item in keyBords" @click=" keyEntry($event, item)"><span>{{item}}</span></span>
              <span  @click="keyCancel($event)"><img src="../../assets/ic-close_.png" alt=""></span>
            </div>
          </div>
          <div class="collectionContent_fr">
            <!-- 发起收款btn-->
            <div class="btn" @click="makeCollection(1)" v-if="configList.depositAuth && (support.aliPay.nativePay || support.weixinPay.nativePay)"><img src="../../assets/btn1.png" alt=""></div>
            <!-- 发起预授权btn-->
            <div class="btn" @click="makeCollection(2)" v-if="configList.depositNative && (support.weixinPay.depositPay || support.aliPay.depositPay)"><img src="../../assets/btn2.png" alt=""></div>
            <div class="tig">
              <span>支持</span>
              <img src="../../assets/ic-wx.png" alt="" v-if="support.weixinPay.depositPay || support.weixinPay.nativePay">
              <img src="../../assets/ic-zfb.png" alt="" v-if="support.aliPay.depositPay || support.aliPay.nativePay">
              <span>付款方式</span>
            </div>
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
      <img src="../../assets/ic-reach.png" alt="">
      <p>正在查询支付状态</p>
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
    name: 'makeCollections',
    components: {loadingList, toast},
    data () {
      return {
        toastShow: false,   // toast
        toastTxt: '',       // toast txt
        loadingShow: false,  // loading
        loadingText: '加载中...',    // loading 语
        showMakeCollections: false,   // 显示,隐藏 模板
        depositTip: sessionStorage.getItem('depositTip') == 'false' ? false : true, // 预授权提示语
        quit: false,      // 是否退出
        moneyVal: '',     // 输入的金额
        keyBords: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'],     // 键盘
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false,  // 判断是否是移动iPad
        isDevice: sessionStorage.getItem('isDevice') == 'true' ? true : false,  // 判断是否是双屏设备
        payType: 1, // 1 收款 2 预授权
        payChannel: '',   // 判断是支付宝还是微信支付
        toastTip: false,
        configList: {
          depositAuth: false,   // 收款
          depositNative: false,  // 预授权
        },   // 权限
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
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto', 'supportList', 'codeAuth', 'orderReach'
      ]),

      // 返回上一页
      goBack() {
        this.goto(-1);
      },

      // 预授权提示语
      depositTipShow() {
        this.depositTip = false;
        sessionStorage.setItem('depositTip', false);
      },

      // 监听input
      changeInput (val) {
        let len = val.length;
        if (len > 14) {
          len = 14;
        }
        if (this.isPad) {
          this.$refs.numberWidth.style.width = (46 + len * 13) + 'px';
        }else {
          this.$refs.numberWidth.style.width = (30 + len * 24) + 'px';
        }
      },

      // 键盘事件
      keyEntry(event, item) {
        event.preventDefault();
        if (!/^\d+$/.test(parseFloat(this.moneyVal) * 10) && this.moneyVal != '' && this.moneyVal.length != 0) {
          return;
        }else {
          this.moneyVal+=item;
        }
        this.changeInput(this.moneyVal);
      },

      // 键盘删除事件
      keyCancel(event) {
        event.preventDefault();
        this.moneyVal = this.moneyVal.substr(0, this.moneyVal.length - 1);
        this.changeInput(this.moneyVal);
      },

      // 跳转
      makeCollection (type) {
        // type 1表示收款 2表示预授权
        if (this.moneyVal.length == 0) {
          this.$toastMsg({
            toastTip: true,
            toastTxt_: '请输入收款金额',
          });
        }else if (this.moneyVal == 0) {
          this.$toastMsg({
            toastTip: true,
            toastTxt_: '请输入正确的收款金额',
          });
        }else {
          sessionStorage.setItem('moneyVal', this.moneyVal);
          sessionStorage.setItem('payType', type);
          this.payType = type;
          if (this.isPad) {
            window.android.scanQrCode();
          }else {
            this.goto('/collectionStatus');
          }
        }
      },

      // 退出事件
      sure() {
        // 需要根据不同登录点去返回
        if (sessionStorage.getItem('isPad') == 'true') {
          window.android.closeWebView();
        }else if (sessionStorage.getItem('isDevice') == 'true') {
          jsObj.LogOut();
        }else {
          this.replaceto('/login')
        }
      },

      // 获取权限，是否支持微信付款和支付宝付款
      getSupport() {
        this.supportList({
          deviceId: sessionStorage.getItem('deviceId'),
          onsuccess: body => {
            if (body.data.code == 0 || body.data.errcode == 0) {
              this.support = body.data.data;
              sessionStorage.setItem('support', JSON.stringify(body.data.data));
            }
            this.showMakeCollections = true;
          },
          onfail: body => {
            this.showMakeCollections = true;
          },
          onerror: bdoy => {
            this.showMakeCollections = true;
          }
        })
      },

      // 通过付款成功和失败进行跳转
      collectionResult(status, orderId, deviceId) {
          console.log('status', status);
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
              if (body.data.code == 0 || body.data.errcode == 0) {
                this.orderReasult(body.data.data.flowId);
              }else {
                this.toastTip = false;
                if (this.isDevice) {
                  // 双屏设备
                  setTimeout(() => {
                    jsObj.OpenBarCode();
                  }, 3000);
                }
              }
            },
            onfail: body => {
              this.toastTip = false;
            },
            onerror: body => {
              this.toastTip = false;
            }
          })
        }else {
          // 失败
          this.goto('/collectionFail');
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
                sessionStorage.setItem('collectionSuccessList', JSON.stringify(body.data.data.data));
                this.replaceto('/collectionSuccess');
              }else if (body.data.data.result == 'INIT' || body.data.data.result == 'PAYING') {
                let num = 0;
                if (num >= 65) {
                  // 失败
                  sessionStorage.setItem('codeResult', body.data.data.desc);
                  this.goto('/collectionFail');
                  return;
                }
                setTimeout(() => {
                  num++;
                  this.orderReasult(orderId);
                },1000)
              }else {
                this.toastTip = false;
                // 失败
                sessionStorage.setItem('codeResult', body.data.data.desc);
                this.goto('/collectionFail');
              }
            }else {
              this.toastTip = false;
              // 失败
              sessionStorage.setItem('codeResult', body.data.errmsg || body.data.msg);
              this.goto('/collectionFail');
            }
          },
          onfail: body => {
            this.toastTip = false;
            // 失败
            sessionStorage.setItem('codeResult', body.data.errmsg || body.data.msg);
            this.goto('/collectionFail');
          },
          onerror: body => {
            this.toastTip = false;
            if (this.isDevice) {
              jsObj.CloseBarCode();
            }
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
              this.payChannel = 'WEIXINPAY';
              this.collectionResult(0, str, deviceId);
            }else {
              this.$toastMsg({
                toastTip: true,
                toastTxt_: '不支持此类型二维码',
              });
            }
          }else if (((str.length >= 16 || str.length <= 24) && (parseInt(strTwo) >= 25 || parseInt(strTwo) <= 24))) {
            //  为支付宝的授权码
            if ((this.payType == 2 && this.support.aliPay.depositPay) || (this.payType == 1 && this.support.aliPay.nativePay)) {
              this.toastTip = true;
              this.payChannel = 'ALIPAY';
              this.collectionResult(0, str, deviceId);
            }else {
              this.$toastMsg({
                toastTip: true,
                toastTxt_: '不支持此类型二维码',
              });
            }
          }else {
            this.toastTip = false;
            sessionStorage.setItem('codeResult', '二维码不合法');
            this.collectionResult(1);
          }
        }else {
          this.toastTip = false;
          sessionStorage.setItem('codeResult', '二维码不合法');
          this.collectionResult(1);
        }
      },

    },
    mounted () {
      this.showMakeCollections = false;
      this.getSupport();

      if (this.isPad) {
        window.getSweepIpadOrderId = this.getCode;
        window.getBack = this.goBack;
      }

      // 权限
      let arr = sessionStorage.getItem('configList') ? JSON.parse(sessionStorage.getItem('configList')) : [];
      arr.forEach(item => {
        if (item.authority == 'independent_trade_receipt_native_pay') {
          this.configList.depositAuth = true;
        }
        if (item.authority == 'independent_trade_receipt_deposit_auth') {
          this.configList.depositNative = true;
        }
      });
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .makeCollections {
    .collection_title {
      border-bottom: 1px solid #EEEEEE;
      padding: 2.2vw 3.1vw;
      position: fixed;
      background-color: #fff;
      width: 93.8vw;
      left: 0;
      top: 0;
      z-index: 1;
      text-align: left;
      img {
        display: inline-block;
        width: 3.8vw;
        height: 3.8vw;
      }
      span {
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
    .depositTip {
      z-index: 1;
      position: fixed;
      left: 0;
      top: 8.2vw;
      background-color: #ffebed;
      width: calc(100vw - 1.24rem);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: .16rem .72rem .16rem .52rem;
      span {
        font-size: .32rem;
        color: #ff5870;
      }
      img {
        width: .24rem;
        display: inline-flex;
      }
    }
    .collection_content {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -45%);
      width: 100vw;
      .collectionContent {
        padding: 0 15.6vw 0 ;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        .collectionContent_fl {
          width: 48%;
          .input {
            border-bottom: 2px solid #979797;
            padding: 1.2vw .1rem;
            text-align: right;
            width: calc(100% - .2rem);
            input {
              outline: none;
              border: none;
              width: 1.4rem;
              font-size: .88rem;
              color: #3A3A3A;
              display: inline-block;
              background-color: transparent;
            }
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
              -webkit-appearance: none;
            }
            input[type="number"]{
              -moz-appearance: textfield;
            }
            span {
              color: #888888;
              font-size: .54rem;
              margin-right: .1rem;
            }
          }
          .keyBords {
            padding-top: 2vw;
            span {
              cursor: pointer;
              display: inline-block;
              width: 29.6%;
              height: 5.7vw;
              text-align: center;
              line-height: 5.7vw;
              background: #F7F7F7;
              border-radius: 3.03px;
              color: #333;
              font-size: .58rem;
              text-shadow: 0 2px 3px rgba(0,0,0,0.04);
              margin: 0 1.2vw 1.2vw 0;
              position: relative;
              -moz-user-select:none;
              -ms-user-select: none;
              -webkit-user-select: none;
              user-select: none;
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
              span {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
              }
              img {
                width: .97rem;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
              }
            }
            span:nth-of-type(3n) {
              margin-right: 0;
            }
            span:nth-of-type(n+10) {
              margin-bottom: 0;
            }
            span:active {
              background-color: #1AAD19;
              color: #f1f1f1;
            }
          }
        }
        .collectionContent_fr {
          width: 48%;
          .btn {
            width: 100%;
            margin-bottom: .6rem;
            cursor: pointer;
            img {
              width: 100%;
              display: block;
            }
          }
          .tig {
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
  }
  .makeCollections_ {
    .collection_title {
      padding: 12px 15px;
      width: calc(100vw - 30px);
      img {
        width: 30px;
        height: 30px;
      }
      span {
        font-size: 18px;
      }
    }
    .depositTip {
      z-index: 1;
      position: fixed;
      left: 0;
      top: 42px;
      background-color: #ffebed;
      width: calc(100vw - 62px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 36px 8px 26px;
      span {
        font-size: 16px;
        color: #ff5870;
      }
      img {
        width: 12px;
        display: inline-flex;
      }
    }
    .collection_content {
      .collectionContent {
        align-items: flex-start;
        padding: 0 18vw 0 ;
        .collectionContent_fl {
          width: 46%;
          .input {
            padding: 5px 3px;
            width: calc(100% - .2rem);
            border-bottom: 1px solid #e4e4e4;
            input {
              width: 46px;
              font-size: 34px;
            }
            span {
              font-size: 16px;
            }
          }
          .keyBords {
            padding-top: 2vw;
            span {
              width: 29.6%;
              height: 5.4vw;
              line-height: 5.4vw;
              font-size: 36px;
              margin: 0 1.2vw 1.2vw 0;
              img {
                width: 32px;
              }
            }
            span:active {
              background-color: #4C88FF;
            }
          }
        }
        .collectionContent_fr {
          width: 38%;
          margin-top: 70px;
          .btn {
            margin-bottom: 15px;
          }
          .tig {
            margin-top: 12px;
            span {
              font-size: 14px;
            }
            img {
              width: 18px;
              margin-left: 10px;
            }
            img:last-of-type {
              margin-right: 10px;
            }
            img:only-of-type {
              margin: 0 10px;
            }
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
      background-color: rgba(0, 0, 0, .7);
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
  }

  .toastTip_ {
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
