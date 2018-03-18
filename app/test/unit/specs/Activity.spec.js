import Vue from 'vue'
import Activity from '@/components/Activity'

describe('Activity.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Activity)
    const vm = new Constructor().$mount()
    expect(typeof vm.pagedActivity)
      .to.equal('Object')
  })
})
