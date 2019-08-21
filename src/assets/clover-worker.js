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
        // reversi.playGameMovesString('c4e3f3c5d3e2c6f4f5b4f1g5a3d6b5b3g4e1f2b7d1h4h3a5e7d2h5g1b6g2h1a6a8c7a2g3e6b8h2c3a4h6h7g6f6e8d8c8c2f8g8b2a7g7c1b1h8a1d7f7')
        if (reversi.symmetrical) {
          self.postMessage(reversi)
        }
        if (running) {
          setTimeout(() => {
            mine()
          }, 0)
        }
      }
      function postHashrate () {
        self.postMessage({ hashRate })
        hashRate = 0
        setTimeout(postHashrate, 1000)
      }
      postHashrate()
    } else if (data === 'stop') {
      running = false
      self.close()
    } else {
      self.close()
    }
  },
  false
)
