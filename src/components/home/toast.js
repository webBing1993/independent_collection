/**
 * Created by Administrator on 2019/11/5 0005.
 */
import Vue from 'vue'
import toastMsg from './toast.vue'

const PopupBox = Vue.extend(toastMsg);

toastMsg.install = function (data) {
  let instance = new PopupBox({
    data
  }).$mount();

  document.body.appendChild(instance.$el);

  Vue.nextTick(() => {
    instance.show = true
    // show 和弹窗组件里的show对应，用于控制显隐
  })
}

export default toastMsg
