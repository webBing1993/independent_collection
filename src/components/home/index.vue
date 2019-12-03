<template>
  <div>
    <div :class="isIpad ? 'homeIndex_ homeIndex' : isDevice ? 'homeIndex homeDevice' : 'homeIndex '" v-show="showIndex">
      <div class="index_title">
        <div class="goBackBtn" @click="quitBack" v-if="!isDevice">
          <img src="../../assets/ic_chevron_left.png" alt="">
          <span>返回</span>
        </div>
        <span class="homeTitle">欢迎使用移动收银</span>
      </div>
      <div class="index_content">
        <div class="imgLists">
          <div class="list" @click="goMakeCollections(0)"><img src="../../assets/index_1.png" alt=""></div>
          <div class="list" @click="goMakeCollections(1)"><img src="../../assets/index_2.png" alt=""></div>
          <div class="list" @click="goMakeCollections(2)"><img src="../../assets/index_3.png" alt=""></div>
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
        isDevice: false,  // 判断是否是双屏
        isIpad: false,  // 判断是否是移动paid
        configList_: {
          trade: false,  // 独立支付
          trandeDeposit: false,  // 预授权
          trandeRecord: false,   // 交易查询
        },   // 权限
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto', 'configList'
      ]),

      // 获取deviceId
      getDeviceId(deviceId) {
        sessionStorage.setItem('deviceId', deviceId)
      },

      // 在线收款预授权
      goMakeCollections (type) {
        if (type == 0) {
          if (this.configList_.tradeREceipt) {
            if (this.isIpad || this.isDevice) {
              this.goto('/makeCollections');
            }else {
              this.$toastMsg({
                toastTip: true,
                toastTxt_: '浏览器不支持此功能',
              });
            }
          }else {
            this.$toastMsg({
              toastTip: true,
              toastTxt_: '该账户无使用权限，请联系管理员',
            });
          }
        }else if (type == 1) {
          if (this.configList_.trandeDeposit) {
            this.goto('/preLicensing')
          }else {
            this.$toastMsg({
              toastTip: true,
              toastTxt_: '该账户无使用权限，请联系管理员',
            });
          }
        }else {
          if (this.configList_.trandeRecord) {
            this.goto('/transactionQuery')
          }else {
            this.$toastMsg({
              toastTip: true,
              toastTxt_: '该账户无使用权限，请联系管理员',
            });
          }
        }
      },

      // 返回退出事件
      quitBack() {
        if (sessionStorage.getItem('isPad') == 'true') {
          window.android.closeWebView();
        }else if (sessionStorage.getItem('isDevice') == 'true') {
          jsObj.LogOut();
        }else {
          this.replaceto('/login')
        }
      },

      // 获取权限
      getConfigList() {
        this.configList({
          onsuccess: body => {
            console.log('1111', body);
            if (body.data.errcode == 0 || body.data.code == 0) {
                sessionStorage.setItem('configList', JSON.stringify(body.data.data.authorities));
                let noConfig = false; // 判断是否有权限
                if (body.data.data.authorities.length != 0) {
                  body.data.data.authorities.forEach(item =>{
                    if (item.authority == 'independent_trade_receipt') {
                      this.configList_.tradeREceipt = true;
                      noConfig = true;
                    }
                    if (item.authority == 'independent_trade_deposit') {
                      this.configList_.trandeDeposit = true;
                      noConfig = true;
                    }
                    if (item.authority == 'independent_trade_trading_record') {
                      this.configList_.trandeRecord = true;
                      noConfig = true;
                    }
                  });
                }
              if (!noConfig) {
                this.$toastMsg({
                  toastTip: true,
                  toastTxt_: '当前账号无支付收款权限',
                });
                setTimeout(() => {
                  if (sessionStorage.getItem('isPad') == 'true') {
                    window.android.forceLogout();
                  }else if (sessionStorage.getItem('isDevice') == 'true') {
                    jsObj.LogOut();
                  }else {
                    this.replaceto('/login')
                  }
                },2000);
              }
            }else if (body.data.code == 100002 ||body.data.errcode == 100002) {
              this.$toastMsg({
                toastTip: true,
                toastTxt_: '当前账号在其他设备上已登录',
              });
              setTimeout(() => {
                if (sessionStorage.getItem('isPad') == 'true') {
                  window.android.forceLogout();
                }else if (sessionStorage.getItem('isDevice') == 'true') {
                  jsObj.LogOut();
                }else {
                  this.replaceto('/login')
                }
              },2000);
            }
            this.loadingShow = false;
          },
          onfail: body => {
            this.loadingShow = false;
          },
          onerror: body => {
            this.loadingShow = false;
          }
        })
      },
    },
    beforeMount () {
      this.showIndex = false;

      let windowUrl = null;
      console.log( window.location.href);
      if (window.location.href.indexOf('cn') != -1) {
        windowUrl = window.location.href.split('.cn')[1].split('independent_collection')[0];
      }else {
        windowUrl = '/q/master/';
      }
      sessionStorage.setItem('windowUrl', windowUrl);

      // 这里面要处理是否满足登录条件，没有就要跳转到登录页去
      let userAgentInfo = navigator.userAgent;
      let Agents = ["Android-Reception"];   // Android移动iPad
      let Agents_ = ["FortrunRZT"];         // 双屏设备
      let that = this;
      for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) != -1) {
          that.isIpad = true;
          sessionStorage.tokenId = decodeURIComponent(window.location.href.split('token=')[1]);
          break;
        }else if (userAgentInfo.indexOf(Agents_[v]) != -1) {
          that.isDevice = true;
          sessionStorage.tokenId = decodeURIComponent(window.location.href.split('token=')[1]).split('/')[0];
          this.getDeviceId( decodeURIComponent(window.location.href.split('token=')[1]).split('/')[1]);
          break;
        }
      }
      sessionStorage.setItem('isDevice', that.isDevice);
      sessionStorage.setItem('isPad', that.isIpad);
      console.log('sessionStorage.tokenId', sessionStorage.tokenId);
      if (!that.isDevice && !that.isIpad && !sessionStorage.tokenId) {
        this.replaceto('/login');
      }
    },
    mounted () {
      console.log('isIpad', this.isIpad);
      this.showIndex = true;
      this.loadingShow = true;
      if (sessionStorage.tokenId) {
        this.getConfigList();
      }
      if (this.isIpad) {
        window.getBack = this.quitBack;
        window.getDeviceId = this.getDeviceId;
      }else if (this.isDevice) {
        // 接受父页面发来的信息
//        window.addEventListener('message', (event) => {
//          let data = event.data;
//          console.log(data);
//          switch (data.cmd) {
//            case 'getParams':
//              console.log('data.params.deviceId', data.params.deviceId);
//              this.getDeviceId(data.params.deviceId);
//          }
//        })
      }
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .homeIndex {
    .index_title {
      border-bottom: 1px solid #EEEEEE;
      padding: 2.2vw 3.1vw;
      position: fixed;
      width: 93.8vw;
      left: 0;
      top: 0;
      background-color: #fff;
      text-align: left;
      z-index: 2;
      .homeTitle {
        color: #666;
        font-size: .56rem;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
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
    }
    .index_content {
      width: 85vw;
      position: fixed;
      left: 50%;
      top: 55%;
      transform: translate(-50%, -50%);
      .imgLists {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .list {
          width: 25%;
          img {
            display: inline-flex;
            width: 100%;
          }
        }
      }
    }
  }

  .homeIndex_ {
    .index_title {
      padding: 12px 15px;
      width: calc(100vw - 30px);
      .goBackBtn {
        img {
          width: 30px;
        }
        span {
          font-size: 16px;
        }
      }
      .homeTitle {
        font-size: 18px;
      }
    }
    .index_content {
      width: 70vw;
      .imgLists {
        .list {
          width: 31%;
        }
      }
    }
  }

  .homeDevice {
    .index_title {
      height: 100px;
      width: 100vw;
      padding: 0;
      .homeTitle {
        font-size: 26px;
      }
      .goBackBtn {
        img {
          width: 60px;
        }
        span {
          font-size: 22px;
        }
      }
    }
    .index_content {
      width: 70vw;
      top: 50%;
      .imgLists {
        .list {
          width: 25%;
        }
      }
    }
  }

</style>
