<template>
  <div>
    <div class="collectionSuccess" v-show="collectionSuccess">
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
                <div class="content">{{detail.trandId}}</div>
              </div>
              <div class="list">
                <div class="name">时间</div>
                <div class="content">{{detail.time}}</div>
              </div>
              <div class="list">
                <div class="name">收款金额</div>
                <div class="content">{{detail.payMoney}}</div>
              </div>
              <div class="list">
                <div class="name">交易状态</div>
                <div class="content">{{detail.status == 0 ? '未完成' : '已完成'}}</div>
              </div>
              <div class="list">
                <div class="name">支付方式</div>
                <div class="content">{{detail.payStatus}}</div>
              </div>
              <div class="list">
                <div class="name">订单类型</div>
                <div class="content">{{detail.orderStatus == 0 ? '收款' : '预授权收款'}}</div>
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
            <swiper :options="swiperOption" ref="mySwiper">
              <swiper-slide v-for="(item, index) in dataimg" :key="index">
                <img :src="swiperOption.initialSlide == index ? item.src[1] : item.src[0]" alt="">
                <span :class="swiperOption.initialSlide == index ? 'active' : ''">{{item.txt}}</span>
              </swiper-slide>
            </swiper>
            <div class="collection_remark">
              <div class="roomNo" @click="isPad ? roomNoFocus() : ''">
                <input type="text" placeholder="请输入房号（选填）" v-model="roomNo" @focus="roomNoFocus" v-if="!isPad">
                <input type="text" placeholder="请输入房号（选填）" v-model="roomNo"  v-else disabled>
              </div>
              <div class="remark" @click="isDevice ? remarkTip() : ''">
                <input type="text" placeholder="请输入备注请输入备注（选填）" v-model="remark" v-if="!isDevice">
                <input type="text" placeholder="请输入备注请输入备注（选填）" v-model="remark" v-else disabled>
              </div>
            </div>
          </div>
          <div class="btn"><span @click="sure">完成</span></div>
        </div>
      </div>
    </div>
    <!-- 输入房号弹框-->
    <div class="sureTip" v-if="roomNoTip">
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
        detail: {
          trandId: '1234567890',
          time: '2019.10.24 09:50',
          payMoney: '200',
          status: '1',  // 0表示未完成 1表示已完成
          payStatus: '微信支付',
          orderStatus: 0,   // 0表示收款 1表示预授权收款
        },   // 收款信息
        swiperOption: {
          slidesPerView: 4,
          spaceBetween: 30,
          initialSlide: 0, // 设定初始化时slide的索引
          on:{
            // 使用es6的箭头函数，使this指向vue对象
            click: ()=>{
              // 通过$refs获取对应的swiper对象
              let swiper = this.$refs.mySwiper.swiper;
              this.swiperOption.initialSlide = swiper.clickedIndex;
            }
          }
        },
        dataimg: [{
          src: [require('../../assets/icon1.png'), require('../../assets/icon1_.png')],
          txt: '客房消费',
          },
          {
            src: [require('../../assets/icon2.png'), require('../../assets/icon2_.png')],
            txt: '前台消费',
          },
          {
            src: [require('../../assets/icon3.png'), require('../../assets/icon3_.png')],
            txt: '餐厅消费',
          },
          {
            src: [require('../../assets/icon4.png'), require('../../assets/icon4_.png')],
            txt: '其他',
          }
        ],   // 轮播
        roomNo: '',  // 输入房号
        remark: '',  // 备注
        roomNoTip: false,  // 输入房号弹框
        keyBords_: [1, 2, 3, 4, 5, 6, 7, 8, 9, '清除', 0],    // 键盘
        trandeLoading: false,  // 确定loading
        isPad: sessionStorage.getItem('isPad') == 'true' ? true : false,  // 判断是否是移动iPad
        isDevice: sessionStorage.getItem('isDevice') == 'true' ? true : false,  // 判断是否是双屏设备
      }
    },
    methods: {
      ...mapActions([
        'goto', 'replaceto',
      ]),

      // 完成事件
      sure () {
        this.goto(-1);
      },

      // 房号提示框
      roomNoFocus() {
        this.roomNoTip = true;
        if (this.roomNo.length != 0) {
          this.changeInput_(this.roomNo);
        }
      },

      // 监听input
      changeInput_ (val) {
        let len = val.length;
        if (len >= 15) {
          len = 15;
        }
        this.$nextTick(() => {
          this.$refs.trandeWidth.style.width = (24 + len * 27) + 'px';
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
        this.toastTxt = '当前设备暂不支持输入';
        this.toastShow = true;
      },
    },
    mounted () {
      this.collectionSuccess = true;
    },

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .collectionSuccess {
    .collection_title {
      border-bottom: 1px solid #EEEEEE;
      padding: .56rem .8rem;
      position: relative;
      text-align: center;
      color: #666;
      font-size: .56rem;
    }
    .collection_content {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.54rem 2rem 0;
      .success_fl {
        .success_content {
          position: relative;
          opacity: 0.8;
          border: 3px solid #BAF0FC;
          border-radius: 20px;
          width: 8.72rem;
          .success_title {
            background: #BAF0FC;
            border-radius: 35.2px;
            padding: 0 .98rem;
            height: 1.02rem;
            line-height: 1.02rem;
            color: #252E5B;
            font-size: .45rem;
            position: absolute;
            left: 50%;
            top: 0;
            transform: translate(-50%, -50%);
          }
          .lists {
            padding: 1.24rem 1rem;
            .list {
              padding: .4rem 0;
              border-bottom: 1px solid #979797;
              width: 100%;
              display: inline-flex;
              align-items: center;
              justify-content: space-between;
              .name {
                color: #888;
                font-size: .44rem;
              }
              .content {
                color: #333;
                font-size: .44rem;
              }
            }
          }
        }
      }
      .success_fr {
        width: 8.88rem;
        .title {
          border-bottom: 1px solid #EEEEEE;
          width: calc(100% - 2.12rem);
          padding-bottom: .28rem;
          padding-left: 2.12rem;
          display: inline-flex;
          align-items: center;
          img {
            width: 1.32rem;
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
          padding-top: .68rem;
          img {
            display: block;
            width: 1.24rem;
            margin: 0 auto .12rem;
          }
          span {
            color: #888888;
            font-size: .36rem;
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
              border-bottom: 1px solid #979797;
            }
            div {
              input {
                outline: none;
                font-size: .44rem;
                color: #888888;
                border: none;
                padding: .48rem 0;
                width: 100%;
                background-color: transparent;
              }
            }
          }
        }
        .btn {
          margin-top: 1.66rem;
          span {
            display: block;
            background: #4C88FF;
            border-radius: 40px;
            height: 1.24rem;
            line-height: 1.24rem;
            font-size: .48rem;
            color: #fff;
          }
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

</style>
