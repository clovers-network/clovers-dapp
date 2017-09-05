export default {
  name: state => state.name,
  symbol: state => state.symbol,
  account: state => state.account,
  balance: state => state.balance,
  amount: state => state.amount,
  address: state => state.address,
  status: state => state.status,
  hashRate: state => state.hashRate,
  mining: state => state.mining,
  miningPower: state => state.miningPower,
  clover: state => state.clover,
  allClovers: state => {
    let clovers = []
    state.registeredEvents.sort((a, b) => {
      return a.args.registeredEvent.toNumber() - b.args.registeredEvent.toNumber()
    }).forEach((e) => {
      if (e.event !== 'Registered') return
      if (e.args.newBoard) {
        clovers.push({
          board: e.args.board,
          lastPaidAmount: parseInt(e.args.lastPaidAmount),
          previousOwners: [e.args.newOwner]
        })
      } else {
        let cloverKey = clovers.findIndex((c) => c.board === e.args.board)
        if (cloverKey > -1) {
          let clover = clovers[cloverKey]
          clover.lastPaidAmount = parseInt(e.args.lastPaidAmount)
          clover.previousOwners.push(e.args.newOwner)
          clovers.splice(cloverKey, 1, clover)
        } else {
          console.error('Registered Event for board not yet in array', e)
        }
      }
    })
    return clovers
  }
}
