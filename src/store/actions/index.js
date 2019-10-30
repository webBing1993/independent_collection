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


  resource: (ctx, param) => {
    axios({
      url: httpTool.httpUrlEnv() + sessionStorage.getItem('windowUrl') + 'double-screen' + param.url,
      method: param.method || 'GET',
      baseURL: '/',
      headers: param.headers || {
        Session: sessionStorage.session_id,
        token: sessionStorage.session_id
      },
      params: qs.stringify(param.params) || null,
      data: qs.stringify(param.body) || null,
      timeout: param.timeout || 120000,
      credentials: false,
      emulateHTTP: false,
      emulateJSON: param.emulateJSON ? param.emulateJSON:true,
    }).then(response => {
      console.log("response",response);
      if (response.data.code == 0 || response.data.errcode == 0 || response.data.code === 888000 || response.data.code === 20005 || response.data.code == 20002 || response.data.code == 20003 || response.data.code == 20006 || response.data.code == 10006 || response.data.code == 100049 || response.data.code == 100036) {
        param.onSuccess && param.onSuccess(response)
      }
      else if (response.data.code === 10004) {
        router.replace('/');
      }
      else if (response.data.errcode != 0 || response.data.code != 0 || response.data.code != 10004) {
        // Vue.prototype.$message.error(response.data.msg);
        Vue.prototype.$toast({
          message: response.data.msg || response.data.errmsg,
          iconClass: 'icon ',
        });
        param.onFail && param.onFail(response)
      }
      else {
        Vue.prototype.$toast({
          message: response.data.msg || response.data.errmsg,
          iconClass: 'icon ',
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

};
export default {
  actions: actions
}
