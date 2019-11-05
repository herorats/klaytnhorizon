// const name = "iklay";
// const fullName = "iklay";
const name = "iklay";
const fullName = "iklay";
const decimal = 8;
const totalSupply = 90000000000;
const admin = "qedadmin";

const crossChainContract = 'ContractAX7F1jRmqx3aNVJgR2uq1bFxwQ8wryLURzsrgU7jfwG4'

class Token {
    init() {
        // blockchain.callWithAuth("token.iost", "create", [
        //     name,
        //     admin,
        //     totalSupply,
        //     {
        //         fullName,
        //         decimal,
        //         canTransfer: true,
        //     }
        // ]);
    }

    can_update(data) {
        return blockchain.requireAuth(blockchain.contractOwner(), "active");
    }

    _amount(amount) {
        return new BigNumber(new BigNumber(amount).toFixed(decimal));
    }

    _checkToken(token_name) {
        if (token_name !== name) {
            throw "token not exist";
        }
    }

    issue(token_name, to, amount, klay_tx_hash, refunded_klay_address, job) {
        token_name = name
      
        if (!blockchain.requireAuth(admin, "active")) {
            throw "permission denied";
        }
        
        if (storage.get(klay_tx_hash)) {
            throw `double-spending is prevented:${storage.get(klay_tx_hash)}`;
        }
        
        // prevent double-spending
        storage.put(klay_tx_hash, tx.hash) // method 1: most safe method for preventing double-spending, but costs iRAM.
        blockchain.receipt(`0x${klay_tx_hash}:TXID ${amount} ${token_name} sent in KLAYTN blockchain.`) // method 2: It doesn't cost iRAM.
        
        this._checkToken(token_name);
        amount = this._amount(amount);
        blockchain.callWithAuth("token.iost", "issue", [token_name, to, amount]);
        
        // mediator job management
        if (!job) return
        if (to !== 'mediator') return 
        
        blockchain.callWithAuth(
          crossChainContract,
          "registerJob",
          [tx.hash, job, amount, refunded_klay_address, blockchain.contractName(), ""]
        )
    }

    transfer(token_name, from, to, amount, memo) {
        this._checkToken(token_name);
        amount = this._amount(amount);
        blockchain.callWithAuth("token.iost", "transfer", [token_name, from, to, amount, memo])
    }

    transferFreeze(token_name, from, to, amount, timestamp, memo) {
        this._checkToken(token_name);
        amount = this._amount(amount);
        blockchain.callWithAuth("token.iost", "transferFreeze", [token_name, from, to, amount, timestamp, memo]);
    }

    destroy(token_name, from, amount) {
        token_name = name
      
        if (!blockchain.requireAuth(admin, "active")) {
            throw "permission denied";
        }
        this._checkToken(token_name);
        amount = this._amount(amount);
        blockchain.callWithAuth("token.iost", "destroy", [token_name, from, amount]);
    }

    // call abi and parse result as JSON string
    _call(contract, api, args) {
        const ret = blockchain.callWithAuth(contract, api, args);
        if (ret && Array.isArray(ret) && ret.length >= 1) {
            return ret[0];
        }
        return null;
    }

    balanceOf(token_name, owner) {
        this._checkToken(token_name);
        return this._call("token.iost", "balanceOf", [token_name, owner]);
    }

    supply(token_name) {
        this._checkToken(token_name);
        return this._call("token.iost", "supply", [token_name]);
    }

    totalSupply(token_name) {
        this._checkToken(token_name);
        return this._call("token.iost", "totalSupply", [token_name]);
    }
    
    // KLAY-related
    swapToKLAY(klay_address, amount, memo) {
      // Transfer iklay from user to iklaycontract
      this.transfer(name, tx.publisher, blockchain.contractName(), amount, memo)
      
      blockchain.callWithAuth(
        crossChainContract,
        "toKlaytnBlockchain",
        [name, klay_address, amount, memo, ""]
      )
    }
}

module.exports = Token;
