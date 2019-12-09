<template>
  <div>
    <div :class="isPad ? 'collectionSuccess_ collectionSuccess' : isDevice ? 'collectionSuccess collectionSuccessDevice' : 'collectionSuccess'" v-show="collectionSuccess">
      <div class="collection_title">
        <span>{{payType == 1 ? '收款' : '预授权收款'}}</span>
      </div>
      <div class="collection_content">
        <div class="success_fl">
          <div class="success_content">
            <div class="success_title">收款信息</div>
            <div class="lists">
              <div class="list">
                <div class="name">订单号</div>
                <div class="content">{{detail.flowId}}</div>
              </div>
              <div class="list">
                <div class="name">时间</div>
                <div class="content">{{datetimeparse(detail.tradeTime, 'yy/MM/dd hh:mm:ss')}}</div>
              </div>
              <div class="list">
                <div class="name">收款金额</div>
                <div class="content">¥{{(detail.amount/100).toFixed(2)}}元</div>
              </div>
              <div class="list">
                <div class="name">交易状态</div>
                <div class="content">{{detail.trade_status == 'SUCCESS' ? '已完成' : '未完成'}}</div>
              </div>
              <div class="list">
                <div class="name">交易类型</div>
                <div class="content">{{payType == 1 ? detail.pay_channel : detail.pay_channel+'预授权'}}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="success_fr">
          <div class="title">
            <img src="../../assets/ic-success.png" alt="">
            <span>{{payType == 1 ? '支付成功' : '预授权完成'}}</span>
          </div>
          <div class="collection_carousel">
            <swiper :options="swiperOption">
              <swiper-slide v-for="(item, index) in dataimg" :key="index" @click.native="swiperClick(index)">
                <img :src="swiperOption.initialSlide == index ? item.icon : item.images" alt="">
                <span :class="swiperOption.initialSlide == index ? 'active' : ''">{{item.name}}</span>
              </swiper-slide>
            </swiper>
            <div class="collection_remark">
              <div class="roomNo" @click="isPad ? roomNoFocus() : ''">
                <input type="text" placeholder="请输入房号（选填）" v-model="roomNo" @focus="roomNoFocus" v-if="!isPad">
                <input type="text" placeholder="请输入房号（选填）" v-model="roomNo"  v-else disabled>
              </div>
              <div class="remark" @click="isDevice ? remarkTip() : ''">
                <input type="text" placeholder="请输入备注请输入备注（选填）" v-model="remark" v-if="!isDevice" maxlength="10">
                <input type="text" placeholder="请输入备注请输入备注（选填）" v-model="remark" v-else disabled>
              </div>
            </div>
          </div>
          <div class="btn">
            <span @click="sure" v-if="configList.orederRecorded">完成</span>
            <span @click="sure_" v-if="configList.orederPmsRecorded">完成并入账</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 输入房号弹框-->
    <div :class="isPad ? 'sureTip_ sureTip' : isDevice ? 'sureTip sureTipDevice' : 'sureTip'" v-if="roomNoTip">
      <div class="shadow"></div>
      <div class="rescind_info">
        <div class="info_content">
          <div class="close" @click="roomNoTip = false;"><img src="../../assets/ic-back-white.png" alt=""></div>
          <div class="title">房号</div>
          <div class="tip_lists">
            <div class="input">
              <input type="number" placeholder="0" v-model="roomNo" ref="trandeWidth" @input="changeInput_(roomNo)" v-if="!isPad">
              <input type="number" placeholder="0" v-model="roomNo" ref="trandeWidth" disabled v-else>
            </div>
            <div class="keyBords">
              <span v-for="item in keyBords_" @click="item == '清除' ? clear($event) : keyEntry_($event, item)"><span>{{item}}</span></span>
              <span  @click="keyCancel_($event)"><img src="../../assets/ic-close_.png" alt=""></span>
            </div>
          </div>
          <el-button type="primary" :loading="trandeLoading" class="btn" @click="sureFun">确定</el-button>
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
  import { swiper, swiperSlide } from 'vue-awesome-swiper'
  require('swiper/dist/css/swiper.css');
  export default {
    name: 'collectionSuccess',
    components: {loadingList, swiper, swiperSlide, toast},
    data () {
      return {
        toastShow: false,   // toast
        toastTxt: '',       // toast txt
        loadingShow: false,  // loading
        loadingText: '加载中...',    // loading 语
        collectionSuccess: false,   // 模板的显示和隐藏
        payType: sessionStorage.getItem('payType') ? sessionStorage.getItem('payType') :1,   // 1表示收款 2表示预授权收款
        detail: sessionStorage.getItem('collectionSuccessList') ? JSON.parse(sessionStorage.getItem('collectionSuccessList')) : {},   // 收款信息
        swiperOption: {
          slidesPerView: 4,
          spaceBetween: 30,
          initialSlide: 0, // 设定初始化时slide的索引
        },
        dataimg: [],   // 轮播
        roomNo: '',  // 输入房号
        remark: '',  // 备注
        roomNoTip: false,  // 输入房号弹框
        keyBords_: [1, 2, 3, 4, 5, 6, 7, 8, 9, '清除', 0],    // 键盘
        trandeLoading: false,  // 确定loading
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false,  // 判断是否是移动iPad
        isDevice: sessionStorage.getItem('isDevice') == 'true' ? true : false,  // 判断是否是双屏设备
        configList: {
          orederRecorded: false,
          orederPmsRecorded: false,
        },  // 权限
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto', 'getTagList', 'filllnPay'
      ]),

      // 完成事件
      sure () {
        this.sureFuntion(false);
      },

      sure_ () {
        this.sureFuntion(true);
      },

      // 完成及入账公共接口
      sureFuntion(boolean) {
        let data = {
          id: this.detail.id,
          flowId: this.detail.flowId,
          roomNo: this.roomNo,
          remark: this.remark,
          tag: this.dataimg[this.swiperOption.initialSlide].name,
          checkInBill: boolean
        };
        console.log('data111', data);
        this.filllnPay({
          data: data,
          onsuccess: body =>{
            if (body.data.code == 0 || body.data.errcode == 0) {
              this.goto(-1);
            }
          }
        });
      },

      // 房号提示框
      roomNoFocus() {
        this.roomNoTip = true;
        if (this.roomNo.length != 0) {
          this.changeInput_(this.roomNo);
        }
      },

      // tab
      swiperClick(index) {
        this.swiperOption.initialSlide = index;
      },

      // 监听input
      changeInput_ (val) {
        let len = val.length;
        if (len >= 15) {
          len = 15;
        }
        this.$nextTick(() => {
          if (this.isPad) {
            this.$refs.trandeWidth.style.width = (32 + len * 12) + 'px';
          }else if (this.isDevice) {
            this.$refs.trandeWidth.style.width = (40 + len * 15) + 'px';
          }else {
            this.$refs.trandeWidth.style.width = (24 + len * 27) + 'px';
          }
        })
      },

      // 查询键盘事件
      keyEntry_(event, item) {
        event.preventDefault();
        this.roomNo+=item;
        this.changeInput_(this.roomNo);
      },

      // 查询键盘删除事件
      keyCancel_(event) {
        event.preventDefault();
        this.roomNo = this.roomNo.substr(0, this.roomNo.length - 1);
        this.changeInput_(this.roomNo);
      },

      // 清除
      clear(event) {
        event.preventDefault();
        this.roomNo = '';
        this.changeInput_(this.roomNo);
      },

      // 确定
      sureFun() {
        this.trandeLoading = true;
        setTimeout(() => {
          this.trandeLoading = false;
          this.roomNoTip = false;
        }, 500)
      },

      // 双屏提示
      remarkTip() {
        this.$toastMsg({
          toastTip: true,
          toastTxt_: '当前设备暂不支持输入',
        });
      },


      // 获取标签
      getTags() {
        this.getTagList({
          onsuccess: body => {
            if (body.data.code == 0 || body.data.errcode == 0) {
              body.data.data.forEach(item => {
                let icon_ = item.icon;
                let images_ = item.images;
                if (icon_ && icon_.indexOf("https") < 0) {
                  item.icon = icon_.replace('http:', 'https:')
                }
                if (images_ && images_.indexOf("https") < 0) {
                  item.images = images_.replace('http:', 'https:')
                }
              });
              this.dataimg = body.data.data;
              console.log('this.dataimg', this.dataimg);
            }
            this.collectionSuccess = true;
            this.loadingShow = false;
          },
          onfail: body => {
            this.collectionSuccess = true;
            this.loadingShow = false;
          },
          onerror: body => {
            this.collectionSuccess = true;
            this.loadingShow = false;
          }
        })
      },

      goBack () {
        this.goto(-1);
      },

    },
    mounted () {
      this.collectionSuccess = false;
      this.loadingShow = true;
      this.getTags();

      if (this.isPad) {
        window.getBack = this.goBack;
      }
    },
    beforeMount () {
      // 权限
      let arr = sessionStorage.getItem('configList') ? JSON.parse(sessionStorage.getItem('configList')) : [];
      arr.forEach(item => {
        if (item.authority == 'independent_trade_receipt_order_recorded') {
          this.configList.orederRecorded = true;
        }
        if (item.authority == 'independent_trade_receipt_order_pms_recorded') {
          this.configList.orederPmsRecorded = true;
        }
      });
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .collectionSuccess {
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
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 13vw 5vw 0;
      .success_fl {
        .success_content {
          position: relative;
          opacity: 0.8;
          border: 3px solid #BAF0FC;
          border-radius: 20px;
          width: 38vw;
          .success_title {
            background: #BAF0FC;
            border-radius: 2.5vw;
            padding: 0 4.6vw;
            height: 4.3vw;
            line-height: 4.3vw;
            color: #252E5B;
            font-size: .42rem;
            position: absolute;
            left: 50%;
            top: 0;
            transform: translate(-50%, -50%);
          }
          .lists {
            padding: 3.2vw 4.2vw;
            .list {
              padding: 1.6vw 0;
              border-bottom: 1px solid #e4e4e4;
              width: 100%;
              display: inline-flex;
              align-items: center;
              justify-content: space-between;
              .name {
                color: #888;
                font-size: .42rem;
              }
              .content {
                color: #333;
                font-size: .42rem;
              }
            }
            .list:last-of-type {
              border-bottom: 0;
            }
          }
        }
      }
      .success_fr {
        width: 40vw;
        .title {
          border-bottom: 1px solid #EEEEEE;
          width: 100%;
          padding-bottom: .28rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          img {
            width: 4.6vw;
            display: inline-flex;
            margin-right: .36rem;
          }
          span {
            color: #666;
            font-size: .68rem;
          }
        }
        .collection_carousel {
          width: 100%;
          padding-top: 2.4vw;
          img {
            display: block;
            width: 5vw;
            margin: 0 auto .12rem;
          }
          span {
            color: #888888;
            font-size: .32rem;
          }
          span.active {
            color: #4C88FF;
          }
          .collection_remark {
            background: #F7F7F7;
            border-radius: 6px;
            padding: 0 .5rem;
            display: block;
            margin-top: .6rem;
            .roomNo {
              border-bottom: 1px solid #e4e4e4;
            }
            div {
              input {
                outline: none;
                font-size: .44rem;
                color: #888888;
                border: none;
                padding: 2vw 0;
                width: 100%;
                background-color: transparent;
              }
            }
          }
        }
        .btn {
          margin-top: 5vw;
          display: flex;
          justify-content: space-between;
          align-items: center;
          span {
            width: 48%;
            border-radius: 40px;
            height: 1.24rem;
            line-height: 1.24rem;
            font-size: .48rem;
          }
          span:first-of-type {
            background: #F7F7F7;
            color: #333;
          }
          span:last-of-type {
            background: #4C88FF;
            color: #fff;
          }
          span:only-of-type {
            background: #4C88FF;
            color: #fff;
            width: 100%;
          }
        }
      }
    }
  }
  .collectionSuccess_ {
    .collection_title {
      padding: 12px 15px;
      width: calc(100vw - 30px);
      font-size: 18px;
    }
    .collection_content {
      padding: 110px 14vw 0;
      .success_fl {
        width: 40%;
        .success_content {
          width: 100%;
          .success_title {
            padding: 4px 36px;
            height: 32px;
            line-height: 32px;
            font-size: 15px;
            font-family: 'SourceHanSansCN-Medium';
          }
          .lists {
            padding: 34px 30px 16px;
            .list {
              padding: 13px 0;
              .name {
                font-size: 14px;
              }
              .content {
                font-size: 14px;
              }
            }
          }
        }
      }
      .success_fr {
        width: 44%;
        margin-top: -20px;
        .title {
          padding-bottom: 16px;
          img {
            width: 36px;
            margin-right: 8px;
          }
          span {
            font-family: 'SourceHanSansCN-Bold';
            font-size: 24px;
          }
        }
        .collection_carousel {
          padding-top: 24px;
          img {
            width: 50px;
            margin: 0 auto .12rem;
          }
          span {
            color: #888888;
            font-size: 14px;
          }
          .collection_remark {
            padding: 0 .5rem;
            margin-top: 14px;
            div {
              input {
                font-size: 14px;
                padding: 16px 0;
              }
            }
          }
        }
        .btn {
          margin-top: 40px;
          span {
            height: 46px;
            line-height: 46px;
            font-size: 16px;
            color: #fff;
            letter-spacing: 4px;
          }
          span:last-of-type {
            letter-spacing: 2px;
          }
        }
      }
    }
  }
  .collectionSuccessDevice {
    .collection_title {
      padding: 20px 60px;
      font-size: 26px;
      width: calc(100vw -120px);
    }
    .collection_content {
      padding: 11vw 15vw 0;
      .success_fl {
        width: 38%;
        .success_content {
          width: 100%;
          .success_title {
            padding: 0 82px;
            height: 68px;
            line-height: 68px;
            font-size: 28px;
          }
          .lists {
            padding: 50px 62px;
            .list {
              padding: 32px 0;
              .name {
                font-size: 24px;
              }
              .content {
                font-size: 24px;
              }
            }
          }
        }
      }
      .success_fr {
        width: 40%;
        margin-top: -34px;
        .title {
          padding-bottom: 20px;
          img {
            width: 78px;
            margin-right: 30px;
          }
          span {
            color: #666;
            font-size: 36px;
          }
        }
        .collection_carousel {
          padding-top: 20px;
          img {
            width: 86px;
            margin: 0 auto 10px;
          }
          span {
            font-size: 20px;
          }
          .collection_remark {
            padding: 0 18px;
            display: block;
            margin-top: 20px;
            div {
              input {
                font-size: 24px;
                padding: 30px 0;
              }
            }
          }
        }
        .btn {
          margin-top: 96px;
          span {
            width: 48%;
            border-radius: 40px;
            height: 80px;
            line-height: 80px;
            font-size: 24px;
          }
        }
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
          padding: 8px 50px;
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

  .sureTipDevice {
    .rescind_info {
      .info_content {
        position: relative;
        padding: 20px 50px;
        .close {
          top: -76px;
          img {
            width: 40px;
          }
        }
        .title {
          padding: 15px 56px;
          font-size: 26px;
        }
        .tip_lists {
          width: 25vw;
          .input {
            border-bottom: 1px solid #eee;
            input {
              width: 40px;
              font-size: 40px;
            }
            span {
              font-size: 30px;
              margin-right: 2px;
            }
          }
          .keyBords {
            padding-top: 32px;
            span {
              height: 76px;
              line-height: 76px;
              font-size: 40px;
              margin: 0 1.1vw 1vw 0;
              font-weight: bold;
              img {
                width: 52px;
              }
            }
            span:nth-of-type(10) {
              span {
                font-weight: normal;
                font-size: 30px;
              }
            }
          }
        }
        .btn {
          bottom: -138px;
          padding: 30px 0;
          font-size: 28px;
        }
      }
    }
  }

</style>
