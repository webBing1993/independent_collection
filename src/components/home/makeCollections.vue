<template>
  <div>
    <div class="makeCollections" v-show="showMakeCollections">
      <div class="collection_title">
        <img src="../../assets/ic_chevron_left.png" alt="" @click="goto(-1)">
        <span class="quitBtn" @click="quit = true;">退出</span>
      </div>
      <div class="collection_content">
        <!-- 输入金额-->
        <div class="collectionContent">
          <div class="collectionContent_fl">
            <div class="input">
              <span>¥</span>
              <input type="number" placeholder="0.0" v-model="moneyVal" ref="numberWidth" @input="changeInput(moneyVal)" v-if="!isPad">
              <input type="number" placeholder="0.0" v-model="moneyVal" ref="numberWidth"  v-else disabled>
            </div>
            <div class="keyBords">
              <span v-for="item in keyBords" @click=" keyEntry($event, item)"><span>{{item}}</span></span>
              <span  @click="keyCancel($event)"><img src="../../assets/ic-close_.png" alt=""></span>
            </div>
          </div>
          <div class="collectionContent_fr">
            <!-- 发起收款btn-->
            <div class="btn" v-if="config.collection" @click="makeCollection(1)"><img src="../../assets/btn1.png" alt=""></div>
            <!-- 发起预授权btn-->
            <div class="btn" v-if="config.preLicensing" @click="makeCollection(2)"><img src="../../assets/btn2.png" alt=""></div>
            <div class="tig">
              <span>支持</span>
              <img src="../../assets/ic-wx.png" alt="">
              <img src="../../assets/ic-zfb.png" alt="">
              <span>付款方式</span>
            </div>
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
    name: 'makeCollections',
    components: {loadingList, toast},
    data () {
      return {
        toastShow: false,   // toast
        toastTxt: '',       // toast txt
        loadingShow: false,  // loading
        loadingText: '加载中...',    // loading 语
        showMakeCollections: false,   // 显示,隐藏 模板
        quit: false,      // 是否退出
        moneyVal: '',     // 输入的金额
        keyBords: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'],     // 键盘
        config: {
          collection: true,   // 收款权限
          preLicensing: true,  // 预授权权限
        },   // 相关权限
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false,  // 判断是否是移动iPad
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto',
      ]),

      // 监听input
      changeInput (val) {
        let len = val.length;
        if (len >= 14) {
          len = 14;
        }
        this.$refs.numberWidth.style.width = (30 + len * 24) + 'px';
      },

      // 键盘事件
      keyEntry(event, item) {
        event.preventDefault();
        this.moneyVal+=item;
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
          this.toastTxt = '请输入收款金额';
          this.toastShow = true;
        }else {
          sessionStorage.setItem('moneyVal', this.moneyVal);
          sessionStorage.setItem('payType', type);
          this.goto('/collectionStatus');
        }
      },

      // 退出事件
      sure() {
        // 需要根据不同登录点去返回
      },
    },
    mounted () {
      this.showMakeCollections = true;
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .makeCollections {
    .collection_title {
      border-bottom: 1px solid #EEEEEE;
      padding: .56rem .8rem;
      position: relative;
      text-align: left;
      img {
        display: inline-block;
        width: .96rem;
        height: .96rem;
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
      .collectionContent {
        padding: 1.5rem 3.98rem 0 4.24rem;
        display: flex;
        justify-content: space-between;
        .collectionContent_fl {
          width: 7.6rem;
          .input {
            border-bottom: 2px solid #979797;
            padding: .52rem .1rem;
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
            padding-top: .88rem;
            span {
              cursor: pointer;
              display: inline-block;
              width: 2.24rem;
              height: 1.33rem;
              text-align: center;
              line-height: 1.33rem;
              background: #F7F7F7;
              border-radius: 3.03px;
              color: #333;
              font-size: .58rem;
              text-shadow: 0 2px 3px rgba(0,0,0,0.04);
              margin: 0 .4rem .4rem 0;
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
              }
              img {
                width: .97rem;
                height: .63rem;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
              }
            }
            span:nth-of-type(3n) {
              margin-right: 0;
            }
            span:active {
              background-color: #1AAD19;
              color: #f1f1f1;
            }
          }
        }
        .collectionContent_fr {
          width: 6.8rem;
          margin-top: 2.8rem;
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
            margin-top: .9rem;
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
