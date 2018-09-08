/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const  levelDB = require('./levelSandbox');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/
class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}


/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/
class Blockchain{
	constructor(){
		this.chain = [];
		/*operate under the assumption that this code does not know whether the
		the Blockchain class being instantiated is actually a new blockchain or
		just rebooting/loading an already existing blockchain */

		// load from levelDB and check the blockHeight
		levelDB.loadBlockchain().then((height) => {
			if (height == 0) {
				let block = new Block("Genesis");
				//this.chain.push(block);
				this.addBlock(block);
				console.log("Creating new blockchain... adding Genesis block...")
			} else {
				levelDB.updateBlockchain().then((blockchain) => {
					this.chain = this.chain.concat(blockchain);
				});
			}
		});
	}




  // Add new block
	addBlock(newBlock){
		try {
		    newBlock.height = this.chain.length;
		    newBlock.time = new Date().getTime().toString().slice(0,-3);
		    if(newBlock.height > 0){
		      newBlock.previousBlockHash = this.chain[newBlock.height-1].hash;
		    }
		    // Block hash with SHA256 using newBlock and converting to a string
		    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
		    // Adding block object to chain/DB
				this.chain.push(newBlock);
		  	levelDB.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString()).then((response) => {
					console.log(response);
				});
		} catch (err) {
			console.log("Error adding block: " + err);
		}
  }

	// Get block height
	getBlockHeight(){
		try {
			levelDB.loadBlockchain().then((height) => {
				console.log("Block height: " + (height-1));
				return (height-1);
			});
		} catch (err) {
			console.log("Error loading block height: " + err);
		}
	}

	// get block
	getBlock(blockHeight) {
		try {
			levelDB.getLevelDBData(blockHeight).then((block) => {
				console.log(block)
				return block;
			});
		} catch (err) {
			console.log("Error loading block: " + err);
		}
	}

	// validate block
  validateBlock(blockHeight){
		return new Promise((resolve, reject) => {
			levelDB.getLevelDBData(blockHeight).then((block) => {
				try {
					// get block hash
					let hash = block.hash;
					// remove block hash to test block integrity
					block.hash = "";
					// generate block hash
					let valid = SHA256(JSON.stringify(block)).toString();
					// Compare
					if (hash===valid) {
						console.log("Block " + blockHeight + ": valid");
						resolve(true);
					} else {
						console.log("Block " + blockHeight + ": invalid");
						resolve(false);
					}
				} catch (err) {
					reject(err);
				}
			});
		});
	}

	validateChain(){
		let errorLog = [];
   	for (let i = 0; i < this.chain.length; i++) {
			console.log("Validating block " + i)
   		this.validateBlock(i).then((isBlockValid) => {
     		// validate block
     		if (!isBlockValid)errorLog.push(i);
     		// compare blocks hash
				// do not check most recent block in the chain because there is
				// not a block ahead of it with previousBlockHash
				if (i !== (this.chain.length-1)) {
					let blockHash = this.chain[i].hash;
	     		let previousHash = this.chain[i+1].previousBlockHash;
	     		if (blockHash!==previousHash) {
	           errorLog.push(i);
	         }
				}
       })
     }
     if (errorLog.length>0) {
       console.log('Errors: '+errorLog);
     } else {
       console.log('No errors detected');
     }
   }
}

// export for testing
// exports.Blockchain = Blockchain;
// exports.Block = Block;
