import Clover from "../assets/clovers";

// import xss from 'xss'

export default {
  submittingBoards: state => state.submittingBoards,
  readOnly: state => state.readOnly,
  notRinkeby: state => {
    return state.network !== 5777;
  },
  account: state => state.account,
  username: (state, getters) => {
    console.log("username calculated");
    return (
      state.users.find(
        u =>
          getters.account &&
          u.address.toLowerCase() === getters.account.toLowerCase()
      ) || { address: getters.account, name: getters.account }
    );
  },
  registeredEvents: state =>
    state.logs.filter(log => log.name === "Registered"),
  usernameEvents: state => state.usernameEvents,
  clovernameEvents: state => state.clovernameEvents,
  balance: state => state.balance,
  hashRate: state => state.hashRate,
  mining: state => state.mining,
  messages: state => state.messages,
  miningPower: state => state.miningPower,
  minedClovers: state => {
    console.log("mined clovers calculated");
    // return state.allMinedClovers || []
    return (
      (state.allMinedClovers.length &&
        state.allMinedClovers.map(c => {
          let clover =
            state.allClovers &&
            state.allClovers.find(ac => ac.board === "0x" + c.byteBoard);
          if (clover) {
            c.claimed = clover.created;
          }
          return c;
        })) ||
      []
    );
  },
  symmetries: state => {
    console.log("symmetries calculated");
    // return {Symmetricals: 0, RotSym: 0, X0Sym: 0, Y0Sym: 0, XYSym: 0, XnYSym: 0, PayMultiplier: 100}
    let Symmetricals = 0;
    let RotSym = 0;
    let X0Sym = 0;
    let Y0Sym = 0;
    let XYSym = 0;
    let XnYSym = 0;
    let reversi = new Clover();
    for (let i = 0; i < state.allClovers.length; i++) {
      let clover = state.allClovers[i];
      reversi.byteBoard = clover.board;
      reversi.byteBoardPopulateBoard();
      reversi.isSymmetrical();
      Symmetricals += reversi.symmetrical;
      RotSym += reversi.RotSym;
      X0Sym += reversi.X0Sym;
      Y0Sym += reversi.Y0Sym;
      XYSym += reversi.XYSym;
      XnYSym += reversi.XnYSym;
    }
    return {
      Symmetricals,
      RotSym,
      X0Sym,
      Y0Sym,
      XYSym,
      XnYSym,
      PayMultiplier: 100
    };
  }
};
