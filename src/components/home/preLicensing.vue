<template>
  <div>
    <div class="preLicensing" v-show="preLicensing">
      <div class="collection_fl">
        <div class="quitBack">
          <img src="../../assets/ic_chevron_left.png" alt="" @click="goto(-1)">
          <span @click="quit = true;">退出</span>
        </div>
        <div class="collection_fl_content">
          <div class="settle_accounts">
            <img src="../../assets/ic-saomiao.png" alt="">
            <span>扫码结算</span>
          </div>
          <div class="pre_search">
            <div class="search_title">请输入房号/交易单号搜索</div>
            <input type="text" v-model="roomNo" v-if="!isPad">
            <input type="text" v-model="roomNo" v-else disabled>
            <div class="keyBords">
              <span v-for="item in keyBords" @click="item == '清除' ? clear($event) : keyEntry($event, item)">{{item}}</span>
              <span  @click="keyCancel($event)"><img src="../../assets/ic-close.png" alt=""></span>
            </div>
          </div>
        </div>
      </div>
      <div class="collection_fr">
        <div class="collection_fr_title">
          <div class="pre_time">
            <span class="time">交易时间</span>
            <el-date-picker
              v-model="timeVal"
              type="date"
              format="yyyy/MM/dd"
              placeholder="选择日期"
              @blur="closeShadow"
              @focus="changeTime"
            >
            </el-date-picker>
            <img src="../../assets/ic-right_.png" alt="">
          </div>
          <!-- 阴影-->
          <div class="shadow" v-if="dialogVisible"></div>
          <div class="pre_tabs">
            <span :class="tabIndex == 0 ? 'active' : ''" @click="tabChange(0)">全部</span>
            <span :class="tabIndex == 1 ? 'active' : ''" @click="tabChange(1)">支付宝预授权</span>
            <span :class="tabIndex == 2 ? 'active' : ''" @click="tabChange(2)">微信预授权</span>
          </div>
        </div>
        <div class="collection_fr_content">
          <div class="infinite-list-wrapper" style="overflow:auto" v-if="preLists.length != 0">
            <ul
              class="list"
              v-infinite-scroll="load"
              infinite-scroll-disabled="disabled">
              <li v-for="item in preLists" class="list-item">
                <div class="list_title">
                  <span class="time">{{item.time}}</span>
                  <span class="trandId">交易单号：{{item.trandId}}</span>
                  <span class="roomNo">房间号：{{item.roomNo}}</span>
                </div>
                <div class="list_content">
                  <div class="list_fl">
                    <div class="title">{{item.payType == 1 ? '微信预授权' : '支付宝预授权'}}</div>
                    <div class="money">金额：<span>¥ <span>{{item.moneyVal}}</span></span></div>
                  </div>
                  <div class="list_fr">
                    <el-button type="primary" :loading="item.rescindLoading" v-if="config.rescind" class="rescindBtn" @click="rescindFun(item)">撤销</el-button>
                    <el-button type="primary" :loading="item.sureLoading" class="sureBtn" @click="sureFun">完成</el-button>
                  </div>
                </div>
              </li>
            </ul>
            <p v-if="loading">加载中...</p>
            <p v-if="noMore">没有更多了</p>
          </div>
        </div>
        <div class="noMsg" v-if="preLists.length == 0">
          <img src="../../assets/noMsg.png" alt="">
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

    <!-- 撤销弹框-->
    <div class="rescindTip" v-if="rescindTip">
      <div class="shadow"></div>
      <div class="rescind_info">
        <div class="info_content">
          <div class="close" @click="rescindTip = false;"><img src="../../assets/ic-back-white.png" alt=""></div>
          <div class="title">预授权信息</div>
          <div class="tip_lists">
            <div class="list">
              <div class="name">冻结金额</div>
              <div class="info">¥{{changeItem.moneyVal}}</div>
            </div>
            <div class="list">
              <div class="name">操作人员</div>
              <div class="info">张三</div>
            </div>
            <div class="list">
              <div class="name">授权通道</div>
              <div class="info">{{changeItem.payType == 1 ? '微信预授权' : '支付宝预授权'}}</div>
            </div>
            <div class="list">
              <div class="name">授权时间</div>
              <div class="info">{{changeItem.time}}</div>
            </div>
          </div>
          <p>*撤销后该笔金额会原路返回至用户账户</p>
          <div class="btn" @click="rescindSure"><span>确认撤销</span></div>
        </div>
      </div>
    </div>

    <!-- 完成弹框-->
    <div class="sureTip" v-if="sureTip">
      <div class="shadow"></div>
      <div class="rescind_info">
        <div class="info_content">
          <div class="close" @click="sureTip = false;"><img src="../../assets/ic-back-white.png" alt=""></div>
          <div class="title">消费金额</div>
          <div class="tip_lists">
            <div class="input">
              <span>¥</span>
              <input type="number" placeholder="0.0" v-model="sureVal" ref="numberWidth" @input="changeInput(sureVal)" v-if="!isPad">
              <input type="number" placeholder="0.0" v-model="sureVal" ref="numberWidth" v-else disabled>
            </div>
            <div class="keyBords">
              <span v-for="item in keyBords_" @click=" keyEntry_($event, item)"><span>{{item}}</span></span>
              <span  @click="keyCancel_($event)"><img src="../../assets/ic-close_.png" alt=""></span>
            </div>
          </div>
          <el-button type="primary" :loading="inquiryLoading" class="btn" @click="inquiry">查询</el-button>
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
    name: 'preLicensing',
    components: {loadingList, toast},
    data () {
      return {
        toastShow: false,   // toast
        toastTxt: '',       // toast txt
        loadingShow: false,  // loading
        loadingText: '加载中...',    // loading 语
        preLicensing: false,   // 模板的显示和隐藏
        quit: false,      // 是否退出
        roomNo: '',   // 搜索条件
        keyBords: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清除', '0'],  // 键盘
        dialogVisible: false,  //弹框
        timeVal: '',   // 日期值
        tabIndex: 0,   // tab选中
        loading: false,  // 加载中
        preLists: [
          {
            time: '2019/10/25 14:18',
            trandId: 12345678909876543,
            roomNo: '201',
            payType: 1,  // 1表示微信预授权 2表示支付宝预授权
            moneyVal: 300,
            rescindLoading: false,  // 撤销loading
            sureLoading: false,  // 完成loading
          }
        ],    // 数据接口
        config: {
          rescind: true,  // 撤销权限
        },
        changeItem: {},  // 临时数据
        rescindTip: false,   // 撤销弹框
        sureTip: false,      // 完成弹框
        sureVal: '',         // 完成时输入的金额
        keyBords_: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'],     // 键盘
        inquiryLoading: false,  // 查询loading
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false,  // 判断是否是移动iPad
      }
    },
    computed: {
      noMore () {
        return this.preLists.length >= 20   // 判断最大值
      },
      disabled () {
        return this.preLists.length >= 10 && (this.loading || this.noMore)
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

      // 键盘事件
      keyEntry(event, item) {
        event.preventDefault();
        this.roomNo+=item;
      },

      // 键盘清除事件
      clear(event) {
        event.preventDefault();
        this.roomNo = '';
      },

      // 键盘删除事件
      keyCancel(event) {
        event.preventDefault();
        this.roomNo = this.roomNo.substr(0, this.roomNo.length - 1);
      },

      // 日期
      changeTime() {
        this.dialogVisible = true;
      },

      // 关闭阴影
      closeShadow() {
        this.dialogVisible = false;
      },

      // tab选中
      tabChange(index) {
        this.tabIndex = index;
      },

      // 加载数据更多
      load () {
//        this.loading = true;
        setTimeout(() => {
          // 去进行请求
          //this.loading = false
        }, 2000)
      },

      // 撤销事件
      rescindFun(item) {
        this.changeItem = item;
        this.rescindTip = true;
      },

      // 确认撤销事件
      rescindSure() {

      },

      // 完成事件
      sureFun() {
        this.sureTip = true;
      },

      // 查询事件
      inquiry() {
        this.inquiryLoading = true;
      },

      // 监听input
      changeInput (val) {
        let len = val.length;
        if (len >= 14) {
          len = 14;
        }
        this.$refs.numberWidth.style.width = (76 + len * 21) + 'px';
      },

      // 查询键盘事件
      keyEntry_(event, item) {
        event.preventDefault();
        this.sureVal+=item;
        this.changeInput(this.sureVal);
      },

      // 查询键盘删除事件
      keyCancel_(event) {
        event.preventDefault();
        this.sureVal = this.sureVal.substr(0, this.sureVal.length - 1);
        this.changeInput(this.sureVal);
      },

    },
    mounted () {
      this.preLicensing = true;
      this.timeVal = this.datetimeparse(new Date().getTime(), 'yy/MM/DD');
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .preLicensing {
    display: flex;
    justify-content: flex-start;
    padding: 0 .76rem;
    .collection_fl {
      width: 6.22rem;
      .quitBack {
        padding: .54rem 0 .76rem;
        display: flex;
        align-items: center;
        img {
          display: inline-flex;
          width: .96rem;
          margin-right: .18rem;
        }
        span {
          background: #F7F7F7;
          border-radius: 4px;
          font-size: .4rem;
          padding: .26rem .5rem;
          color: #666;
        }
      }
      .collection_fl_content {
        .settle_accounts {
          background: #BAF0FC;
          border-radius: 6px;
          width: 100%;
          height: 1.88rem;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: .38rem;
          img {
            width: .64rem;
            height: .6rem;
            margin: auto .84rem auto 1.18rem;
          }
          span {
            font-size: .4rem;
            color: #252E5B;
          }
        }
        .pre_search {
          background: #4C88FF;
          border-radius: 6px;
          padding: .76rem .56rem .92rem;
          .search_title {
            color: #FFFFFF;
            opacity: .8;
            font-size: .36rem;
            margin-bottom: .4rem;
            text-align: left;
          }
          input {
            background-color: rgba(255, 255, 255, .3);
            border: none;
            outline: none;
            width: calc(100% - .6rem);
            height: 1.08rem;
            line-height: 1.08rem;
            font-size: .64rem;
            border-radius: 4px;
            padding: 0 .3rem;
          }
          .keyBords {
            margin-top: .74rem;
            span {
              position: relative;
              margin: 0 .06rem .14rem 0;
              color: #fff;
              font-size: .72rem;
              width: 1.47rem;
              text-align: center;
              display: inline-block;
              height: .88rem;
              line-height: .88rem;
              -moz-user-select:none;
              -ms-user-select: none;
              -webkit-user-select: none;
              user-select: none;
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
              img {
                width: .56rem;
                height: .4rem;
              }
            }
            span:nth-of-type(3n) {
              margin-right: 0;
            }
            span:nth-of-type(10) {
              font-size: .36rem;
            }
            span:active {
              background-color: #1AAD19;
              color: #f1f1f1;
            }
          }
        }
      }
    }
    .collection_fr {
      width: calc(100% - 6.22rem);
      padding: .7rem 0 .84rem;
      margin-left: .84rem;
      position: relative;
      .collection_fr_title {
        display: flex;
        align-items: center;
        .pre_time {
          background: #F7F7F7;
          border-radius: 19px;
          padding: .12rem .36rem;
          position: relative;
          .time {
            color: #999999;
            font-size: .36rem;
            margin-right: .28rem;
          }
          /deep/ .el-date-editor.el-input, .el-date-editor.el-input__inner {
            width: 2.6rem;
          }
          /deep/ .el-input__inner {
            border: none;
            padding-left: 0 !important;
            background-color: transparent;
            color: #333;
            font-size: .4rem;
          }
          /deep/ .el-icon-date:before {
            display: none;
          }
          /deep/ .el-input__icon {
            display: none;
          }
          img {
            width: .18rem;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: .36rem;
          }
        }
        .shadow {
          position: fixed;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, .5);
          z-index: 5;
        }
        .pre_tabs {
          margin-left: 1rem;
          span {
            margin-right: .64rem;
            color: #333;
            font-size: .4rem;
            padding: .12rem .4rem;
          }
          span.active {
            background: #4C88FF;
            border-radius: 4px;
            color: #fff;
            font-size: .48rem;
          }
          span:last-of-type {
            margin-right: 0;
          }
        }
      }
      .collection_fr_content {
        .infinite-list-wrapper {
          .list {
            .list-item {
              background: #FFFFFF;
              border: 1px solid #EEEEEE;
              .list_title {
                background-color: #F7F7F7;
                border-radius: 6px 6px 0 0;
                padding: .26rem .48rem;
                text-align: left;
                span {
                  font-size: .32rem;
                  color: #888888;
                  display: inline-block;
                }
                span:first-of-type {
                  width: 25%;
                }
                span:nth-of-type(2) {
                  width: 35%;
                }
              }
              .list_content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: .36rem .48rem;
                width: calc(100% - .96rem);
                .list_fl {
                  .title {
                    color: #333;
                    font-size: .4rem;
                    margin-bottom: .22rem;
                  }
                  .money {
                    color: #888;
                    font-size: .36rem;
                    span {
                      color: #FF4B66;
                      font-size: .36rem;
                      span {
                        font-size: .48rem;
                      }
                    }
                  }
                }
                .list_fr {
                  .rescindBtn {
                    border: 1px solid #FF4B66;
                    border-radius: 4px;
                    background-color: #fff;
                    padding: .26rem .86rem;
                    color: #FF4B66;
                    font-size: .4rem;
                    margin-right: .24rem;
                  }
                  .sureBtn {
                    border-radius: 4px;
                    background-color: #fff;
                    padding: .26rem .86rem;
                    border: 1px solid #4B86FC;
                    color: #4B86FC;
                    font-size: .4rem;
                  }
                }
              }
            }
          }
          p {
            font-size: .4rem;
            padding: .24rem 0;
            color: #666;
          }
        }
      }
      .noMsg {
        position: absolute;
        left: 50%;
        top: 60%;
        transform: translate(-50%, -50%);
        img {
          width: 9.12rem;
          display: block;
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
  .rescindTip, .sureTip {
    .shadow {
      background: rgba(0,0,0,0.60);
      position: fixed;
      z-index: 6;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
    }
    .rescind_info {
      position: fixed;
      background: #FFFFFF;
      border: 6px solid #4C88FF;
      border-radius: .4rem;
      left: 50%;
      display: block;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      .info_content {
        position: relative;
        padding: 1.12rem 1rem;
        .close {
          position: absolute;
          right: 0;
          top: -1.38rem;
          img {
            display: block;
            width: .72rem;
          }
        }
        .title {
          background: #4C88FF;
          border-radius: .7rem;
          padding: .22rem .8rem;
          color: #fff;
          font-size: .44rem;
          position: absolute;
          left: 50%;
          transform: translate(-50%, -50%);
          top: 0;
        }
        .tip_lists {
          width: 7.6rem;
          padding-top: 1.24rem;
          .list {
            padding: .4rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(151, 151, 151, .3);
            .name {
              color: #888;
              font-size: .44rem;
            }
            .info {
              color: #333;
              font-size: .44rem;
            }
          }
          .list:last-of-type {
            border-bottom: 0;
          }
        }
        p {
          margin-top: .26rem;
          font-size: .44rem;
          color: #FF4B66;
          text-align: left;
        }
        .btn {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -2rem;
          display: block;
          background: #4C88FF;
          border-radius: .8rem;
          width: 8.5rem;
          padding: .4rem 0;
          font-size: .48rem;
          color: #fff;
        }
      }
    }
  }
  .sureTip {
    .rescind_info {
      .info_content {
        padding: .8rem 1.32rem .4rem;
        .tip_lists {
          padding-top: 0;
          .input {
            border-bottom: 2px solid #979797;
            padding: .24rem 0;
            text-align: right;
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
            padding-top: .38rem;
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
      }
    }
  }

</style>
