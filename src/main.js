import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// import './registerServiceWorker'

router.beforeEach((to, from, next) => {
  console.log("to.path", to.path);
  if (
    // process.env.NODE_ENV !== "development" &&
    store.state.network &&
    (store.getters.notRinkeby && store.getters.account) &&
    (to.path !== "/" || to.path !== "/about")
  ) {
    console.log("sth");
    next("/");
  } else {
    next();
  }
});
router.afterEach(() => {
  if (ga) ga("send", "pageview");
});

import BN from "bignumber.js";
Object.defineProperty(Vue.prototype, "$BN", { value: BN });

import Clv from "@/components/Clv";
import CloverIcon from "@/components/CloverIcon";
import CloverGridItem from "@/components/CloverGridItem";

Vue.component("clv", Clv);
Vue.component("clover-icon", CloverIcon);
Vue.component("clover-grid-item", CloverGridItem);

Vue.config.productionTip = false;
Vue.config.devtools = true;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
