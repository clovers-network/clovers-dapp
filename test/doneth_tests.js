var Doneth = artifacts.require("Doneth");

contract('Doneth', function(accounts) {
    let doneth;
    beforeEach(async function() { 
        doneth = await Doneth.new("test_name", "Ray Kroc");
    });
    
    describe("contract initial state tests", function() {
        it("should have the name 'test_name'", async function() {
            const name = await doneth.name();
            assert.equal(name, "test_name");
        });

        it("should have owner member at the beginning", async function() {
            const count = await doneth.getMemberCount();
            assert.equal(count, 1);

            const retrieveMember = await doneth.getMemberAtKey(0);
            assert.equal(retrieveMember, web3.eth.coinbase); 

            const owner = await doneth.owner();
            assert.equal(owner, web3.eth.coinbase); 
        });

        it("should have 0 initial balance", async function() {
            const initialBalance = await doneth.getBalance();
            assert.equal(initialBalance, 0);
        });

        it("should have proper member fields for owner", async function() {
            const ownerMember = await doneth.returnMember(web3.eth.coinbase);
            assert.equal(ownerMember[0], true); // active
            assert.equal(ownerMember[1], true); // admin
            assert.equal(ownerMember[2], 1); // shares
            assert.equal(ownerMember[3], 0); // withdrawn
            assert.equal(ownerMember[4], 'Ray Kroc'); // memberName
        });
    });

    describe("modify contract state cases", function() {
        it("should add member Maurice with 100 shares", async function() {
            await doneth.addMember(accounts[1], 100, false, "Maurice McDonald");
            const newMember = await doneth.returnMember(accounts[1]);
            assert.equal(newMember[0], true); // active
            assert.equal(newMember[1], false); // admin
            assert.equal(newMember[2], 100); // shares
            assert.equal(newMember[3], 0); // withdrawn
            assert.equal(newMember[4], 'Maurice McDonald'); // memberName
        });

        it("should remove 50 shares from Maurice", async function() {
            await doneth.addMember(accounts[1], 100, false, "Maurice McDonald");
            await doneth.removeShare(accounts[1], 50);
            const newMember = await doneth.returnMember(accounts[1]);
            assert.equal(newMember[0], true); // active
            assert.equal(newMember[1], false); // admin
            assert.equal(newMember[2], 50); // shares
            assert.equal(newMember[3], 0); // withdrawn
            assert.equal(newMember[4], 'Maurice McDonald'); // memberName
        });
    });

    describe("test send Eth and withdraw flow", function() {
        it("should send 100 Eth, add shares so that two accounts have 25 shares and 75 shares respectively, and withdraw 25 should retrieve 25 Eth for second account", async function() {
            await doneth.addShare(web3.eth.coinbase, 24);
            await doneth.addMember(accounts[1], 75, false, "Maurice McDonald");

            // Send 100 Eth to contract
            web3.eth.sendTransaction({from: web3.eth.coinbase, to: doneth.address, value: 100});
            assert.equal(web3.eth.getBalance(doneth.address), 100);

            const oldTotal = await doneth.calculateTotalWithdrawableAmount(accounts[1]);
            assert.equal(oldTotal, 75);

            // Withdraw 25 Eth from contract
            await doneth.withdraw(25, {from: accounts[1]});
            assert.equal(web3.eth.getBalance(doneth.address), 75);

            const newMember = await doneth.returnMember(accounts[1]);
            assert.equal(newMember[0], true); // active
            assert.equal(newMember[1], false); // admin
            assert.equal(newMember[2], 75); // shares
            assert.equal(newMember[3], 25); // withdrawn
            assert.equal(newMember[4], 'Maurice McDonald'); // memberName

           // Check that totalWithdrawn is correct
           const newTotal = await doneth.calculateTotalWithdrawableAmount(accounts[1]);
           assert.equal(75, newTotal);
           const totalWithdrawn = await doneth.totalWithdrawn();
           assert.equal(25, totalWithdrawn);
        });
    });

    describe("test with complex example", function() {
        it("should succeed depositing, withdrawing, and adding shares", async function() {
            // Send 100 Eth to contract
            web3.eth.sendTransaction({from: web3.eth.coinbase, to: doneth.address, value: 100});
            assert.equal(web3.eth.getBalance(doneth.address), 100);

            // account0 has 25 shares, account1 has 75 shares
            await doneth.addShare(web3.eth.coinbase, 24);
            await doneth.addMember(accounts[1], 75, false, "Maurice McDonald");

            // account0 withdraw 20 Eth
            await doneth.withdraw(20, {from: accounts[0]});
            assert.equal(web3.eth.getBalance(doneth.address), 80);

            // totalWithdrawn should be 20
            const totalWithdrawn = await doneth.totalWithdrawn();
            assert.equal(20, totalWithdrawn);
            var newMember = await doneth.returnMember(accounts[0]);
            assert.equal(newMember[3], 20); // withdrawn

            // increase balance by 100
            web3.eth.sendTransaction({from: web3.eth.coinbase, to: doneth.address, value: 100});
            assert.equal(web3.eth.getBalance(doneth.address), 180);

            // account0 withdraw 30 Eth
            await doneth.withdraw(30, {from: accounts[0]});
            assert.equal(web3.eth.getBalance(doneth.address), 150);
            newMember = await doneth.returnMember(accounts[0]);
            assert.equal(newMember[3], 50); // withdrawn

            // add 50 shares to account0, should now be able to withdraw another 49
            await doneth.addShare(web3.eth.coinbase, 50);

            var total = await doneth.totalShares();
            newMember = await doneth.returnMember(accounts[0]);
            const newTotal = await doneth.calculateTotalWithdrawableAmount(accounts[1]);

            // can only withdraw 49 due to rounding
            await doneth.withdraw(49, {from: accounts[0]});
            assert.equal(web3.eth.getBalance(doneth.address), 101);
            newMember = await doneth.returnMember(accounts[0]);
            assert.equal(newMember[3], 99); // withdrawn
            
            // add another account with 100 shares, account has 100/250 shares
            // so they are entitled to 0.4*200 = 80 Eth
            await doneth.addMember(accounts[2], 100, false, "Richard McDonald");
            await doneth.withdraw(80, {from: accounts[2]});
            assert.equal(web3.eth.getBalance(doneth.address), 21);
            const member2 = await doneth.returnMember(accounts[2]);
            assert.equal(member2[3], 80); // withdrawn
        });
    });

    describe("percent function test", function() {
        it("should give back 25% with 25 and 100", async function() {
            var num = await doneth.delegatePercent(25, 100, 5);
            assert.equal(num, 25000);
        });
    });

    describe("duplicate add member test", function() {
        it("should throw an error if you add a duplicate member", async function() {
            try {
                await doneth.addMember(accounts[0], 100, false, "Richard McDonald");
            } catch (error) {
                const invalidOpcode = error.message.search('invalid opcode') >= 0;
                assert(invalidOpcode, "Expected throw, got '" + error + "' instead");
                return;
            }
            assert.fail('Expected throw not received');
        });
    });

    describe("admin member tests", function() {
        it("should throw an error if you are not an admin and call admin function", async function() {
            await doneth.addMember(accounts[1], 100, false, "Maurice McDonald", {from: accounts[0]});
            try {
                await doneth.addMember(accounts[2], 100, false, "Richard McDonald", {from: accounts[1]});
            } catch (error) {
                const invalidOpcode = error.message.search('invalid opcode') >= 0;
                assert(invalidOpcode, "Expected throw, got '" + error + "' instead");
                return;
            }
            assert.fail('Expected throw not received');
        });

        it("should allow you to perform onlyAdmin() function if non-owner member has admin=true", async function() {
            await doneth.addMember(accounts[1], 100, true, "Maurice McDonald", {from: accounts[0]});
            await doneth.addMember(accounts[2], 100, true, "John McDonald", {from: accounts[1]});
            const newMember = await doneth.returnMember(accounts[2]);
            assert.isNotNull(newMember);
        });

        it("only owner should be able to call changeAdminPrivilege()", async function() {
            await doneth.addMember(accounts[1], 100, true, "Maurice McDonald", {from: accounts[0]});
            await doneth.addMember(accounts[2], 100, true, "John McDonald", {from: accounts[1]});

            var newMember = await doneth.returnMember(accounts[2]);
            assert.isTrue(newMember[1]);

            try {
                // Non-owner can't changeAdminPrivilege()
                await doneth.changeAdminPrivilege(accounts[2], false, {from: accounts[1]});
            } catch (error) {
                const invalidOpcode = error.message.search('invalid opcode') >= 0;
                assert(invalidOpcode, "Expected throw, got '" + error + "' instead");
            }

            // Owner should be able to change admin privilege
            await doneth.changeAdminPrivilege(accounts[2], false, {from: accounts[0]});
            newMember = await doneth.returnMember(accounts[2]);
            assert.isFalse(newMember[1]);
        });

        it("only owner should be able to call changeContractName()", async function() {
            var name = await doneth.name();
            assert.strictEqual(name, "test_name");

            await doneth.addMember(accounts[1], 100, true, "Maurice McDonald", {from: accounts[0]});
            try {
                // Non-owner can't changeAdminPrivilege()
                await doneth.changeContractName("test_new_name", {from: accounts[1]});
            } catch (error) {
                const invalidOpcode = error.message.search('invalid opcode') >= 0;
                assert(invalidOpcode, "Expected throw, got '" + error + "' instead");
            }

            // Owner should be able to change contract name
            await doneth.changeContractName("test_new_name", {from: accounts[0]});
            var name = await doneth.name();
            assert.strictEqual(name, "test_new_name");
        });
    });

    describe("shared expense balance tests", function() {
        it("should have sharedExpense set to 0 at contract initialization", async function() {
            const sharedExpense = await doneth.sharedExpense();
            assert.strictEqual(sharedExpense.toNumber(), 0);
        });

        it("should error if try to set shared expense greater than contract balance", async function() {
            try {
                await doneth.changeSharedExpenseAllocation(100, {from: accounts[0]});
            } catch (error) {
                const invalidOpcode = error.message.search('invalid opcode') >= 0;
                assert(invalidOpcode, "Expected throw, got '" + error + "' instead");
                return;
            }
            assert.fail('Expected throw not received');
        });

        it("should only allow owner to perform changeSharedExpenseAllocation()", async function() {
            web3.eth.sendTransaction({from: web3.eth.coinbase, to: doneth.address, value: 5000});
            await doneth.addMember(accounts[1], 100, true, "Maurice McDonald", {from: accounts[0]});
            try {
                // Non-owner cannot call changeSharedExpenseAllocation()
                await doneth.changeSharedExpenseAllocation(100, {from: accounts[1]});
            } catch (error) {
                const invalidOpcode = error.message.search('invalid opcode') >= 0;
                assert(invalidOpcode, "Expected throw, got '" + error + "' instead");
            }

            // Owner should be able to perform changeSharedExpenseAllocation()
            await doneth.changeSharedExpenseAllocation(100, {from: accounts[0]});
            const sharedExpense = await doneth.sharedExpense();
            assert.strictEqual(sharedExpense.toNumber(), 100);
        });

        it("should allow only admin to withdraw from shared expense balance", async function() {
            // value in Wei units
            web3.eth.sendTransaction({from: web3.eth.coinbase, to: doneth.address, value: 1*10**18});
            await doneth.addMember(accounts[1], 1, false, "Maurice McDonald", {from: accounts[0]});
            await doneth.addMember(accounts[2], 1, true, "John McDonald", {from: accounts[0]});
            // 1/10 of 1 Eth
            await doneth.changeSharedExpenseAllocation(1*10**17, {from: accounts[0]});

            try {
                // Non-admin cannot withdraw from sharedExpense
                await doneth.withdrawSharedExpense(1*10**17, accounts[2], {from: accounts[1]});
            } catch (error) {
                const invalidOpcode = error.message.search('invalid opcode') >= 0;
                assert(invalidOpcode, "Expected throw, got '" + error + "' instead");
            }

            const oldBalance = web3.fromWei(web3.eth.getBalance(accounts[2]));
            await doneth.withdrawSharedExpense(1*10**17, accounts[2], {from: accounts[2]}); 

            const newBalance = web3.fromWei(web3.eth.getBalance(accounts[2]));
            const diff = newBalance - oldBalance;
            const sharedExpenseWithdrawn = await doneth.sharedExpenseWithdrawn();
            const contractInfo = await doneth.getContractInfo();

            // range for balance difference to account for gas cost
            assert.isTrue(diff > 0.09 && diff < 0.1);
            assert.strictEqual(web3.eth.getBalance(doneth.address).toNumber(), 9*10**17);
            assert.strictEqual(sharedExpenseWithdrawn.toNumber(), 1*10**17);
            assert.strictEqual(contractInfo[4].toNumber(), 0); // totalWithdrawn
        });

        it("should only allow withdrawing amount <= remaining sharedExpense", async function() {
            // value in Wei units
            web3.eth.sendTransaction({from: web3.eth.coinbase, to: doneth.address, value: 1*10**18});
            // 1/10 of 1 Eth
            await doneth.changeSharedExpenseAllocation(1*10**17, {from: accounts[0]});

            try {
                // cannot overdraw sharedExpense
                await doneth.withdrawSharedExpense(2*10**17, accounts[2], {from: accounts[2]}); 
            } catch (error) {
                const invalidOpcode = error.message.search('invalid opcode') >= 0;
                assert(invalidOpcode, "Expected throw, got '" + error + "' instead");
                return;
            }
            assert.fail('Expected throw not received');
        });

        it("should calculateTotalWithdrawableAmount correctly with sharedExpense > 0", async function() {
            // value in Wei units
            web3.eth.sendTransaction({from: web3.eth.coinbase, to: doneth.address, value: 1*10**18});
            // 1/10 of 1 Eth
            await doneth.changeSharedExpenseAllocation(1*10**17, {from: accounts[0]});
            await doneth.addMember(accounts[1], 1, false, "Maurice McDonald", {from: accounts[0]});

            const totalWithdrawableAmount = await doneth.calculateTotalWithdrawableAmount(accounts[0]); 
            // should be half of 9/10 of 1 Eth
            assert.strictEqual(4.5*10**17, totalWithdrawableAmount.toNumber());
        });

        it("should calculate normal withdrawals correctly interleaved with sharedExpense", async function() {
            // value in Wei units
            web3.eth.sendTransaction({from: web3.eth.coinbase, to: doneth.address, value: 1*10**18});
            // 1/10 of 1 Eth
            await doneth.changeSharedExpenseAllocation(1*10**17, {from: accounts[0]});
            await doneth.addMember(accounts[1], 1, true, "Maurice McDonald", {from: accounts[0]});

            // accounts[0] withdraws 0.45 Eth from shares
            await doneth.withdraw(4.5*10**17, {from: accounts[0]});
            var memberStruct = await doneth.returnMember(accounts[0]);
            var contractStruct = await doneth.getContractInfo();
            assert.strictEqual(web3.eth.getBalance(doneth.address).toNumber(), 5.5*10**17);
            assert.strictEqual(memberStruct[3].toNumber(), 4.5*10**17); // member.withdrawn
            assert.strictEqual(contractStruct[4].toNumber(), 4.5*10**17); // contract.totalWithdrawn

            // accounts[1] withdraws 0.1 Eth from sharedExpense
            await doneth.withdrawSharedExpense(1*10**17, accounts[1], {from: accounts[1]}); 
            var memberStruct = await doneth.returnMember(accounts[1]);
            var contractStruct = await doneth.getContractInfo();
            var sharedExpense = await doneth.sharedExpense();
            var sharedExpenseWithdrawn = await doneth.sharedExpenseWithdrawn();
            assert.strictEqual(web3.eth.getBalance(doneth.address).toNumber(), 4.5*10**17);
            assert.strictEqual(memberStruct[3].toNumber(), 0); // member.withdrawn
            assert.strictEqual(contractStruct[4].toNumber(), 4.5*10**17); // contract.totalWithdrawn
            assert.strictEqual(sharedExpense.toNumber(), 1*10**17);
            assert.strictEqual(sharedExpenseWithdrawn.toNumber(), 1*10**17);

            // Total withdrawable amount should be 0.45 Eth
            const totalWithdrawableAmount = await doneth.calculateTotalWithdrawableAmount(accounts[1]); 
            assert.strictEqual(4.5*10**17, totalWithdrawableAmount.toNumber());

            // accounts[1] withdraws 0.45 Eth from shares
            await doneth.withdraw(4.5*10**17, {from: accounts[1]});
            var memberStruct = await doneth.returnMember(accounts[1]);
            var contractStruct = await doneth.getContractInfo();
            var sharedExpense = await doneth.sharedExpense();
            var sharedExpenseWithdrawn = await doneth.sharedExpenseWithdrawn();
            assert.strictEqual(web3.eth.getBalance(doneth.address).toNumber(), 0);
            assert.strictEqual(memberStruct[3].toNumber(), 4.5*10**17); // member.withdrawn
            assert.strictEqual(contractStruct[4].toNumber(), 9*10**17); // contract.totalWithdrawn
            assert.strictEqual(sharedExpense.toNumber(), 1*10**17);
            assert.strictEqual(sharedExpenseWithdrawn.toNumber(), 1*10**17);
        });
    });
});