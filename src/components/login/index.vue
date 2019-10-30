<template>
    <div>
      <div class="login">
        <div class="login_img"><img src="../../assets/img-load.png" alt=""></div>
        <div class="content">
          <div class="collection_content">
            <p class="title">欢迎登录移动收银后台</p>
            <div class="phone">
              <input name="phone" type="tel" min="1" id="input_id" placeholder="请输入11位手机号" v-model="phone" maxlength="11"/>
              <el-button :plain="true" v-if="btntxt != '获取验证码' && btntxt != '重新获取'" class="btns btning">{{btntxt}}</el-button>
              <el-button :plain="true" @click="sendcode" :class="btntxt == '获取验证码' || btntxt == '重新获取' ? 'btns' : 'btns btning'" v-else>{{btntxt}}</el-button>
            </div>
            <div class="code">
              <input type="number" placeholder="请输入6位验证码" v-model="code"  maxlength="6"/>
            </div>
            <el-button type="primary" class="loginBtn" :loading="loginLoading"  @click="login()" >确定</el-button>
          </div>
        </div>
      </div>
      <toast :toastTxt="toastTxt" v-if="toastShow"></toast>
    </div>
</template>
<script>
  import {mapState,mapActions} from 'vuex';
  import ElCol from "element-ui/packages/col/src/col";
  import toast from '../home/toast.vue'

  export default {
    name: 'login',
    components: {ElCol, toast},
    data () {
      return {
        toastShow: false,   // toast
        toastTxt: '',       // toast txt
        disabled:false,
        time:0,
        btntxt: "获取验证码",
        code: '',
        phone: '',
        entryAll: false,  // 判断是否可以点击确定按钮
        loginLoading: false,
      }
    },
    methods: {
      ...mapActions([
        'goto', 'getCode', 'loginEntry'
      ]),

      //验证手机号码部分
      sendcode(){
        let reg = 11 && /^((13|14|15|16|17|18|19)[0-9]{1}\d{8})$/;
        if(this.phone == ''){
          this.toastTxt = '请输入手机号码';
          this.toastShow = true;
        }else if(!reg.test(this.phone)){
          this.toastTxt = '手机格式不正确';
          this.toastShow = true;
        }else{
          this.time = 60;
          this.disabled = true;
          this.getCode({
            data: {
              phone: this.phone,
              type: 'key_channel'
            },
            onsuccess: body => {
              this.entryAll = true;
              console.log('body.data', body.data);
              if (body.data.code == 0) {
                if (body.data.data == '' || body.data.data == null) {
                  this.phoneCode = 1;
                  this.timer();
                }else {
                  this.toastTxt = body.data.msg;
                  this.toastShow = true;
                }
              }else {
                this.toastTxt = body.data.msg;
                this.toastShow = true;
              }
            },
            onfail: body => {
              this.toastTxt = body.data.msg;
              this.toastShow = true;
            }
          })
        }
      },

      timer() {
        if (this.time > 0) {
          this.time--;
          this.btntxt = this.time+"s后重新获取";
          setTimeout(this.timer, 1000);
        } else{
          this.time = 0;
          this.btntxt = "重新获取";
          this.disabled = false;
        }
      },

      // 登录
      login(){
        let reg = 11 && /^((13|14|15|16|17|18|19)[0-9]{1}\d{8})$/;
        if(this.phone == ''){
          this.toastTxt = '请输入手机号码';
          this.toastShow = true;
        }else if(!reg.test(this.phone)){
          this.toastTxt = '手机格式不正确';
          this.toastShow = true;
          if (this.code == '') {
            this.toastTxt = '请输入验证码';
            this.toastShow = true;
          }else if (this.code.length > 6) {
            this.toastTxt = '请输入６位数验证码';
            this.toastShow = true;
          }
        }else {
          if (this.code == '') {
            this.toastTxt = '请输入验证码';
            this.toastShow = true;
          } else if (this.code.length != 6) {
            this.toastTxt = '请输入６位数验证码';
            this.toastShow = true;
          } else {
            this.loginLoading = true;
            this.loginEntry({
              data: {
                phone: this.phone,
                code: this.code
              },
              onsuccess: body => {
                console.log('body:',body);
                if (body.data.code == 0 && body.data.data) {
                  sessionStorage.setItem('avatar',body.data.data.avatar);
                  sessionStorage.setItem('name',body.data.data.name);
                  sessionStorage.session_id = body.data.data.token;
                  sessionStorage.hotel_id = body.data.data.hotelId;
                }else {
                  this.loginLoading = false;
                  this.toastTxt = body.data.msg;
                  this.toastShow = true;
                }
              },
              onfail: body => {
                this.loginLoading = false;
                this.toastTxt = body.data.msg;
                this.toastShow = true;
              },
              onerror: body => {
                this.loginLoading = false;
                this.toastTxt = body.data.msg;
                this.toastShow = true;
              }
            })
          }
        }
      },
    },

    mounted () {

    },
    beforeRouteLeave(to,from,next) {

      next();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

  .login {
    display: flex;
    .login_img {
      width: 10.6rem;
      height: 100vh;
      img {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
    .content {
      width: calc(100vw - 10.6rem);
      position: relative;
      height: 100vh;
      .collection_content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        .title {
          font-size: .84rem;
          color: #333;
          margin-bottom: 1.54rem;
        }
        div {
          border-bottom: 1px solid #EEEEEE;
          width: 8.8rem;
          position: relative;
          padding: .33rem 0;
          margin-bottom: .58rem;
          text-align: left;
          input {
            width: 6rem;
            border: none;
            background-color: transparent;
            font-size: .56rem;
            color: #999;
          }
          .btns {
            color: #4C88FF;
            font-size: .4rem;
            cursor: pointer;
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            border: none;
          }
          .btning {
            color: #999;
          }
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type="number"]{ -moz-appearance: textfield; }
        .loginBtn {
          margin-top: 1.07rem;
          background: #4C88FF;
          border-radius: .8rem;
          width: 7.8rem;
          text-align: center;
          height: 1.24rem;
          font-size: .48rem;
          cursor: pointer;
          color: #fff;
        }
      }
    }
  }

</style>
