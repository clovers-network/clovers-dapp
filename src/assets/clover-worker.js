import Reversi from 'clovers-reversi'

let running = false
let hashRate = 0

self.addEventListener(
  'message',
  event => {
    const { data } = event
    const reversi = new Reversi()
    if (data === 'start') {
      running = true
      mine()
      function mine () {
        hashRate++
        reversi.mine()
        // reversi.playGameMovesString('c4c3e6d6c6c5c2b4a4')
        if (reversi.symmetrical) {
          self.postMessage(reversi)
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
  },
  false
)
