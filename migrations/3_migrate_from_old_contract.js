
var Clovers = artifacts.require("./Clovers.sol");
var ClubToken = artifacts.require("./ClubToken.sol");
var OldToken = artifacts.require('../contracts/OldToken.sol');

var Reversi = require('../app/src/assets/reversi.js')

module.exports = async function(deployer, helper, accounts)  {
  deployer.then(async () => {
    try {
      var doFors = (n, i = 0) => {
        return new Promise((resolve, reject) => {
          try {
            if (i === n) {
              resolve()
            } else {
              doFor(i).then(() => {
                doFors(n, i + 1).then(() => {
                  resolve()
                })
              })
            }
          } catch(error) {
            reject(error)
          }
        })
      }
      var doFor = (i) => {
        return new Promise(async (resolve, reject) => {
          try{
            var tx = await oldToken.adminMineClover(
              new web3.BigNumber(i).add('0xFFF'),
              new web3.BigNumber(i).add('0xFFF'),
              new web3.BigNumber(i).add('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'),
              new web3.BigNumber(i)
            )
            resolve()
          } catch(error) {
            reject(error)
          }
        })
      }

      var clovers = await Clovers.deployed()
      if (deployer.network === 'rinkeby'){
          var oldToken = await OldToken.at('0xcc0604514f71b8d39e13315d59f4115702b42646')
          var getCloversCount = await oldToken.getCloversCount()
      } else {

        // var oldToken = await deploy(deployer, OldToken)
        // await deployer.deploy(OldToken)
        // let oldToken = await OldToken.deployed()
        var oldToken = await OldToken.at('0xd8672a4A1bf37D36beF74E36edb4f17845E76F4e')

        var getCloversCount = await oldToken.getCloversCount()

        if (!getCloversCount.eq(10)) {

          await doFors(10)
          // for (var i = 0; i < 10; i ++) {
          //   var tx = await oldToken.adminMineClover(
          //     new web3.BigNumber(i).add('0xFFF'),
          //     new web3.BigNumber(i).add('0xFFF'),
          //     new web3.BigNumber(i).add('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'),
          //     new web3.BigNumber(i)
          //   )
          //   // console.log(tx.receipt.status)
          // }
        }
      }

      var doFor = (i) => {
        return new Promise(async (resolve, reject) => {
          try{
            var clover = await oldToken.getCloverByKey(i)
            var _tokenId = clover[1]
            var reversi = new Reversi()
            reversi.byteBoardPopulateBoard(_tokenId.toString(16))
            reversi.isSymmetrical()
            var symmetries = new web3.BigNumber(0)
            if (reversi.symmetrical) {
              symmetries = symmetries.add(reversi.RotSym ? '0x10000' : 0)
              symmetries = symmetries.add(reversi.Y0Sym  ? '0x01000' : 0)
              symmetries = symmetries.add(reversi.X0Sym  ? '0x00100' : 0)
              symmetries = symmetries.add(reversi.XYSym  ? '0x00010' : 0)
              symmetries = symmetries.add(reversi.XnYSym ? '0x00001' : 0)
            }
            var _to = clover[3]
            var first32Moves = clover[4]
            var lastMoves = clover[5]
            var moves = [first32Moves, lastMoves]
            var movesHash = await clovers.getHash(moves)
            var blockNumber = await getBlockNumber()

            // setCommit
            var tx = await clovers.setCommit(movesHash, _to)
            // console.log(tx.receipt.status)
            // setBlockMinted
            tx = await clovers.setBlockMinted(_tokenId, blockNumber)
            // console.log(tx.receipt.status)
            // setCloverMoves
            tx = await clovers.setCloverMoves(_tokenId, moves)
            // console.log(tx.receipt.status)

            if (reversi.symmetrical) {
              // setSymmetries
            tx = await clovers.setSymmetries(_tokenId, symmetries)
            // console.log(tx.receipt.status)
              // setAllSymmetries
              var allSymmetries = await clovers.getAllSymmetries()
              allSymmetries[0] = allSymmetries[0].add(1)
              allSymmetries[1] = allSymmetries[1].add(reversi.Y0Sym  ? 1 : 0)
              allSymmetries[2] = allSymmetries[2].add(reversi.X0Sym  ? 1 : 0)
              allSymmetries[3] = allSymmetries[3].add(reversi.XYSym  ? 1 : 0)
              allSymmetries[4] = allSymmetries[4].add(reversi.XnYSym ? 1 : 0)
            tx = await clovers.setAllSymmetries(...allSymmetries)
            // console.log(tx.receipt.status)
            }
            tx = await clovers.mint(_to, _tokenId)
            // console.log(tx.receipt.status)
            resolve()
          } catch(error) {
            reject(error)
          }
        })
      }
      await doFors(getCloversCount.toNumber())
    } catch (error) {
      console.log(error)
    }
  })

}

function getBlockNumber () {
  return new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((error, result) => {
      if (error) reject(error)
      resolve(result)
    })
  })
}
function deploy(deployer, params) {
  return new Promise((resolve, reject) => {
    deployer.deploy(...params, (error) => {
      if (error) {
        reject()
      } else {
        resolve()
      }
    })
  })
}