<template>
  <div>
    <div class="transactionQuery" v-show="transactionQuery">
      <div class="collection_title">
        <img src="../../assets/ic_chevron_left.png" alt="" @click="goto(-1)" class="gobackBg">
        <div class="dates_search">
          <div class="dates">
            <span class="dates_title">交易时间</span>
            <span class="datesArr" @click="datesChange"><span v-for="item in dateArrVal">{{item}}</span></span>
            <el-date-picker
              ref="datePicker"
              type="dates"
              v-model="dateArr"
              :editable = "false"
              format="yyyy/MM/dd"
              value-format="yyyy/MM/dd"
              placeholder="选择两个日期"
              >
            </el-date-picker>
          </div>
          <div class="search" @click="isPad ? trandeTipShow() : ''">
            <input type="number" placeholder="请输入订单号查询" @focus="trandeTipShow" v-model="trandeVal" v-if="!isPad">
            <input type="number" placeholder="请输入订单号查询" v-model="trandeVal" v-else disabled>
            <el-button type="primary" class="searchBtn" >搜索</el-button>
          </div>
        </div>
        <span @click="quit = true;" class="quitBtn">退出</span>
      </div>
      <div class="collection_content">
        <div class="topList">
          <div class="lists">
            <div class="list">
              <div class="list_top">交易笔数 {{trandeTotal.trande.all}}笔</div>
              <div class="list_bottom">
                <span>预授权 {{trandeTotal.trande.preNum}}笔</span>
                <span>收款 {{trandeTotal.trande.num}}笔</span>
              </div>
            </div>
            <div class="list">
              <div class="list_top">总金额 {{trandeTotal.total.all}}元</div>
              <div class="list_bottom">
                <span>微信支付 {{trandeTotal.total.wxNum}}元</span>
                <span>支付宝支付 {{trandeTotal.total.zfbNum}}元</span>
              </div>
            </div>
          </div>
        </div>
        <div class="tabs">
          <span :class="tabIndex == 0 ? 'tab active' : 'tab'" @click="tabChange(0)">全部</span>
          <span :class="tabIndex == 1 ? 'tab active' : 'tab'" @click="tabChange(1)">支付宝</span>
          <span :class="tabIndex == 2 ? 'tab active' : 'tab'" @click="tabChange(2)">微信</span>
          <el-button type="primary" :loading="deriveLoading" class="deriveBtn" @click="deriveBtn">导出XSL</el-button>
        </div>
        <div class="infinite-list-wrapper" style="overflow:auto" v-if="trandeLists.length != 0">
          <ul
            class="list"
            v-infinite-scroll="load"
            infinite-scroll-disabled="disabled">
            <el-table
              :data="trandeLists"
              style="width: 100%">
              <el-table-column
                prop="time"
                label="交易时间"
                width="180">
              </el-table-column>
              <el-table-column
                prop="trandeId"
                label="商户订单号"
                width="180">
              </el-table-column>
              <el-table-column
                prop="payType_"
                label="交易类型">
              </el-table-column>
              <el-table-column
                prop="trandeOwn"
                label="操作员">
              </el-table-column>
              <el-table-column
                prop="moneyVal"
                label="交易金额">
              </el-table-column>
              <el-table-column
                prop="status_"
                label="交易状态">
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    @click="handleDetailEdit(scope.$index, scope.row)">详情</el-button>
                </template>
              </el-table-column>
              <el-table-column
                align="right">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    @click="handleEdit(scope.$index, scope.row)">发起退款</el-button>
                </template>
              </el-table-column>
            </el-table>
          </ul>
          <p v-if="loading">加载中...</p>
          <p v-if="noMore">没有更多了</p>
        </div>
        <div class="noMsg" v-else>
          <img src="../../assets/noMsg.png" alt="">
        </div>
      </div>
    </div>
    <!-- 详情弹框-->
    <div class="detailTip" v-if="detailTip">
      <div class="shadow"></div>
      <div class="detail_content">
        <div class="info_content">
          <div class="close" @click="detailTip = false;"><img src="../../assets/ic-back-white.png" alt=""></div>
          <div class="detail_info">
            <div class="info_title">授权信息</div>
            <div class="lists">
              <div class="list">
                <div class="info_name">冻结金额</div>
                <div class="info_value">¥1200.00</div>
              </div>
              <div class="list">
                <div class="info_name">操作人员</div>
                <div class="info_value">小郑</div>
              </div>
              <div class="list">
                <div class="info_name">授权通道</div>
                <div class="info_value">微信收款</div>
              </div>
              <div class="list">
                <div class="info_name">授权时间</div>
                <div class="info_value">2019/10/18 18:00:00</div>
              </div>
              <div class="list">
                <div class="info_name">商户订单号</div>
                <div class="info_value">4356789786345768</div>
              </div>
            </div>
          </div>
          <div class="detail_info">
            <div class="info_title">结算信息</div>
            <div class="lists">
              <div class="list">
                <div class="info_name">结算金额</div>
                <div class="info_value">¥1200.00</div>
              </div>
              <div class="list">
                <div class="info_name">操作人员</div>
                <div class="info_value">小郑</div>
              </div>
              <div class="list">
                <div class="info_name">授权时间</div>
                <div class="info_value">2019/10/18 18:00:00</div>
              </div>
              <div class="list">
                <div class="info_name">商户订单号</div>
                <div class="info_value">4356789786345768</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 退款弹框-->
    <div class="sureTip" v-if="refundTip">
      <div class="shadow"></div>
      <div class="rescind_info">
        <div class="info_content">
          <div class="close" @click="refundTip = false;"><img src="../../assets/ic-back-white.png" alt=""></div>
          <div class="title">退款金额</div>
          <div class="tip_lists">
            <div class="input">
              <span>¥</span>
              <input type="number" placeholder="0.0" v-model="refundVal" ref="numberWidth" @input="changeInput(refundVal)">
            </div>
            <div class="keyBords">
              <span v-for="item in keyBords" @click=" keyEntry($event, item)"><span>{{item}}</span></span>
              <span  @click="keyCancel($event)"><img src="../../assets/ic-close_.png" alt=""></span>
            </div>
          </div>
          <el-button type="primary" :loading="refundLoading" class="btn" @click="refundBtn">退款</el-button>
        </div>
      </div>
    </div>

    <!-- 输入订单号弹框-->
    <div class="sureTip trandeTip" v-if="trandeTip">
      <div class="shadow"></div>
      <div class="rescind_info">
        <div class="info_content">
          <div class="close" @click="trandeTip = false;"><img src="../../assets/ic-back-white.png" alt=""></div>
          <div class="title">订单号</div>
          <div class="tip_lists">
            <div class="input">
              <input type="number" placeholder="0" v-model="trandeVal" ref="trandeWidth" @input="changeInput_(trandeVal)" v-if="!isPad">
              <input type="number" placeholder="0" v-model="trandeVal" ref="trandeWidth" v-else disabled>
            </div>
            <div class="keyBords">
              <span v-for="item in keyBords_" @click="item == '清除' ? clear($event) : keyEntry_($event, item)"><span>{{item}}</span></span>
              <span  @click="keyCancel_($event)"><img src="../../assets/ic-close_.png" alt=""></span>
            </div>
          </div>
          <el-button type="primary" :loading="trandeLoading" class="btn" @click="sureFun">查询</el-button>
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
    name: 'transactionQuery',
    components: {loadingList, toast},
    data () {
      return {
        toastShow: false,   // toast
        toastTxt: '',       // toast txt
        loadingShow: false,  // loading
        loadingText: '加载中...',    // loading 语
        transactionQuery: false,   // 模板的显示和隐藏
        quit: false,      // 是否退出
        dateArr: [],   // 日期数组
        trandeTotal: {
          trande: {
            all: 100,
            preNum: 80,  // 预授权
            num: 20,     // 收款
          },
          total: {
            all: 45678798.90,
            wxNum: 232323.79,
            zfbNum: 457687998.90,
          }
        }, // 交易笔数和总金额
        tabIndex: 0,   // tab选中
        deriveLoading: false,  //导出loading
        trandeLists: [
          {
            time: '2019/10/29 15:23',
            trandeId: '2342342323232323',
            payType: 1, // 1微信支付 2支付宝支付 3微信预授权完成 4支付宝预授权完成
            trandeOwn: '小郑',
            moneyVal: '¥300',
            status: 1, // 1表示已完成 0表示交易中
          },
          {
            time: '2019/10/29 15:23',
            trandeId: '2342342323232323',
            payType: 4, // 1微信支付 2支付宝支付 3微信预授权完成 4支付宝预授权完成
            trandeOwn: '小郑',
            moneyVal: '¥300',
            status: 0, // 1表示已完成 0表示交易中
          },
        ],   // 交易数据
        loading: false,  // 加载中
        refundTip: false,  // 发起退款弹框
        refundVal: '',         // 退款时输入的金额
        keyBords: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'],     // 键盘
        refundLoading: false,  // 退款loading
        detailTip: false,    // 详情弹框
        detailObj: {},        // 详情内容
        trandeLoading: false,  // 查询订单号loading
        trandeTip: false,      // 订单号输入弹框
        keyBords_: [1, 2, 3, 4, 5, 6, 7, 8, 9, '清除', 0],
        trandeVal: '',          // 订单号输入值
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false,  // 判断是否是移动iPad
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

      // 交易号弹框显示
      trandeTipShow() {
        this.trandeTip = true;
      },

      // 搜索
      sureFun() {
        this.trandeLoading = true;
      },

      // 日期框显示
      datesChange() {
        this.$nextTick(() => {
//          this.$refs.datePicker.$el.firstElementChild.focus();
          this.$refs.datePicker.showPicker();    // 唤起日期选择框
//          this.$refs.datePicker.hidePicker();  // 隐藏
        })
      },

      // tab选中
      tabChange(index) {
        this.tabIndex = index;
      },

      // 导出
      deriveBtn() {
        this.deriveLoading = true;
      },

      // 发起退款
      handleEdit(index, row) {
        console.log(index, row);
        console.log(this);
        this.refundTip = true;
      },

      // 查看详情
      handleDetailEdit(index, row) {
        console.log(index, row);
        this.detailTip = true;
        // 需要请求
      },

      // 监听input
      changeInput (val) {
        let len = val.length;
        if (len >= 14) {
          len = 14;
        }
        this.$refs.numberWidth.style.width = (76 + len * 21) + 'px';
      },
      changeInput_ (val) {
        let len = val.length;
        if (len >= 15) {
          len = 15;
        }
        this.$refs.trandeWidth.style.width = (24 + len * 27) + 'px';
      },

      // 查询键盘事件
      keyEntry(event, item) {
        event.preventDefault();
        this.refundVal+=item;
        this.changeInput(this.refundVal);
      },
      keyEntry_(event, item) {
        event.preventDefault();
        this.trandeVal+=item;
        this.changeInput_(this.trandeVal);
      },

      // 查询键盘删除事件
      keyCancel(event) {
        event.preventDefault();
        this.refundVal = this.refundVal.substr(0, this.refundVal.length - 1);
        this.changeInput(this.refundVal);
      },
      keyCancel_(event) {
        event.preventDefault();
        this.trandeVal = this.trandeVal.substr(0, this.trandeVal.length - 1);
        this.changeInput_(this.trandeVal);
      },

      // 清除
      clear(event) {
        event.preventDefault();
        this.trandeVal = '';
        this.changeInput_(this.trandeVal);
      },

      // 退款确定事件
      refundBtn () {
        this.refundLoading = true;
      },

      // 加载数据更多
      load () {
//        this.loading = true;
        setTimeout(() => {
          // 去进行请求
          //this.loading = false
        }, 2000)
      },

    },
    computed: {
      dateArrVal() {        // 日期数组
        if (this.dateArr.length > 2) {
          this.dateArr.splice(0,1);
        }
        return this.dateArr;
      },
      noMore () {
        return this.trandeLists.length >= 20   // 判断最大值
      },
      disabled () {
        return this.trandeLists.length >= 10 && (this.loading || this.noMore)
      },
    },
    mounted () {
      this.transactionQuery = true;
      let startTime = this.datetimeparse(new Date(new Date().toLocaleDateString()).getTime(), 'yy/MM/dd');
      let endTime = this.datetimeparse(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000-1, 'yy/MM/dd');
      this.dateArr.push(startTime, endTime);
      this.trandeLists.forEach(item => {
        if (item.payType == 1) {
          item.payType_ = '微信支付';
        } else if (item.payType == 2) {
          item.payType_ = '支付宝支付';
        } else if (item.payType == 1) {
          item.payType_ = '微信预授权完成';
        } else {
          item.payType_ = '支付宝预授权完成';
        }

        if (item.status == 1) {
          item.status_ = '已完成';
        }else {
          item.status_ = '交易中'
        }
      });

      this.toastTxt = '提示语测试下';
      this.toastShow = true;
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .transactionQuery {
    .collection_title {
      position: relative;
      padding: .36rem .8rem;
      text-align: center;
      border-bottom: 1px solid #EEEEEE;
      .gobackBg {
        position: absolute;
        left: .8rem;
        top: 50%;
        transform: translateY(-50%);
        img {
          width: .96rem;
        }
      }
      .dates_search {
        display: flex;
        justify-content: center;
        align-items: center;
        .dates {
          background: #F7F7F7;
          border-radius: 4px;
          width: 3rem;
          padding: .1rem .28rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .dates_title {
            color: #999999;
            font-size: .36rem;
            width: 1rem;
          }
          .datesArr {
            font-size: .36rem;
            color: #4C88FF;
            span {
              display: block;
            }
          }
          /deep/ .el-input__prefix {
            display: none;
          }
          /deep/ .el-date-editor.el-input, .el-date-editor.el-input__inner {
            width: 1px;
          }
          /deep/ .el-input--prefix .el-input__inner {
            padding: 0;
            width: 1px;
            border: none;
          }
        }
        .search {
          margin-left: .6rem;
          border: 1px solid #4C88FF;
          border-radius: .4rem;
          width: 8.84rem;
          padding: 0 1.6rem 0 .46rem;
          position: relative;
          height: .84rem;
          input {
            outline: none;
            border: none;
            background-color: transparent;
            font-size: .4rem;
            width: 100%;
            color: #A8BDE6;
            height: 100%;
            line-height: .84rem;
          }
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button { -webkit-appearance: none; }
          input[type="number"]{ -moz-appearance: textfield; }
          input:-moz-placeholder {
            color: #A8BDE6;
            font-size: .4rem;
          }
          input:-ms-input-placeholder {
            color: #A8BDE6;
            font-size: .4rem;
          }
          input::-moz-placeholder {
            color: #A8BDE6;
            font-size: .4rem;
          }
          input::-webkit-input-placeholder {
            color: #A8BDE6;
            font-size: .4rem;
          }
          .searchBtn {
            background: #4C88FF;
            border-radius: 0 .4rem .4rem 0;
            cursor: pointer;
            width: 1.6rem;
            position: absolute;
            right: 0;
            top: 0;
            height: .84rem;
            border: none;
            text-align: center;
            color: #fff;
            font-size: .4rem;
          }
        }
      }
      .quitBtn {
        position: absolute;
        background: #F7F7F7;
        border-radius: 4px;
        font-size: .4rem;
        padding: .26rem .5rem;
        color: #666;
        right: .8rem;
        top: 50%;
        transform: translateY(-50%);
      }
    }
    .collection_content {
      padding: .66rem 1.1rem;
      .topList {
        margin-bottom: 1.08rem;
        .lists {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          .list {
            margin-right: .36rem;
            padding: .42rem .44rem .24rem;
            border-radius: .12rem;
            text-align: left;
            .list_top {
              font-size: .44rem;
              border-bottom: .16rem;
            }
            .list_bottom {
              font-size: .36rem;
            }
          }
          .list:first-of-type {
            background: #BAF0FC;
            .list_top {
              color: #252E5B;
            }
            .list_bottom {
              color: #252E5B;
              span:first-of-type {
                margin-right: 1.4rem;
              }
              span:last-of-type {
                margin-right: 1.2rem;
              }
              span:last-of-type {
                margin-right: .26rem;
              }
            }
          }
          .list:last-of-type {
            background: #4C88FF;
            .list_top {
              color: #fff;
            }
            .list_bottom {
              color: #fff;
              span:first-of-type {
                margin-right: .5rem;
              }
            }
          }
        }
      }
      .tabs {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        position: relative;
        margin-bottom: .34rem;
        .tab {
          cursor: pointer;
          border-radius: 4px;
          padding: .12rem .4rem;
          color: #333333;
          font-size: .4rem;
          margin-right: 1.24rem;
        }
        .active {
          background: #4C88FF;
          font-size: .48rem;
          color: #fff;
        }
        .deriveBtn {
          position: absolute;
          right: 0;
          top: 50%;
          background: rgba(76, 136, 255, .08);
          transform: translateY(-50%);
          border-radius: 4px;
          padding: .2rem .5rem;
          color: #4C88FF;
          font-size: .36rem;
          border: none;
        }
      }
      .infinite-list-wrapper {
        /deep/ .el-table {
          border: 1px solid #eee;
        }
        /deep/ .el-table thead {
          background: #F7F7F7;
        }
        /depp/ .el-table tr:last-of-type td {
          border-bottom: none;
        }
        /deep/ .el-table th>.cell {
          color: #888888;
          font-size: .36rem;
        }
        /deep/ .el-table .cell {
          color: #333;
          font-size: .32rem;
        }
        /deep/ .el-button--mini {
          padding: 0;
          border: none;
          color: #4C88FF;
          font-size: .32rem;
        }
        /deep/ .el-table--enable-row-transition .el-table__body td:nth-of-type(5) .cell {
          color: #FF4B66;
        }
        /deep/ .el-table--enable-row-transition .el-table__body td:last-of-type .el-button--mini {
          border: 1px solid #4B86FC;
          border-radius: 4px;
          padding: .14rem .4rem;
        }
      }
      .noMsg {
        position: absolute;
        left: 50%;
        top: 68%;
        transform: translate(-50%, -50%);
        img {
          width: 9.12rem;
          display: block;
        }
      }
    }
  }
  .detailTip {
    .shadow {
      background: rgba(0,0,0,0.60);
      position: fixed;
      z-index: 6;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
    }
    .detail_content {
      position: fixed;
      background: #FFFFFF;
      border: 6px solid #4C88FF;
      border-radius: .4rem;
      left: 50%;
      display: block;
      top: 54%;
      transform: translate(-50%, -50%);
      z-index: 10;
      .info_content {
        position: relative;
        .close {
          position: absolute;
          right: 0;
          top: -1.38rem;
          img {
            display: block;
            width: .72rem;
          }
        }
        .detail_info {
          position: relative;
          padding: .4rem .72rem .4rem;
          .info_title {
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
          .lists {
            width: 7.6rem;
            padding-top: .44rem;
            .list {
              padding: .2rem 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid rgba(151, 151, 151, .3);
              .info_name {
                color: #888;
                font-size: .44rem;
              }
              .info_value {
                color: #333;
                font-size: .44rem;
              }
            }
            .list:last-of-type {
              border-bottom: 0;
            }
          }
        }
        .detail_info:last-of-type {
          border-top: .12rem solid #4C88FF;
          margin-top: .7rem;
        }
      }
    }
  }
  .sureTip {
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
        padding: .8rem 1.32rem .4rem;
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
  .trandeTip {
    .rescind_info {
      .info_content {
        .tip_lists {
          .input {
            input {
              width: .48rem;
            }
          }
          .keyBords {
            span:nth-of-type(10) {
              span {
                color: #4C88FF;
                font-size: .56rem;
              }
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
