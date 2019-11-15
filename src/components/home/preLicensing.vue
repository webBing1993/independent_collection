<template>
  <div>
    <div :class="isPad ? 'preLicensing preLicensing_' : 'preLicensing '" v-show="preLicensing">
      <div class="collection_fl">
        <div class="collection_fl_fixed">
          <div class="quitBack">
            <img src="../../assets/ic_chevron_left.png" alt="" @click="goBack">
            <span @click="quit = true;"  v-if="!isDevice && !isPad">退出</span>
          </div>
          <div class="collection_fl_content">
            <div class="settle_accounts" @click="sweepCode">
              <img src="../../assets/ic-saomiao.png" alt="">
              <span>扫码结算</span>
            </div>
            <div class="pre_search">
              <div class="search_title">请输入房号/交易单号搜索</div>
              <input type="text" v-model="roomNo" v-if="!isPad" @input="roomNoSearch(roomNo)">
              <input type="text" v-model="roomNo" v-else disabled>
              <div class="keyBords">
                <span v-for="item in keyBords" @click="item == '清除' ? clear($event) : keyEntry($event, item)">{{item}}</span>
                <span  @click="keyCancel($event)"><img src="../../assets/ic-close.png" alt=""></span>
              </div>
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
              :editable="false"
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
        <div class="collection_fr_content" v-show="showContent">
          <div class="infinite-list-wrapper" style="overflow:auto" v-if="preLists.length != 0">
            <ul
              class="list"
              v-infinite-scroll="load"
              infinite-scroll-disabled="busy">
              <li v-for="item in preLists" class="list-item">
                <div class="list_title">
                  <span class="time">{{datetimeparse(item.tradeTime, 'yy/MM/dd hh:mm')}}</span>
                  <span class="trandId">交易单号：{{item.flowId}}</span>
                  <span class="roomNo">房间号：{{item.roomNo}}</span>
                </div>
                <div class="list_content">
                  <div class="list_fl">
                    <div class="title">{{item.tradeType}}</div>
                    <div class="money">金额：<span>¥ <span>{{(item.tradeFee/100).toFixed(2)}}</span></span></div>
                  </div>
                  <div class="list_fr">
                    <el-button type="primary" :loading="item.rescindLoading" v-if="configList.depositCancle && (item.status == 'AUTH_SUCCESS' || item.status == 'DEPOSIT_CONSUME_FAILED' || item.status == 'UNFREEZE_FAILED' || item.status == 'AUTH_CANCEL_FAILED')" class="rescindBtn" @click="rescindFun(item)">撤销</el-button>
                    <el-button type="primary" :loading="item.rescindLoading" v-else-if="configList.depositCancle && (item.status != 'AUTH_SUCCESS' || item.status != 'DEPOSIT_CONSUME_FAILED' || item.status != 'UNFREEZE_FAILED' || item.status != 'AUTH_CANCEL_FAILED')" class="rescindBtn" @click="rescindFun(item)" disabled>撤销</el-button>
                    <el-button type="primary" :loading="item.sureLoading" class="sureBtn" @click="sureFun(item)" v-if="configList.depositConsume && (item.status == 'AUTH_SUCCESS' || item.status == 'DEPOSIT_CONSUME_FAILED' || item.status == 'UNFREEZE_FAILED' || item.status == 'AUTH_CANCEL_FAILED')">完成</el-button>
                    <el-button type="primary" :loading="item.sureLoading" class="sureBtn" @click="sureFun(item)" v-else-if="configList.depositConsume && (item.status != 'AUTH_SUCCESS' || item.status != 'DEPOSIT_CONSUME_FAILED' || item.status != 'UNFREEZE_FAILED' || item.status != 'AUTH_CANCEL_FAILED')" disabled>完成</el-button>
                  </div>
                </div>
              </li>
            </ul>
            <p v-if="loading">加载中...</p>
            <p v-if="!loading && noMoreList">没有更多了</p>
          </div>
        </div>
        <div class="noMsg" v-if="preLists.length == 0 && showContent">
          <img src="../../assets/noMsg.png" alt="">
        </div>
      </div>
    </div>
    <!-- 退出弹框提示-->
    <div :class="isPad ? 'quit quit_' : 'quit'" v-if="quit">
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
    <div :class="isPad ? 'rescindTip_ rescindTip' : 'rescindTip'" v-if="rescindTip">
      <div class="shadow"></div>
      <div class="rescind_info">
        <div class="info_content">
          <div class="close" @click="rescindTip = false;"><img src="../../assets/ic-back-white.png" alt=""></div>
          <div class="title">预授权信息</div>
          <div class="tip_lists">
            <div class="list">
              <div class="name">冻结金额</div>
              <div class="info">¥{{(changeItem.tradeFee/100).toFixed(2)}}</div>
            </div>
            <div class="list">
              <div class="name">操作人员</div>
              <div class="info">{{changeItem.operator ? changeItem.operator : '-'}}</div>
            </div>
            <div class="list">
              <div class="name">授权通道</div>
              <div class="info">{{changeItem.tradeType}}</div>
            </div>
            <div class="list">
              <div class="name">授权时间</div>
              <div class="info">{{datetimeparse(changeItem.tradeTime, 'yy/MM/dd hh:mm')}}</div>
            </div>
          </div>
          <p>*撤销后该笔金额会原路返回至用户账户</p>
          <el-button type="primary" :loading="rescindLoading_" class="btn" @click="rescindSure">确认撤销</el-button>
        </div>
      </div>
    </div>

    <!-- 完成弹框-->
    <div :class="isPad ? 'sureTip sureTip_' : 'sureTip'" v-if="sureTip">
      <div class="shadow"></div>
      <div class="rescind_info">
        <div class="info_content">
          <div class="close" @click="sureTip = false;"><img src="../../assets/ic-back-white.png" alt=""></div>
          <div class="title">消费金额</div>
          <div class="tip_lists">
            <div class="input">
              <span>¥</span>
              <input type="number" placeholder="0.0" v-model="sureVal" ref="numberWidth" @input="changeInput(sureVal)" v-if="!isPad">
              <input type="text" placeholder="0.0" v-model="sureVal" ref="numberWidth" v-else disabled>
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

    <!-- 扫码结算弹框步骤-->
    <div class="sweepingTig" v-if="sweepingTig">
      <div class="shadow"></div>
      <div class="sweeping_content">
        <div class="title">
          <img src="../../assets/guanbi.png" alt="" @click="closeSweeping">
        </div>
        <div class="content">
          <img src="../../assets/sweeping.gif" alt="">
          <p class="waringTig" v-if="sweepingTig_">二维码不正确</p>
          <p v-else>请将结算单上的二维码靠近扫码设备</p>
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
        busy: true,    // 禁止加载
        noMoreList: true,  // 无更多数据的初始化隐藏文字
        page: 1,   // 页数
        showContent: false,  // 内容模块显示隐藏
        preLists: [],    // 数据接口
        changeItem: {},  // 临时数据
        rescindTip: false,   // 撤销弹框
        sureTip: false,      // 完成弹框
        sureVal: '',         // 完成时输入的金额
        keyBords_: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'],     // 键盘
        inquiryLoading: false,  // 查询loading
        rescindLoading_: false,  // 撤销loading
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false,  // 判断是否是移动iPad
        isDevice: sessionStorage.getItem('isDevice') == 'true' ? true : false,  // 判断是否是双屏设备
        sweepingTig: false,   // 扫码结算步骤提示框
        sweepingTig_: false,   // 扫码结算错误提示框
        timer: null,   // 延时器
        configList: {
          depositConsume: false,  // 消费
          depositCancle: false,   // 撤销
        }, // 权限
      }
    },
    computed: {
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto', 'getSweepLists', 'resciendCancel', 'consume'
      ]),

      // 返回上一页
      goBack() {
        this.goto(-1);
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

      // 扫码结算
      sweepCode() {
        // Android调取摄像头
        if (this.isPad) {
          window.android.scanQrCode();
        }else if (this.isDevice) {
          // 双屏设备
          this.sweepingTig = true;
          this.sweepingTig_ = false;
          jsObj.OpenBarCode();
        }
      },

      // 关闭小票扫码 客户端点击关闭操作
      testCloseBarCode() {
        jsObj.CloseBarCode();
      },

      // 关闭扫码弹框
      closeSweeping () {
        this.sweepingTig = false;
        this.testCloseBarCode();
      },

      // 接受A屏返回的订单orderId
      getSweepingSettlementOrderId (orderId, deviceId) {
        console.log('A屏过来的orderId', orderId);
        console.log('A屏过来的deviceId', deviceId);
        if (!orderId || orderId == null) {
          this.sweepingTig = true;
          this.sweepingTig_ = true;
        }else {
          this.roomNo = orderId;
          this.preLists = [];
          this.preLicensing = true;
          this.loadingShow = true;
          this.page = 1;
          this.getSweepList();
        }
      },

      // 接收移动iPad传过来的orderId
      getSweepIpadOrderId(orderId, deviceId) {
        console.log('orderId', orderId);
        console.log('deviceId', deviceId);
        if (!orderId || orderId == null) {

        }else {
          this.roomNo = orderId;
          this.preLists = [];
          this.preLicensing = true;
          this.loadingShow = true;
          this.page = 1;
          this.getSweepList();
        }
      },

      // 键盘事件
      keyEntry(event, item) {
        event.preventDefault();
        clearTimeout(this.timer);
        this.roomNo+=item;
        this.roomNoSearch();
      },

      // 搜索事件
      roomNoSearch() {
        this.timer = setTimeout(() => {
          this.preLists = [];
          this.showContent = false;
          this.loadingShow = true;
          this.page = 1;
          this.getSweepList();
        }, 500)
      },

      // 键盘清除事件
      clear(event) {
        event.preventDefault();
        this.roomNo = '';
        clearTimeout(this.timer);
        this.roomNoSearch();
      },

      // 键盘删除事件
      keyCancel(event) {
        event.preventDefault();
        clearTimeout(this.timer);
        this.roomNo = this.roomNo.substr(0, this.roomNo.length - 1);
        this.roomNoSearch();
      },

      // 日期
      changeTime() {
        this.dialogVisible = true;
      },

      // 关闭阴影
      closeShadow() {
        this.timeVal = this.datetimeparse(new Date(this.timeVal).getTime(), 'yy/MM/DD');
        this.dialogVisible = false;
        this.preLists = [];
        this.preLicensing = true;
        this.loadingShow = true;
        this.page = 1;
        this.getSweepList();
      },

      // tab选中
      tabChange(index) {
        this.tabIndex = index;
        this.preLists = [];
        this.roomNo = '';
        this.showContent = false;
        this.loadingShow = true;
        this.page = 1;
        this.getSweepList();
      },

      // 加载数据更多
      load () {
        this.loading = true;
        this.busy = true;
        setTimeout(() => {
          this.page++;
          this.getSweepList();
        },500)
      },

      // 撤销事件
      rescindFun(item) {
        this.changeItem = item;
        this.rescindTip = true;
      },

      // 确认撤销事件
      rescindSure() {
        this.rescindLoading_ = true;
        this.resciendCancel({
          data: {
            flowId: this.changeItem.flowId,
          },
          onsuccess: body => {
            if (body.data.code == 0 ||body.data.errcode == 0) {
              this.toastTxt = '撤销成功';
              this.toastShow = true;
              this.preLists = [];
              this.preLicensing = true;
              this.loadingShow = true;
              this.page = 1;
              this.getSweepList();
            }
            this.rescindTip = false;
            this.rescindLoading_ = false;
          },
          onfail: body => {
            this.rescindTip = false;
            this.rescindLoading_ = false;
          },
          onerror: body => {
            this.rescindTip = false;
            this.rescindLoading_ = false;
          }
        })
      },

      // 完成事件
      sureFun(item) {
        this.changeItem = item;
        this.sureTip = true;
      },

      // 查询事件
      inquiry() {
        this.inquiryLoading = true;
        if (this.sureVal.length == 0) {
          this.toastTxt = '请输入消费金额';
          this.toastShow = true;
          this.inquiryLoading = false;
          return;
        }else if (this.sureVal == 0) {
          this.toastTxt = '请输入正确的消费金额';
          this.toastShow = true;
          this.inquiryLoading = false;
          return;
        }else if (parseFloat(this.sureVal)*100 > this.changeItem.tradeFee) {
          this.toastTxt = '消费金额不可大于总金额';
          this.toastShow = true;
          this.inquiryLoading = false;
          return;
        }else {
          this.consume({
            data: {
              amount: parseFloat(this.sureVal)*100,
              flowId: this.changeItem.flowId
            },
            onsuccess: body => {
              if (body.data.code == 0 ||body.data.errcode == 0) {
                this.preLists = [];
                this.preLicensing = true;
                this.loadingShow = true;
                this.page = 1;
                this.getSweepList();
              }
              this.sureTip = false;
              this.sureVal = '';
              this.changeInput(this.sureVal);
              this.inquiryLoading = false;
            },
            onfail: body => {
              this.sureTip = false;
              this.sureVal = '';
              this.changeInput(this.sureVal);
              this.inquiryLoading = false;
            },
            onerror: body => {
              this.sureTip = false;
              this.sureVal = '';
              this.changeInput(this.sureVal);
              this.inquiryLoading = false;
            }
          })
        }
      },

      // 监听input
      changeInput (val) {
        let len = val.length;
        if (len >= 14) {
          len = 14;
        }
        if (this.isPad) {
          this.$refs.numberWidth.style.width = (64 + len * 8) + 'px';
        }else {
          this.$refs.numberWidth.style.width = (25 + len * 21) + 'px';
        }
      },

      // 查询键盘事件
      keyEntry_(event, item) {
        event.preventDefault();
        if (!/^\d+$/.test(parseFloat(this.sureVal) * 10) && this.sureVal != '' && this.sureVal.length != 0) {
          return;
        }else {
          this.sureVal+=item;
        }
        this.changeInput(this.sureVal);
      },

      // 查询键盘删除事件
      keyCancel_(event) {
        event.preventDefault();
        this.sureVal = this.sureVal.substr(0, this.sureVal.length - 1);
        this.changeInput(this.sureVal);
      },

      // 获取数据列表
      getSweepList() {
        this.getSweepLists({
          data: {
            tradeType: this.tabIndex == 0 ? '' : this.tabIndex == 1 ? 'ALIPAY' : ' WEIXINPAY',
            tradeDay: this.timeVal,
            flowId: this.roomNo,
            page: this.page,
            pageSize: 10
          },
          onsuccess: body => {
            if (body.data.code == 0 || body.data.errcode == 0) {
              body.data.data.forEach(item => {
                item.rescindLoading = false;
                item.sureLoading = false;
              });
              this.preLists = [...this.preLists, ...body.data.data];
              if (this.preLists.length < 10) {
                this.noMoreList = false;
              }else {
                this.noMoreList = true;
              }
              if (body.data.data.length >= 10) {
                this.loading = true;
                this.busy = false;
              }else {
                this.busy = true;
              }
            }
            this.showContent = true;
            this.preLicensing = true;
            this.loadingShow = false;
            this.loading = false;
          },
          onfail: body => {
            this.showContent = true;
            this.preLicensing = true;
            this.loadingShow = false;
            this.loading = false;
          },
          onerror: body => {
            this.showContent = true;
            this.loading = false;
            this.preLicensing = true;
            this.loadingShow = false;
          }
        });
      },

    },
    mounted () {
      this.loadingShow = true;
      this.preLicensing = false;
      this.timeVal = this.datetimeparse(new Date().getTime(), 'yy/MM/DD');
      this.getSweepList();

      // 权限
      let arr = sessionStorage.getItem('configList') ? JSON.parse(sessionStorage.getItem('configList')) : [];
      arr.forEach(item => {
        if (item.authority == 'independent_trade_deposit_consume') {
          this.configList.depositConsume = true;
        }
        if (item.authority == 'independent_trade_deposit_cancle') {
          this.configList.depositCancle = true;
        }
      });

      if (this.isPad) {
        window.getSweepIpadOrderId = this.getSweepIpadOrderId;
        window.getBack = this.goBack;
      }else if (this.isDevice) {
        // 接受父页面发来的信息
        window.addEventListener('message', (event) => {
          let data = event.data;
          switch (data.cmd) {
            case 'getParams':
              console.log('data.params.key11', data.params.key);
              console.log('data.params.deviceId11', data.params.deviceId);
              this.getSweepIpadOrderId(data.params.key, data.params.deviceId)
          }
        })
      }
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .preLicensing {
    display: flex;
    justify-content: space-between;
    padding: 0 1.6vw;
    min-height: 100vh;
    .collection_fl {
      width: 25vw;
      position: relative;
      .collection_fl_fixed {
        position: fixed;
        left: 1.6vw;
        top: 0;
        width: 25vw;
      }
      .quitBack {
        padding: 2.1vw 0 3vw;
        display: flex;
        align-items: center;
        img {
          display: inline-flex;
          width: 3.8vw;
          margin-right: .7vw;
        }
        span {
          background: #F7F7F7;
          border-radius: 4px;
          font-size: .4rem;
          padding: 1vw 2vw;
          color: #666;
        }
      }
      .collection_fl_content {
        .settle_accounts {
          background: #BAF0FC;
          border-radius: 6px;
          width: 100%;
          height: 7.4vw;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.6vw;
          img {
            width: 2.9vw;
            margin-right: 3.3vw;
          }
          span {
            font-size: .4rem;
            color: #252E5B;
          }
        }
        .pre_search {
          background: #4C88FF;
          border-radius: 6px;
          padding: 1.6vw 2.2vw 3.6vw;
          .search_title {
            color: #FFFFFF;
            opacity: .8;
            font-size: .36rem;
            margin-bottom: 1.6vw;
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
            margin-top: 2.9vw;
            span {
              position: relative;
              margin: 0 3px .6vw 0;
              color: #fff;
              font-size: .72rem;
              width: 29%;
              text-align: center;
              display: inline-block;
              -moz-user-select:none;
              -ms-user-select: none;
              -webkit-user-select: none;
              user-select: none;
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
              img {
                width: 2.2vw;
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
      width: 66vw;
      padding: 2.8vw 0 3.3vw;
      margin-left: 3.3vw;
      position: relative;
      .collection_fr_title {
        display: flex;
        align-items: center;
        margin-bottom: 2.2vw;
        justify-content: flex-start;
        .pre_time {
          background: #F7F7F7;
          border-radius: 1.6vw;
          padding: .5vw 3vw;;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .time {
            color: #999999;
            font-size: .36rem;
            margin-right: 1.1vw;
          }
          /deep/ .el-date-editor.el-input, .el-date-editor.el-input__inner {
            width: 9vw;
          }
          /deep/ .el-input__inner {
            border: none;
            padding-left: 0 !important;
            background-color: transparent;
            color: #333;
            font-size: .4rem;
            padding-right: 0;
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
            right: 1.5vw;
          }
        }
        .shadow {
          position: fixed;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, .7);
          z-index: 5;
        }
        .pre_tabs {
          margin-left: 2vw;
          span {
            /*margin-right: 1vw;*/
            color: #333;
            font-size: .4rem;
            padding: .5vw 1.6vw;
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
              margin-bottom: .28rem;
              border-radius: 4px;
              .list_title {
                background-color: #F7F7F7;
                border-radius: 6px 6px 0 0;
                padding: 1vw 1.9vw;
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
                  width: 45%;
                }
              }
              .list_content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1.4vw 1.9vw;
                width: calc(100% - 3.8vw);
                .list_fl {
                  text-align: left;
                  width: 55%;
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
                    border-radius: 2px;
                    background-color: #fff;
                    padding: 1vw 3.9vw;
                    color: #FF4B66;
                    font-size: .4rem;
                    margin-right: 1vw;
                  }
                  /deep/ .el-button--primary.is-disabled, /deep/ .el-button--primary.is-disabled:active, /deep/ .el-button--primary.is-disabled:focus, /deep/ .el-button--primary.is-disabled:hover {
                    background-color: #F7F7F7;
                    border-color: #F7F7F7;
                  }
                  .sureBtn {
                    border-radius: 2px;
                    background-color: #fff;
                    padding: 1vw 3.9vw;
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
        top: 55%;
        transform: translate(-50%, -50%);
        img {
          width: 6rem;
          display: block;
        }
      }
    }
  }
  .preLicensing_ {
    padding: 0 38px;
    min-height: 100vh;
    .collection_fl {
      width: 24vw;
      position: relative;
      .collection_fl_fixed {
        position: fixed;
        left: 38px;
        top: 0;
        width: 24vw;
      }
      .quitBack {
        margin-left: -26px;
        padding: 15px 0 28px;
        display: flex;
        align-items: center;
        img {
          display: inline-flex;
          width: 30px;
          height: 30px;
          margin-right: 8px;
        }
        span {
          font-size: 14px;
          padding: 1vw 2vw;
        }
      }
      .collection_fl_content {
        .settle_accounts {
          width: 100%;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 12px;
          img {
            margin-left: 40px;
            width: 24px;
            margin-right: 30px;
          }
          span {
            font-size: 15px;
            font-family: 'SourceHanSansCN-Regular';
            letter-spacing: 1px;
          }
        }
        .pre_search {
          padding: 23px 22px 20px;
          border-radius: 4px;
          .search_title {
            font-size: 13px;
            letter-spacing: 1px;
            margin-bottom: 14px;
            font-family: 'SourceHanSansCN-Medium';
          }
          input {
            width: calc(100% - 16px);
            height: 38px;
            line-height: 38px;
            font-size: 14px;
            padding: 0 8px;
            margin-bottom: 15px;
          }
          .keyBords {
            margin-top: 12px;
            span {
              margin: 0 4px 15px 0;
              font-size: 28px;
              font-family: 'Arial';
              width: 29%;
              img {
                width: 22px;
              }
            }
            span:nth-of-type(10) {
              font-size: 14px;
            }
            span:active {
              background-color: #3877f3;
            }
          }
        }
      }
    }
    .collection_fr {
      padding: 12px 0 10px;
      margin-left: 10px;
      width: 66vw;
      .collection_fr_title {
        margin-bottom: 30px;
        .pre_time {
          padding: 0 12px;
          border-radius: 48px;
          .time {
            font-size: 14px;
            margin-right: 10px;
          }
          /deep/ .el-date-editor.el-input, .el-date-editor.el-input__inner {
            width: 100px;
          }
          /deep/ .el-input__inner {
            font-size: 14px;
            height: 30px;
            line-height: 30px;
          }
          img {
            width: 6px;
            right: 16px;
          }
        }
        .pre_tabs {
          margin-left: 35px;
          span {
            font-size: 14px;
            padding: 5px 15px;
            margin-right: 3px;
          }
          span:last-of-type {
            margin-right: 0;
          }
          span.active {
            font-size: 17px;
            font-family: 'SourceHanSansCN-Medium';
          }
        }
      }
      .collection_fr_content {
        .infinite-list-wrapper {
          .list {
            .list-item {
              margin-bottom: 10px;
              .list_title {
                padding: 6px 10px;
                span {
                  font-size: 12px;
                }
              }
              .list_content {
                padding: 12px 15px;
                width: calc(100% - 30px);
                .list_fl {
                  .title {
                    font-size: 14px;
                    margin-bottom: 4px;
                    font-family: 'SourceHanSansCN-Medium';
                  }
                  .money {
                    font-size: 14px;
                    span {
                      font-size: 14px;
                      span {
                        font-size: 16px;
                        font-family: Arial;
                      }
                    }
                  }
                }
                .list_fr {
                  .rescindBtn {
                    padding: 10px 30px;
                    font-size: 14px;
                    margin-right: 8px;
                    letter-spacing: 1px;
                  }
                  .sureBtn {
                    padding: 10px 30px;
                    font-size: 14px;
                    letter-spacing: 1px;
                    margin-left: 0;
                  }
                }
              }
            }
          }
          p {
            font-size: 14px;
            padding: 8px 0;
          }
        }
      }
      .noMsg {
        img {
          width: 280px;
        }
      }
    }
  }

  .sweepingTig {
    .shadow {
      position: fixed;
      z-index: 10;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, .7);
    }
    .sweeping_content {
      background: #FFFFFF;
      border-radius: 20px;
      width: 800px;
      position: fixed;
      z-index: 12;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      .title {
        position: relative;
        img {
          position: absolute;
          right: .8rem;
          top: .8rem;
          display: block;
          width: .48rem;
          height: .48rem;
          cursor: pointer;
        }
      }
      .content {
        p {
          color: #303133;
          font-size: .6rem;
          text-align: center;
          padding: .8rem 0;
        }
        .waringTig {
          color: #F5222D;
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
  .rescindTip, .sureTip {
    .shadow {
      background: rgba(0,0,0,0.7);
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
      border: 4px solid #4C88FF;
      border-radius: .4rem;
      left: 50%;
      display: block;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      .info_content {
        position: relative;
        padding: 2.8vw 5.6vw;
        width: 32vw;
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
          .list {
            padding: 1.2vw 0;
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
          margin-top: .6vw;
          font-size: .44rem;
          color: #FF4B66;
          text-align: left;
        }
        .btn {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -8vw;
          display: block;
          background: #4C88FF;
          border-radius: .8rem;
          width: 32vw;
          padding: 1.6vw 0;
          font-size: .48rem;
          color: #fff;
        }
      }
    }
  }
  .sureTip {
    .rescind_info {
      .info_content {
        padding: 2.8vw 5.6vw 1.6vw;
        .tip_lists {
          padding-top: 0;
          .input {
            border-bottom: 2px solid #979797;
            padding: 1vw 0;
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
            padding-top: 1.6vw;
            span {
              cursor: pointer;
              display: inline-block;
              width: 29%;
              height: 4vw;
              text-align: center;
              line-height: 4vw;
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
            span:active {
              background-color: #1AAD19;
              color: #f1f1f1;
            }
          }
        }
      }
    }
  }
  .sureTip_ {
    .rescind_info {
      .info_content {
        padding: 17px 40px;
        .close {
          top: -30px;
          img {
            display: block;
            width: 20px;
          }
        }
        .title {
          padding: 8px 30px;
          font-size: 15px;
          letter-spacing: 1px;
          font-family: 'SourceHanSansCN-Medium';
        }
        .tip_lists {
          .input {
            padding: 8px 0;
            border-bottom: 1px solid #e4e4e4;
            input {
              width: 64px;
              font-size: 32px;
            }
            span {
              font-size: 14px;
            }
          }
          .keyBords {
            padding-top: 1.6vw;
            span {
              width: 29.4%;
              height: 48px;
              line-height: 48px;
              font-size: 32px;
              margin: 0 1.6vw 1vw 0;
              font-family: Arial;
              img {
                width: 24px;
              }
            }
            span:nth-of-type(3n) {
              margin-right: 0;
            }
            span:nth-of-type(10) {
              span {
                color: #4C88FF;
                font-size: 13px;
              }
            }
            span:nth-of-type(n+10) {
              bottom: 0;
            }
            span:active {
              background-color: #4C88FF;;
              color: #f1f1f1;
            }
          }
        }
        p {
          margin-top: 10px;
          font-size: 14px;
          letter-spacing: 1px;
        }
        .btn {
          bottom: -60px;
          width: 314px;
          padding: 12px 0;
          font-size: 16px;
          letter-spacing: 4px;
        }
      }
    }
  }
  .rescindTip_ {
    .rescind_info {
      .info_content {
        padding: 36px 30px 34px;
        width: 320px;
        .close {
          top: -30px;
          img {
            display: block;
            width: 20px;
          }
        }
        .title {
          padding: 8px 30px;
          font-size: 15px;
          letter-spacing: 1px;
          font-family: 'SourceHanSansCN-Medium';
        }
        .tip_lists {
          .list {
            padding: 12px 0;
            border-color: #e4e4e4;
            .name {
              font-size: 14px;
            }
            .info {
              font-size: 14px;
            }
          }
        }
        p {
          margin-top: 10px;
          font-size: 14px;
          letter-spacing: 1px;
        }
        .btn {
          bottom: -60px;
          width: 314px;
          padding: 10px 0;
          font-size: 16px;
          letter-spacing: 4px;
        }
      }
    }
  }

</style>
