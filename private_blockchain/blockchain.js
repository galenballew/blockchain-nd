/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const db = require('level')('./chaindata');
const Block = require('./block');


/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/
class Blockchain{

	constructor() {
		/* Instantiates Blockchain
		* If there is nothing in ./chaindata, it adds a Block to the blockchain
		* input: 
		* return:
		*/ 
		this.getBlockHeight().then((height) => {
			if (height === -1) {
				this.addBlock(new Block("Genesis block")).then(() => console.log("Blockchain initialized with genesis block."));
			}
		});
	}

	async addBlock(newBlock) {
		/* adds a block to the blockchain
		* input: Block [Object] (./payload.js)
		* return: 
		*/
		const height = parseInt(await this.getBlockHeight());
		newBlock.height = height + 1;
		newBlock.time = new Date().getTime().toString().slice(0, -3);

		if (newBlock.height > 0) {
			await this.getBlock(height).then((previousBlock) => {
				previousBlock = JSON.parse(previousBlock);
				newBlock.previousBlockHash = previousBlock.hash;
			});
		}

		newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
		await this.addBlocktoDB(newBlock.height, JSON.stringify(newBlock));
  }

  async validateBlock(blockHeight) {
		/* validates a single block by checking stored hash vs computed hash
		* input: blockHeight [int]
		* return: [Boolean]
		*/
		const block = await this.getBlock(blockHeight);
		const currentHash = block.hash;
		block.hash = "";
		const validHash = SHA256(JSON.stringify(block)).toString();

		if(currentHash === validHash) {
			return true;
		} else {
			console.log("Block #${blockHeight} is invalid.");
			return false;
		}
	}

	async validateChain() {
		/* validates blockchain by validating all blocks
		* input: 
		* return: [Boolean]
		*/
		let previousBlockHash = "";
		const errorLog = [];
		const chainHeight = await this.getBlockHeight();

		for (let i=0; i < chainHeight; i++) {
			let blockValid = await this.getBlock(i).then(async function(block) {
				await this.validateBlock(block.height);
			});
			if (!blockValid) {
				errorLog.push(i);
			}
			// equates for genesis block
			if (block.previousBlockHash !== previousBlockHash) {
				errorLog.push(i);
			}
			previousBlockHash = block.hash;
		}
		if (errorLog.length > 0) {
			console.log("The following blocks are invalid: ${errorLog}");
			return false;
		} else {
			return true;
		}
	}


	async addBlocktoDB(key, value) {
		/* adds block to levelDB for persistence 
		* input: key, value [int, stringified JSON]
		* return: [Promise]
		*/
		return new Promise((resolve, reject) => {
			db.put(key, value, (error) => {
				if (error) {
					reject(error)
				}
				console.log(`Added block #${key}`);
				resolve(key);
			});
		});
	}

	async getBlockHeight() {
			/* retrieves current heigh of blockchain 
		* input: 
		* return: height [int]
		*/
		return new Promise((resolve, reject) => {
			let height = -1;
			db.createReadStream().on('data', (data) => {
				height++;
			}).on('error', (error) => {
				reject(error);
			}).on('close', () => {
				resolve(height);
			});
		});
	}

	async getBlock(key) {
		/* retrieves current heigh of blockchain 
		* input: key [int] (blockHeight)
		* return: block [JSON]
		*/
		return new Promise((resolve, reject) => {
			db.get(key, (error, value) => {
				if (value === undefined) {
					reject('Block not found.');
				} else if (error) {
					reject(error);
				}
				resolve(value);
			});
		});
	}

	async getBlockByHash(hash) {
		return new Promise((resolve, reject) => {
			db.createReadStream().on('data', (data) => {    
				let block = JSON.parse(data.value);
				if ((block.hash === hash) && (block.height != 0)) {
					block.body.star.storyDecoded = new Buffer.from(block.body.star.story, 'hex').toString();
					resolve(block);
				} else if  (block.hash === hash) {
					resolve(block);
			  	}
			}).on('error', (error) => {
				reject(error);
			}).on('close', () => {
				reject('Block hash not found in blockchain.');
			});
		});
	}
	  
	async getBlocksByAddress(address) {
		const blocks = []	
		return new Promise((resolve, reject) => {
			db.createReadStream().on('data', (data) => {
				console.log(data.value)
				let block = JSON.parse(data.value);
				if ((block.body.address === address) && (block.height > 0)) {
					block.body.star.storyDecoded = new Buffer.from(block.body.star.story, 'hex').toString();
					blocks.push(block);
				}
			}).on('error', (error) => {
				reject(error)
			}).on('close', () => {
				resolve(blocks)
			});
		});
	}


}



// export for testing
module.exports = Blockchain;
