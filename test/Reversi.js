var utils = require('web3-utils')
var Reversi_ = artifacts.require("./Reversi.sol")
var ReversiMock = artifacts.require("./ReversiMock.sol")
var Reversi = require('../app/src/assets/reversi.js')
let _ = '        '

contract('Reversi', async function(accounts)  {
  let reversi, reversiMock
  before((done) => {
      (async () => {
          reversi = await Reversi_.new();
          // reversi = await Reversi_.deployed()

          await ReversiMock.link('Reversi', reversi.address)
          reversiMock = await ReversiMock.new()
          // reversiMock = await ReversiMock.deployed()

          done()
      })()
  })

  describe('Reversi.sol', function () {
    let _realTokenId = '0x5555555565556955695566955aa55555'
    let _realMoves = [
      new web3.BigNumber('0xcb76aedd77baf6cfcfbeeb5362d6affb54f9d53971d37f37de9bf87c', 16),
      new web3.BigNumber('0xc5670faa513068f1effd8f32a14ba11b64ca7461c193223c00000000', 16)
    ]    
    let _emptyMoves = [
      new web3.BigNumber('0x0', 16),
      new web3.BigNumber('0x0', 16)
    ]

    it('should play a valid game without error', async function () {
        let isValid = await reversi.isValid(_realMoves)
        assert(isValid, 'Game was not valid')
    })
    it('should fail when plaing empty moves game', async function () {
        // let getGame = await reversi.getGame(_emptyMoves)
        // console.log(getGame.map((a) => typeof (a) === 'object' ? a.toString() : a))
        // let logGame = await reversiMock.logGame(_emptyMoves)
        // console.log(logGame.receipt.logs)
        let isValid = await reversi.isValid(_emptyMoves)
        // console.log(isValid)
        assert(!isValid, 'Game was in fact valid')
    })
  })

})