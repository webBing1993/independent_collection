<template>
  <div>
    <div :class="isPad ? 'transactionQuery_ transactionQuery' : 'transactionQuery'" v-show="transactionQuery">
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
              @blur="changeTimeList"
              >
            </el-date-picker>
          </div>
          <!-- 阴影-->
          <div class="shadow" v-if="dialogVisible"></div>

          <div class="search" @click="isPad ? trandeTipShow() : ''">
            <input type="number" placeholder="请输入订单号查询" @focus="trandeTipShow" v-model="trandeVal" v-if="!isPad">
            <input type="number" placeholder="请输入订单号查询" v-model="trandeVal" v-else disabled>
            <el-button type="primary" class="searchBtn" >搜索</el-button>
          </div>
        </div>
        <span @click="quit = true;" class="quitBtn" v-if="!isDevice && !isPad">退出</span>
      </div>
      <div class="collection_content">
        <div class="topList">
          <div class="lists">
            <div class="list">
              <div class="list_top">交易笔数 {{trandeTotal.trande.total}}笔</div>
              <div class="list_bottom">
                <span>预授权 {{trandeTotal.trande.depositTotal}}笔</span>
                <span>收款 {{trandeTotal.trande.payTotal}}笔</span>
              </div>
            </div>
            <div class="list">
              <div class="list_top">总金额 {{(trandeTotal.total.amount/100).toFixed(2)}}元</div>
              <div class="list_bottom">
                <span>微信支付 {{(trandeTotal.total.wxpayAmount/100).toFixed(2)}}元</span>
                <span>支付宝支付 {{(trandeTotal.total.alipayAmount/100).toFixed(2)}}元</span>
              </div>
            </div>
          </div>
        </div>
        <div class="tabs">
          <span :class="tabIndex == 0 ? 'tab active' : 'tab'" @click="tabChange(0)">全部</span>
          <span :class="tabIndex == 1 ? 'tab active' : 'tab'" @click="tabChange(1)">支付宝</span>
          <span :class="tabIndex == 2 ? 'tab active' : 'tab'" @click="tabChange(2)">微信</span>
          <el-button type="primary" :loading="deriveLoading" class="deriveBtn" @click="deriveBtn" v-if="configList.exportExcel">导出XSL</el-button>
        </div>
        <div class="infinite-list-wrapper" style="overflow:auto" v-if="trandeLists.length != 0 && showContent">
          <ul
            class="list"
            v-infinite-scroll="loadMore"
            infinite-scroll-disabled="busy"
            infinite-scroll-distance="10">
            <el-table
              :data="trandeLists"
              style="width: 100%">
              <el-table-column
                prop="tradeTime"
                label="交易时间"
                min-width="18%">
              </el-table-column>
              <el-table-column
                prop="flowId"
                label="商户订单号"
                min-width="20%">
              </el-table-column>
              <el-table-column
                prop="tradeType"
                label="交易类型"
                min-width="10%">
              </el-table-column>
              <el-table-column
                prop="operator"
                label="操作员"
                min-width="10%">
              </el-table-column>
              <el-table-column
                prop="tradeFee_"
                label="交易金额"
                min-width="12%">
              </el-table-column>
              <el-table-column
                prop="tradeStatus_"
                label="交易状态"
                min-width="10%">
              </el-table-column>
              <el-table-column label="操作" min-width="10%">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    @click="handleDetailEdit(scope.$index, scope.row)">详情</el-button>
                </template>
              </el-table-column>
              <el-table-column min-width="10%">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    @click="handleEdit(scope.$index, scope.row)" v-if="configList.depositRecordRefund && (scope.row.tradeType == '支付宝' || scope.row.tradeType == '微信支付') && (scope.row.status == 'PAY_SUCCESS' || scope.row.status == 'REFUND_FAILED')">发起退款</el-button>

                </template>
              </el-table-column>
            </el-table>
          </ul>
          <p v-if="loading">加载中...</p>
          <p v-if="!loading && noMoreList">没有更多了</p>
        </div>
        <div class="noMsg" v-if="showContent && trandeLists.length == 0">
          <img src="../../assets/noMsg.png" alt="">
        </div>
      </div>
    </div>
    <!-- 详情弹框-->
    <div  :class="isPad ? 'detailTip detailTip_' : 'detailTip'" v-if="detailTip">
      <div class="shadow"></div>
      <div class="detail_content">
        <div class="info_content">
          <div class="close" @click="detailTip = false;"><img src="../../assets/ic-back-white.png" alt=""></div>
          <div class="detail_info_content">
            <div class="detail_info">
              <div class="info_title">交易信息</div>
              <div class="lists">
                <div class="list">
                  <div class="info_name" v-if="detailItem.tradeType == '支付宝预授权' || detailItem.tradeType == '微信预授权'">冻结金额</div>
                  <div class="info_name" v-else>交易金额</div>
                  <div class="info_value">¥{{(detailObj.authorization.amount/100).toFixed(2)}}元</div>
                </div>
                <div class="list">
                  <div class="info_name">操作人员</div>
                  <div class="info_value">{{detailObj.authorization.operator ? detailObj.authorization.operator : '-'}}</div>
                </div>
                <div class="list">
                  <div class="info_name">交易通道</div>
                  <div class="info_value">{{detailObj.authorization.payType}}</div>
                </div>
                <div class="list">
                  <div class="info_name">交易时间</div>
                  <div class="info_value">{{datetimeparse(detailObj.authorization.authorizedTime, 'yy/MM/dd hh:mm:ss')}}</div>
                </div>
                <div class="list">
                  <div class="info_name">商户订单号</div>
                  <div class="info_value">{{detailObj.authorization.tradeNo}}</div>
                </div>
              </div>
            </div>
            <div class="detail_info" v-if="detailObj.settle.amount != 0">
              <div class="info_title" v-if="detailItem.tradeType == '支付宝预授权' || detailItem.tradeType == '微信预授权'">结算信息</div>
              <div class="info_title" v-else>退款信息</div>
              <div class="lists">
                <div class="list">
                  <div class="info_name">结算金额</div>
                  <div class="info_value">¥{{(detailObj.settle.amount/100).toFixed(2)}}元</div>
                </div>
                <div class="list">
                  <div class="info_name">操作人员</div>
                  <div class="info_value">{{detailObj.settle.operator ? detailObj.settle.operator : '-'}}</div>
                </div>
                <div class="list">
                  <div class="info_name">交易时间</div>
                  <div class="info_value">{{datetimeparse(detailObj.settle.authorizedTime, 'yy/MM/dd hh:mm:ss')}}</div>
                </div>
                <div class="list">
                  <div class="info_name">商户订单号</div>
                  <div class="info_value">{{detailObj.settle.tradeNo}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 退款弹框-->
    <div :class="isPad ? 'sureTip_ sureTip' : 'sureTip'" v-if="refundTip">
      <div class="shadow"></div>
      <div class="rescind_info">
        <div class="info_content">
          <div class="close" @click="sureTipCancel"><img src="../../assets/ic-back-white.png" alt=""></div>
          <div class="title">退款金额</div>
          <div class="tip_lists">
            <div class="input">
              <span>¥</span>
              <input type="text" placeholder="0.0" v-model="refundVal" ref="numberWidth" @input="changeInput(refundVal)">
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
    <div :class="isPad ? 'sureTip_ sureTip trandeTip' : 'sureTip trandeTip'" v-if="trandeTip">
      <div class="shadow"></div>
      <div class="rescind_info">
        <div class="info_content">
          <div class="close" @click="trandeTipCancel"><img src="../../assets/ic-back-white.png" alt=""></div>
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
        dateArr_: [],   // 日期数组
        dialogVisible: false,  //弹框
        trandeTotal: {
          trande: {},
          total: {}
        }, // 交易笔数和总金额
        tabIndex: 0,   // tab选中
        tradeType: '',  // 交易类型：ALIPAY-支付宝，WEIXINPAY-微信支付；不传，则默认查询所有
        deriveLoading: false,  //导出loading
        trandeLists: [],   // 交易数据
        showContent: false,  // 交易数据隐藏显示
        loading: false,  // 加载中
        busy: true,    // 禁止加载
        noMoreList: true,  // 无更多数据的初始化隐藏文字
        page: 1,    // 页数
        refundTip: false,  // 发起退款弹框
        refundItem: {},    // 退款临时数据
        refundVal: '',         // 退款时输入的金额
        keyBords: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'],     // 键盘
        refundLoading: false,  // 退款loading
        detailTip: false,    // 详情弹框
        detailItem: {},      // 详情临时数据
        detailObj: {},        // 详情内容
        trandeLoading: false,  // 查询订单号loading
        trandeTip: false,      // 订单号输入弹框
        keyBords_: [1, 2, 3, 4, 5, 6, 7, 8, 9, '清除', 0],
        trandeVal: '',          // 订单号输入值
        result: '',   // 接收文件流
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false,  // 判断是否是移动iPad
        isDevice: sessionStorage.getItem('isDevice') == 'true' ? true : false,  // 判断是否是双屏设备
        configList: {
          depositRecordRefund: false,   // 收款退款
          depositAuthRefund: false,  // 预授权退款
          exportExcel:false,    // els表格
        },   // 权限
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto', 'transactionList', 'exportXls', 'getAllNum', 'getAllTotal', 'transactionDetail', 'refund'
      ]),

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

      // 交易号弹框显示
      trandeTipShow() {
        this.trandeTip = true;
        this.changeInput_(this.trandeVal);
      },

      // 搜索
      sureFun() {
        this.trandeLoading = true;
        this.showContent = false;
        this.loadingShow = true;
        this.page = 1;
        this.getTransactionList();
      },

      // 日期框显示
      datesChange() {
        this.$nextTick(() => {
          this.dialogVisible = true;
//          this.$refs.datePicker.$el.firstElementChild.focus();
          this.$refs.datePicker.showPicker();    // 唤起日期选择框
//          this.$refs.datePicker.hidePicker();  // 隐藏
        })
      },

      // 日期失去焦点
      changeTimeList() {
        this.getAllNums();
        this.getAllTotals();
        this.showContent = false;
        this.loadingShow = true;
        this.dialogVisible = false;
        this.page = 1;
        this.getTransactionList();
      },

      // tab选中
      tabChange(index) {
        this.tabIndex = index;
        if (this.tabIndex == 0) {
          this.tradeType = '';
        }else if (this.tabIndex == 1) {
          this.tradeType = 'ALIPAY';
        }else {
          this.tradeType = 'WEIXINPAY';
        }
        this.refundVal = '';
        this.showContent = false;
        this.loadingShow = true;
        this.page = 1;
        this.getTransactionList();
      },

      // 导出
      deriveBtn() {
        this.deriveLoading = true;
        let arr = this.dateArr;
        if (new Date(arr[0]).getTime() > new Date(arr[1]).getTime()) {
          arr.sort(function(a, b) {
            return new Date(a).getTime() > new Date(b).getTime() ? 1 : -1;
          });
        }
        if (this.isPad || this.isDevice) {
          this.$toastMsg({
            toastTip: true,
            toastTxt_: '此功能仅可在网页登录使用',
          });
          this.deriveLoading = false;
          return;
        }else {
          this.exportXls({
            data: {
              tradeStartDay: arr[0],
              tradeEndDay: arr[1],
              tradeType: this.tradeType,
              flowId: this.trandeVal,
              page: 1,
              pageSize: 10,
            },
            onsuccess: body => {
              // 文件流处理
              if (body.data.size != 14) {
                this.result = body.data;
                this.downloadExcel();
                this.deriveLoading = false;
              }else {
                this.deriveLoading = false;
                this.toastTxt = body.data.msg || body.data.errmsg;
                this.toastShow = true;
              }
            },
            onfail: body => {
              this.deriveLoading = false;
              this.toastTxt = body.data.msg || body.data.errmsg;
              this.toastShow = true;
            },
            onerror: body => {
              this.deriveLoading = false;
              this.toastTxt = body.data.msg || body.data.errmsg;
              this.toastShow = true;
            }
          });
        }
      },

      downloadExcel() {
        let blob = new Blob([this.result], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8'}); //application/vnd.openxmlformats-officedocument.wordprocessingml.document这里表示doc类型
        let downloadElement = document.createElement('a');
        let href = window.URL.createObjectURL(blob); //创建下载的链接
        let filename = href.match(/.+\/(.+)$/)[1]+'.xlsx';
        let reg = /^["](.*)["]$/g;
        downloadElement.style.display = 'none';
        downloadElement.href = href;
        downloadElement.download = decodeURI(filename.replace(reg,"$1")); //下载后文件名
        document.body.appendChild(downloadElement);
        downloadElement.click(); //点击下载
        document.body.removeChild(downloadElement); //下载完成移除元素
        window.URL.revokeObjectURL(href); //释放掉blob对象

      },

      // 发起退款
      handleEdit(index, row) {
        console.log(index, row);
        this.refundTip = true;
        this.refundItem = row;
      },

      // 弹框关闭事件
      trandeTipCancel () {
        this.trandeTip = false;
        this.trandeVal= '';
        this.changeInput(this.trandeVal);
      },

      sureTipCancel () {
        this.refundTip = false;
        this.refundVal = '';
        this.changeInput(this.refundVal);
      },

      // 查看详情
      handleDetailEdit(index, row) {
        console.log(index, row);
        this.detailItem = row;
        this.detailTip = true;
        // 需要请求
        this.transactionDetail({
          id: row.id,
          onsuccess: body => {
            if (body.data.code == 0 || body.data.errcode == 0) {
              this.detailObj = body.data.data;
            }
          },
          onfail: body => {

          },
          onerror: body => {

          }
        })
      },

      // 监听input
      changeInput (val) {
        let len = val.length;
        if (len >= 14) {
          len = 14;
        }
        if (this.isPad) {
          this.$refs.numberWidth.style.width = (64 + len * 12) + 'px';
        }else {
          this.$refs.numberWidth.style.width = (24 + len * 21) + 'px';
        }
      },
      changeInput_ (val) {
        let len = val.length;
        if (len >= 20) {
          len = 20;
        }
        if (this.isPad) {
          this.$refs.trandeWidth.style.width = (32 + len * 10) + 'px';
        }else {
          this.$refs.trandeWidth.style.width = (24 + len * 27) + 'px';
        }
      },

      // 查询键盘事件
      keyEntry(event, item) {
        event.preventDefault();
        if (!/^\d+$/.test(parseFloat(this.refundVal) * 10) && this.refundVal != '' && this.refundVal.length != 0) {
          return;
        }else {
          this.refundVal+=item;
        }
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
        if (this.refundVal.length == 0) {
          this.$toastMsg({
            toastTip: true,
            toastTxt_: '请输入退款金额',
          });
          this.refundLoading = false;
          return;
        }else if (this.refundVal == 0) {
          this.$toastMsg({
            toastTip: true,
            toastTxt_: '请输入正确的退款金额',
          });
          this.refundLoading = false;
          return;
        }else if (parseFloat(this.refundVal)*100 > this.refundItem.tradeFee) {
          this.$toastMsg({
            toastTip: true,
            toastTxt_: '退款金额不可大于交易金额',
          });
          this.refundLoading = false;
          return;
        }else {
          this.refund({
            data: {
              amount: parseFloat(this.refundVal)*100,
              flowId: this.refundItem.flowId
            },
            onsuccess: body => {
              if (body.data.code == 0 || body.data.errcode == 0) {
                this.$toastMsg({
                  toastTip: true,
                  toastTxt_: '退款成功',
                });
                this.getAllNums();
                this.getAllTotals();
                this.page = 1;
                this.getTransactionList();
              }
              this.refundVal = '';
              this.refundLoading = false;
              this.refundTip = false;
            },
            onfail: body => {
              this.refundVal = '';
              this.refundLoading = false;
              this.refundTip = false;
            },
            onerror: body => {
              this.refundVal = '';
              this.refundLoading = false;
              this.refundTip = false;
            }
          })
        }

      },

      // 加载数据更多
      loadMore () {
        this.loading = true;
        this.busy = true;
        setTimeout(() => {
          this.page++;
          this.getTransactionList();
        },500)
      },

      // 交易笔数
      getAllNums() {
        let arr = this.dateArr;
        if (new Date(arr[0]).getTime() > new Date(arr[1]).getTime()) {
          arr.sort(function(a, b) {
            return new Date(a).getTime() > new Date(b).getTime() ? 1 : -1;
          });
        }
        this.getAllNum({
          data: {
            tradeStartDay: arr[0],
            tradeEndDay: arr[1],
            tradeType: this.tradeType,
            flowId: this.trandeVal,
          },
          onsuccess: body => {
            if (body.data.code == 0 || body.data.errcode == 0) {
              this.trandeTotal.trande = body.data.data;
            }
          }
        })
      },

      // 交易金额
      getAllTotals() {
        let arr = this.dateArr;
        if (new Date(arr[0]).getTime() > new Date(arr[1]).getTime()) {
          arr.sort(function(a, b) {
            return new Date(a).getTime() > new Date(b).getTime() ? 1 : -1;
          });
        }
        this.getAllTotal({
          data: {
            tradeStartDay: arr[0],
            tradeEndDay: arr[1],
            tradeType: this.tradeType,
            flowId: this.trandeVal,
          },
          onsuccess: body => {
              if (body.data.code == 0 || body.data.errcode == 0) {
                this.trandeTotal.total = body.data.data;
              }
          }
        })
      },

      // 数据请求接口
      getTransactionList() {
        let arr = this.dateArr;
        if (new Date(arr[0]).getTime() > new Date(arr[1]).getTime()) {
          arr.sort(function(a, b) {
            return new Date(a).getTime() > new Date(b).getTime() ? 1 : -1;
          });
        }
        this.transactionList({
          data: {
            tradeStartDay: arr[0],
            tradeEndDay: arr[1],
            tradeType: this.tradeType,
            flowId: this.trandeVal,
            page: this.page,
            pageSize: 10,
          },
          onsuccess: body => {
            this.loading = false;
            this.loadingShow = false;
            this.trandeLoading = false;
            this.trandeTip = false;
            this.transactionQuery = true;
            this.showContent = true;
            if (body.data.code == 0 || body.data.errcode == 0) {
              body.data.data.forEach(item => {
                item.tradeFee_ = "¥" + (item.tradeFee/100).toFixed(2);
                item.tradeTime = this.datetimeparse(item.tradeTime, 'yy/MM/dd hh:mm');
                item.operator = item.operator == null ? "-" : item.operator;
                if (item.status == 'NORMAL') {
                  item.tradeStatus_ = '正常'
                }else if (item.status == 'PAYING') {
                  item.tradeStatus_ = '支付中'
                }else if (item.status == 'AUTH_FAILED') {
                  item.tradeStatus_ = '授权失败'
                }else if (item.status == 'AUTH_SUCCESS') {
                  item.tradeStatus_ = '授权成功'
                }else if (item.status == 'AUTH_FAILED') {
                  item.tradeStatus_ = '授权失败'
                }else if (item.status == 'PAY_FAILED') {
                  item.tradeStatus_ = '支付失败'
                }else if (item.status == 'PAY_SUCCESS') {
                  item.tradeStatus_ = '支付成功'
                }else if (item.status == 'DEPOSIT_CONSUME_FAILED') {
                  item.tradeStatus_ = '押金消费失败'
                }else if (item.status == 'DEPOSIT_CONSUME_SUCCESS') {
                  item.tradeStatus_ = '预授权完成'
                }else if (item.status == 'UNFREEZE_FAILED') {
                  item.tradeStatus_ = '解冻失败'
                }else if (item.status == 'AUTH_CANCEL_FAILED') {
                  item.tradeStatus_ = '预授权撤销失败'
                }else if (item.status == 'AUTH_CANCEL_SUCCESS') {
                  item.tradeStatus_ = '预授权撤销'
                }else if (item.status == 'AUTH_CANCEL_FAILED') {
                  item.tradeStatus_ = '授权撤销失败'
                }else if (item.status == 'DEPOSIT_REFUND_FAILED') {
                  item.tradeStatus_ = '押金退款失败'
                }else if (item.status == 'DEPOSIT_REFUND_SUCCESS') {
                  item.tradeStatus_ = '押金退款成功'
                }else if (item.status == 'REFUND_FAILED') {
                  item.tradeStatus_ = '退款失败'
                }else if (item.status == 'REFUND_SUCCESS') {
                  item.tradeStatus_ = '退款成功'
                }
              });
              if (body.data.data.length >= 10) {
                this.loading = true;
                this.busy = false;
              }else {
                this.busy = true;
              }
              if (this.page == 1) {
                this.trandeLists = body.data.data;
              }else {
                this.trandeLists = [...this.trandeLists, ...body.data.data];
              }
              if (this.trandeLists.length < 10) {
                this.noMoreList = false;
              }else {
                this.noMoreList = true;
              }
            }
          },
          onfail: body => {
            this.showContent = true;
            this.loading = false;
            this.loadingShow = false;
            this.trandeLoading = false;
            this.trandeTip = false;
            this.transactionQuery = true;
          },
          onerror: body => {
            this.showContent = true;
            this.loading = false;
            this.loadingShow = false;
            this.trandeLoading = false;
            this.trandeTip = false;
            this.transactionQuery = true;
          }
        })
      },

      goBack () {
        this.goto(-1);
      },

    },
    beforeMount() {
      let startTime = this.datetimeparse(new Date(new Date(new Date().toLocaleDateString()).getTime()), 'yy/MM/dd');
      let endTime = this.datetimeparse(new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000-1), 'yy/MM/dd');
      this.dateArr.push(startTime, endTime);
    },
    mounted () {
      this.transactionQuery = false;
      this.loadingShow = true;
      this.getAllNums();
      this.getAllTotals();
      this.page = 1;
      this.getTransactionList();

      if (this.isPad) {
        window.getBack = this.goBack;
      }

      // 权限
      let arr_ = sessionStorage.getItem('configList') ? JSON.parse(sessionStorage.getItem('configList')) : [];
      arr_.forEach(item => {
        if (item.authority == 'independent_trade_trading_record_native_pay_refund') {
          this.configList.depositRecordRefund = true;
        }
        if (item.authority == 'independent_trade_trading_record_deposit_auth_refund') {
          this.configList.depositAuthRefund = true;
        }
        if (item.authority == 'independent_trade_trading_record_export_excel') {
          this.configList.exportExcel = true;
        }
      });

    },
    computed: {
      dateArrVal() {        // 日期数组
        if (this.dateArr.length > 2) {
          this.dateArr.splice(0,1);
        }else if (this.dateArr.length < 2) {
          this.dateArr = this.dateArr_;
        }
        this.dateArr_ = this.dateArr;
        return this.dateArr;
      },
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .transactionQuery {
    .collection_title {
      position: fixed;
      width: 93.8vw;
      padding: 2.2vw 3.1vw;
      text-align: center;
      border-bottom: 1px solid #EEEEEE;
      background-color: #fff;
      left: 0;
      top: 0;
      z-index: 1;
      .gobackBg {
        position: absolute;
        left: 3.1vw;
        top: 50%;
        transform: translateY(-50%);
        width: 3.8vw;
      }
      .dates_search {
        display: flex;
        justify-content: center;
        align-items: center;
        .dates {
          background: #F7F7F7;
          border-radius: 4px;
          padding: .4vw 1vw;
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
            background-color: #f7f7f7;
          }
          /deep/ .el-input--prefix .el-input__inner {
            padding: 0;
            width: 1px;
            border: none;
            background-color: #f7f7f7;
          }
        }
        .search {
          margin-left: 2.4vw;
          border: 1px solid #4C88FF;
          border-radius: .4rem;
          width: 34.6vw;
          padding: 0 6.3vw 0 1.8vw;
          position: relative;
          height: 3.3vw;
          input {
            outline: none;
            border: none;
            background-color: transparent;
            font-size: .4rem;
            width: 100%;
            color: #A8BDE6;
            height: 100%;
            line-height: 3.3vw;
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
            width: 6.3vw;
            position: absolute;
            right: 0;
            top: 0;
            height: 3.3vw;
            border: none;
            text-align: center;
            color: #fff;
            font-size: .4rem;
            padding: 0;
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
      }
      .quitBtn {
        position: absolute;
        background: #F7F7F7;
        border-radius: 4px;
        font-size: .4rem;
        color: #666;
        right: .8rem;
        top: 50%;
        transform: translateY(-50%);
        padding: 1vw 2vw;
      }
    }
    .collection_content {
      padding: 13vw 4.6vw 1.2vw;
      position: relative;
      .topList {
        margin-bottom: 4.7vw;
        .lists {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          .list {
            margin-right: 1.7vw;
            padding: 1.6vw 1.7vw 1.6vw;
            border-radius: .12rem;
            text-align: left;
            .list_top {
              font-size: .44rem;
              border-bottom: .6vw;
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
                margin-right: 2.3vw;
              }
              span:last-of-type {
                margin-right: 0;
              }
            }
          }
          .list:last-of-type {
            margin-right: 0;
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
        margin-bottom: 1.6vw;
        .tab {
          cursor: pointer;
          border-radius: 4px;
          padding: .12rem .4rem;
          color: #333333;
          font-size: .4rem;
          margin-right: 5.8vw;
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
        width: 100%;
        /deep/ .el-table {
          width: 100%;
          border-radius: 4px;
          border-bottom: 1px solid #eee;
          border-left: 1px solid #eee;
          border-right: 1px solid #eee;
        }
        /deep/ .el-table__body, /deep/ .el-table__footer, /deep/ .el-table__header {
          width: 100% !important;
        }
        /deep/ .el-table thead tr th {
          background: #F7F7F7;
        }
        /depp/ .el-table tr:last-of-type td {
          border-bottom: none;
        }
        /deep/ .el-table th>.cell {
          color: #888888;
          font-size: .36rem;
          font-weight: normal;
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
          font-family: 'SourceHanSansCN-Medium';
        }
        /deep/ .el-table--enable-row-transition .el-table__body td:nth-of-type(5) .cell {
          color: #FF4B66;
          font-family: 'SourceHanSansCN-Medium';
        }
        /deep/ .el-table--enable-row-transition .el-table__body td:first-of-type .cell {
          padding-left: 14px;
        }
        /deep/ .el-table--enable-row-transition .el-table__body td:last-of-type .cell {
          padding-left: 0;
        }
        /deep/ td:last-of-type .el-button--mini {
          border: 1px solid #4B86FC;
          border-radius: 4px;
          height: 2.5vw;
          padding: 0 1.4vw;
        }
        /deep/ .el-table th.is-leaf {
          border-bottom: none;
        }
        /deep/ .el-table th.is-leaf:first-of-type {
          padding-left: 10px;
        }
        /deep/ .el-button.is-disabled, /deep/ .el-button.is-disabled:focus, /deep/ .el-button.is-disabled:hover {
          border-color: #f7f7f7 !important;
          background-color: #f7f7f7;
        }
        p {
          font-size: .4rem;
          padding: .24rem 0;
          color: #666;
        }
      }
      .noMsg {
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0);
        img {
          width: 6rem;
          display: block;
        }
      }
    }
  }
  .transactionQuery_ {
    .collection_title {
      padding: 10px 12px;
      width: calc(100vw - 30px);
      .gobackBg {
        margin-left: -15px;
        width: 30px;
      }
      .dates_search {
        display: flex;
        justify-content: center;
        align-items: center;
        .dates {
          padding: 0 10px;
          .dates_title {
            font-size: 14px;
            width: 30px;
          }
          .datesArr {
            font-size: 14px;
          }
        }
        .search {
          margin-left: 15px;
          width: 280px;
          padding: 0 66px 0 10px;
          position: relative;
          height: 32px;
          input {
            font-size: 14px;
            line-height: 32px;
          }
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button { -webkit-appearance: none; }
          input[type="number"]{ -moz-appearance: textfield; }
          input:-moz-placeholder {
            font-size: 14px;
          }
          input:-ms-input-placeholder {
            font-size: 14px;
          }
          input::-moz-placeholder {
            font-size: 14px;
          }
          input::-webkit-input-placeholder {
            font-size: 14px;
          }
          .searchBtn {
            width: 66px;
            height: 32px;
            font-size: 14px;
          }
        }
      }
      .quitBtn {
        font-size: 14px;
        right: 15px;
      }
    }
    .collection_content {
      padding: 82px 30px 10px;
      .topList {
        margin-bottom: 32px;
        .lists {
          .list {
            margin-right: 12px;
            padding: 12px 60px 12px 12px;
            .list_top {
              font-size: 16px;
              border-bottom: 10px;
            }
            .list_bottom {
              font-size: 14px;
            }
            .list:last-of-type {
              padding-right: 24px;
            }
          }
          .list:first-of-type {
            .list_bottom {
              span:first-of-type {
                margin-right: 15px;
              }
            }
          }
          .list:last-of-type {
            .list_bottom {
              span:first-of-type {
                margin-right: 18px;
              }
            }
          }
        }
      }
      .tabs {
        margin-bottom: 12px;
        .tab {
          font-size: 14px;
          padding: 3px 15px;
          margin-right: 20px;
        }
        .active {
          font-size: 16px;
          font-family: 'SourceHanSansCN-Medium';
        }
        .deriveBtn {
          padding: 10px 20px;
          font-size: 14px;
        }
      }
      .infinite-list-wrapper {
        /deep/ .el-table th>.cell {
          font-size: 14px;
        }
        /deep/ .el-table .cell {
          font-size: 14px;
        }
        /deep/ .el-button--mini {
          font-size: 14px;
        }
        /deep/ td:last-of-type .el-button--mini {
          height: 28px;
          padding: 0 12px;
        }
        /deep/ .el-table thead tr th {
          padding: 6px 0;
        }
        /deep/ .el-table--enable-row-transition .el-table__body td {
          padding: 13px 0;
        }
        p {
          font-size: 12px;
          padding: 8px 0;
        }
      }
      .noMsg {
        transform: translate(-50%, -20px);
        img {
          width: 280px;
        }
      }
    }
  }

  .detailTip {
    .shadow {
      background: rgba(0,0,0,0.7);
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
          padding: 1.6vw 2.8vw;
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
            width: 35vw;
            padding-top: 1.6vw;
            .list {
              padding: .8vw 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #e4e4e4;
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
          margin-top: 2.4vw;
        }
        .detail_info:only-of-type {
          margin-top: 0;
          border-top: none;
        }
      }
    }
    .detail_content {
      .info_content {
        .detail_info {
          padding: 15px 2.8vw;
          .lists {
            margin-top: 0;
            .list {
              padding: .4vw 0;
            }
          }
        }
      }
      .detail_info:last-of-type {
        margin-top: .4vw;
      }
      .detail_info:only-of-type {
        margin-top: 0;
        border-top: none;
      }
    }
  }

  .detailTip_ {
    .detail_content {
      .info_content {
        .close {
          top: -30px;
          img {
            width: 20px;
          }
        }
        .detail_info {
          padding: 15px 30px;
          .info_title {
            padding: 5px 40px;
            font-size: 15px;
            letter-spacing: 1px;
            font-family: 'SourceHanSansCN-Medium';
          }
          .lists {
            width: 320px;
            .list {
              padding: 8px 0;
              .info_name {
                font-size: 14px;
              }
              .info_value {
                font-size: 14px;
              }
            }
          }
        }
        .detail_info:last-of-type {
          border-top: 1px solid #4C88FF;
          margin-top: 10px;
        }
        .detail_info:only-of-type {
          margin-top: 0;
          border-top: none;
        }
      }
    }
    .detail_content {
      .info_content {
        .detail_info {
          padding: 15px 30px;
          .lists {
            margin-top: 0;
            .list {
              padding: 8px 0;
            }
          }
        }
      }
      .detail_info:last-of-type {
        margin-top: .4vw;
      }
      .detail_info:only-of-type {
        margin-top: 0;
        border-top: none;
      }
    }
  }
  .sureTip {
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
      border: 6px solid #4C88FF;
      border-radius: .4rem;
      left: 50%;
      display: block;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      .info_content {
        position: relative;
        padding: 2.8vw 5.6vw 1.4vw;
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
          width: 32vw;
          padding-top: 0;
          .input {
            border-bottom: 2px solid #979797;
            padding: 1vw 0;
            text-align: right;
            input {
              outline: none;
              border: none;
              width: .48rem;
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
              width: 29.6%;
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
            span:nth-of-type(10) {
              span {
                color: #4C88FF;
                font-size: .56rem;
                font-weight: bold;
              }
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
                font-weight: normal;
              }
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
                font-size: 16px;
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

</style>
