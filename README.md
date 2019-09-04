
[![Netlify Status](https://api.netlify.com/api/v1/badges/aa024be6-94d0-4cba-bfd3-4f3997191972/deploy-status)](https://app.netlify.com/sites/clovers/deploys) [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v1.4%20adopted-ff69b4.svg)](code-of-conduct.md)

# Clovers Network

## Contributor guidelines
### What do I need to know to help?
If you are looking to help to with a code contribution it's good to know that our front-end uses [vue.js](https://vuejs.org/), a javascript framework similar to react. We use [vuex](https://vuex.vuejs.org/) for state management (similar to react's redux) as well as [BassCSS](https://basscss.com) for styling. On the backend in the [api repository](https://github.com/clovers-network/clovers-api) we use [Express](https://expressjs.com/) and [rethinkdb](http://rethinkdb.com). Our blockchain component utilizes [Ethereum](https://ethereum.org) and is located in the [repository here](https://github.com/clovers-network/clovers-contracts). We use [truffle](http://truffleframework.com) for organizing, testing and deploying our Ethereum smart contracts written in [Solidity](https://solidity.readthedocs.io/en/v0.5.11/) with help from [web3.js](https://github.com/ethereum/web3.js) and [ethers.js](https://github.com/ethers-io/ethers.js/). If you don't feel ready to make a code contribution yet, no problem! You can also check out the documentation issues [here](https://github.com/clovers-network/clovers-dapp/labels/docs) or the design issues that we have [here](https://github.com/clovers-network/clovers-dapp/labels/design).

*If you are looking for __Good First Issues__ check [here](https://github.com/clovers-network/clovers-dapp/labels/Good%20First%20Issue) 👀*

If you are interested in making a code contribution and would like to learn more about the technologies that we use, check out the list of tutorials below.

* [Learn X in Y Minutes - Solidity](https://learnxinyminutes.com/docs/solidity/)
* [The Majesty of Vue2](https://leanpub.com/vuejs2)
* [Flexible & Upgradeable NFTs](https://kauri.io/collection/5d11f9f8a6afcc0001f621de/flexible-upgradeable-and-highly-available-nfts)

### How do I make a contribution?
Never made an open source contribution before? Wondering how contributions work in the in our project? Here's a quick rundown!

1. Find an issue that you are interested in addressing or a feature that you would like to add.
2. Fork the repository associated with the issue to your local GitHub organization. This means that you will have a copy of the repository under your-GitHub-username/repository-name.
3. Clone the repository to your local machine using git clone https://github.com/clovers-network/clovers-dapp.git.
4. Create a new branch for your fix using `git checkout -b branch-name-here`.
5. Make the appropriate changes for the issue you are trying to address or the feature that you want to add.
6. Use `git add insert-paths-of-changed-files-here` to add the file contents of the changed files to the "snapshot" git uses to manage the state of the project, also known as the index.
7. Use `git commit -m "Insert a short message of the changes made here"` to store the contents of the index with a descriptive message.
8. Push the changes to the remote repository using `git push origin branch-name-here`.
9. Submit a pull request to the upstream repository.
10. Title the pull request with a short description of the changes made and the issue or bug number associated with your change. For example, you can title an issue like so "Added more log outputting to resolve #4352".
11. In the description of the pull request, explain the changes that you made, any issues you think exist with the pull request you made, and any questions you have for the maintainer. It's OK if your pull request is not perfect (no pull request is), the reviewer will be able to help you fix any problems and improve it!
12. Wait for the pull request to be reviewed by a maintainer.
13. Make changes to the pull request if the reviewing maintainer recommends them.
14. Celebrate your success after your pull request is merged! 🎉

### Where can I go for help?
If you need help, you can ask questions on our [Telegram](https://t.me/cloversnetwork), our [Discord](https://discord.gg/tQkPbat) or our [Forum](https://forum.clovers.network).

### What does the Code of Conduct mean for me?
Our [Code of Conduct](https://github.com/clovers-network/clovers-dapp/blob/master/CODE_OF_CONDUCT.md) means that you are responsible for treating everyone on the project with respect and courtesy regardless of their identity. If you are the victim of any inappropriate behavior or comments as described in our Code of Conduct, we are here for you and will do the best to ensure that the abuser is reprimanded appropriately, per our code.

---

Maintained by [Bin Studio](https://bin.am)
 * [Alan Woo](https://github.com/alancwoo/)
 * [Billy Rennekamp](https://github.com/okwme/)
 * [Everett Williams](https://github.com/evvvritt)
 * [Nics Kort](https://github.com/n-kort/) 
 
---

[White Paper (Work In Progress)](https://docs.google.com/document/d/1If-yoN-4cbIT0X_PSEfxVYqlZ7kgFRQapx8AR79mhME/edit?usp=sharing)
