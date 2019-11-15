import qs from 'qs'
import axios from 'axios'
import router from '../../router/index.js'
import httpTool from '../../tool/httpTool.js'
import Vue from 'vue'

const actions = {

  goto: (ctx, param) => {
    if (typeof param === 'number') {
       router.go(param)
    } else {
      router.push(param)
    }
  },
  replaceto: (ctx, param) => {
    router.replace(param)
  },

  request: (ctx, param) => {
    axios({
      url: httpTool.httpUrlEnv() + sessionStorage.getItem('windowUrl') + 'independent-trade' + param.url,
      baseURL: '/',
      method: param.method || 'GET',
      params: qs.stringify(param.params) || null,
      data: param.body || null,
      timeout: param.timeout || 120000,
    }).then(response => {
      sessionStorage.setItem('onLoad',true);
      console.log("response",response);
      if (response.data.code == 0 || response.data.errcode == 0) {
        param.onSuccess && param.onSuccess(response)
      }
      else if (response.data.errcode !== 0 || response.data.code != 0) {

        param.onFail && param.onFail(response)
      }
      else {
        param.onFail && param.onFail(response)
      }
    }).catch(
      error => {
        // ctx.dispatch ('showLoading', false);
        if(error){
          console.log("error",error);
          console.log('error.response',error.response);
          if (error.response) {

          }else {

          }
          param.onError && param.onError(error);
        }

      }
    )
  },

  resource: (ctx, param) => {
    axios({
      url: httpTool.httpUrlEnv() + sessionStorage.getItem('windowUrl') + 'independent-trade' + param.url,
      method: param.method || 'GET',
      baseURL: '/',
      headers: param.headers || {
        "X-auth-token": sessionStorage.tokenId
      },
      params: qs.stringify(param.params) || null,
      data: param.body || null,
      timeout: param.timeout || 120000,
      credentials: false,
      emulateHTTP: false,
      emulateJSON: param.emulateJSON == false ? param.emulateJSON : true,
    }).then(response => {
      console.log("response",response);
      if (response.data.code == 0 || response.data.errcode == 0 || response.data.code === 100002) {
        param.onSuccess && param.onSuccess(response)
      }
      else if (response.data.code === 10004) {
        router.replace('/');
      }
      else if (response.data.errcode != 0 || response.data.code != 0 || response.data.code != 10004) {
        Vue.prototype.$toastMsg({
          toastTip: true,
          toastTxt_:  response.data.msg || response.data.errmsg,
        });
        param.onFail && param.onFail(response)
      }
      else {
        Vue.prototype.$toastMsg({
          toastTip: true,
          toastTxt_:  response.data.msg || response.data.errmsg,
        });
        param.onFail && param.onFail(response)
      }
    }).catch(
      error => {
        if(error){
          console.log("error",error);
          if (error.response) {

          }else {

          }
          param.onError && param.onError(error);
        }

      }
    )
  },
  resource_: (ctx, param) => {
    console.log("sessionStorage.tokenId111", sessionStorage.tokenId);
    axios({
      url: httpTool.httpUrlEnv() + sessionStorage.getItem('windowUrl') + 'independent-trade' + param.url,
      method: param.method || 'GET',
      baseURL: '/',
      headers: param.headers || {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        "X-auth-token": sessionStorage.tokenId
      },
      params: qs.stringify(param.params) || null,
      data: param.body || null,
      timeout: param.timeout || 120000,
      credentials: false,
      emulateHTTP: false,
      emulateJSON: param.emulateJSON == false ? param.emulateJSON : true,responseType: 'blob'  //设置响应的数据类型为一个包含二进制数据的 Blob 对象，必须设置！！！

    }).then(response => {
      console.log("response",response);
      if (response.data.size != 14) {
        param.onSuccess && param.onSuccess(response)
      }
      else {
        Vue.prototype.$toastMsg({
          toastTip: true,
          toastTxt_:  response.data.msg || response.data.errmsg,
        });
        param.onFail && param.onFail(response)
      }
    }).catch(
      error => {
        if(error){
          console.log("error",error);
          if (error.response) {

          }else {

          }
          param.onError && param.onError(error);
        }

      }
    )
  },

  // 获取验证码
  getPhoneCode (ctx, param) {
    ctx.dispatch('request', {
      url: '/auth/sms',
      method: 'POST',
      body: param.data,
      emulateJSON: false,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 登录
  loginEntry (ctx, param) {
    ctx.dispatch('request', {
      url: '/auth/sms/login',
      method: 'POST',
      body: param.data,
      emulateJSON: false,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获取权限接口
  configList (ctx, param) {
    ctx.dispatch('resource', {
      url: '/auth/info',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 判断是否支持微信和支付宝
  supportList (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/support',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 交易查询列表
  transactionList (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/trade/page',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // XLS文件流获取
  exportXls (ctx, param) {
    ctx.dispatch('resource_', {
      url: '/payment/export',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获取交易笔数
  getAllNum (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/statistics/trade',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获取交易总金额
  getAllTotal (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/statistics/money',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 交易详情
  transactionDetail (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/'+param.id+'/detail',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 交易退款
  refund (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/refund',
      method: 'PUT',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获取预授权列表
  getSweepLists (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/pre-authorization/page',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 预授权撤销
  resciendCancel (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/auth/cancel',
      method: 'PUT',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 预授权消费
  consume (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/auth/consume',
      method: 'PUT',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 发起支付请求
  codeAuth (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/authCode',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 查询支付状态
  orderReach (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/order/result',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 获取支付成功的tag
  getTagList (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/tags',
      method: 'GET',
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

  // 交易成功完成事件
  filllnPay (ctx, param) {
    ctx.dispatch('resource', {
      url: '/payment/fillIn',
      method: 'POST',
      body: param.data,
      onSuccess: (body, headers) => {
        param.onsuccess ? param.onsuccess(body, headers) : null
      },
      onFail:(body, headers) => {
        param.onfail ? param.onfail(body, headers) : null
      },
      onError:(body, headers) => {
        param.onerror ? param.onerror(body, headers) : null
      },
    })
  },

};
export default {
  actions: actions
}
