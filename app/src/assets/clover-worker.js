import Clover from './clovers'

let running = false
let hashRate = 0

self.addEventListener('message', (event) => {
  const { data } = event
  const clover = new Clover()
  if (data === 'start') {
    running = true
    mine()
    function mine () {
      hashRate++
      clover.mine()
      if (clover.symmetrical) {
        console.log('symmetry')
        self.postMessage(clover)
      }
      if (running) {
        setTimeout(() => {
          mine()
        }, 0)
      }
    }
    setInterval(() => {
      self.postMessage({ hashRate })
      hashRate = 0
    }, 1000)
  } else if (data === 'stop') {
    running = false
    self.close()
  } else {
    self.close()
  }
}, false)
