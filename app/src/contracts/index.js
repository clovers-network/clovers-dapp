/* global web3:true */

import contract from 'truffle-contract'

// import artifacts
import cloverTokenArtifacts from '../../../build/contracts/CloverToken.json'

// create contracts
const CloverToken = contract(cloverTokenArtifacts)
CloverToken.setProvider(web3.currentProvider)

export {
  CloverToken
}
