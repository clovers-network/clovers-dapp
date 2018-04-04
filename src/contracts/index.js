/* global web3:true */

import contract from 'truffle-contract'

// import artifacts
import clubTokenArtifacts from '../../../build/contracts/ClubToken.json'

// create contracts
const ClubToken = contract(clubTokenArtifacts)
ClubToken.setProvider(web3.currentProvider)

export {
  ClubToken
}
