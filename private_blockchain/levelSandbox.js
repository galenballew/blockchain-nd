/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
let addLevelDBData = function(key, value) {
  return new Promise(function(resolve, reject) {
    db.put(key, value, function(err) {
      if (err) {
        reject(err)
      }
      resolve("Block number " + key + " added to blockchain.")
    })
  })
};

// Get data from levelDB with key
let getLevelDBData = function(key) {
  return new Promise(function(resolve, reject) {
    db.get(key, function(err, value) {
    if (err) {
      reject(err)
    }
    resolve(JSON.parse(value))
    })
  })
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
    let i = 0;
    db.createReadStream().on('data', function(data) {
          i++;
        }).on('error', function(err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function() {
          console.log('Block #' + i);
          addLevelDBData(i, value);
        });
}

// load blockchain to most recent block
// returns a Promise with most recent blockheight
//resolves i-1 so that block height indexing is correct with genesis block height == 0
function loadBlockchain() {
  return new Promise(function(resolve, reject) {
    let i = 0;
    db.createReadStream().on('data', function(data) {
        i++;
        }).on('close', function() {
          resolve(i);
        }).on('error', function(err) {
          reject(err);
    });
  });
}

// if not Genesis block, then update this.chain
// returns a Promise with the entire blockchain
function updateBlockchain() {
  return new Promise(function(resolve, reject) {
    let i = 0;
    let blockchain = [];
    db.createReadStream().on('data', function(data) {
        getLevelDBData(i).then((block) => {
          blockchain.push(block)
        });
        i++;
        }).on('error', function(err) {
          reject(err);
        }).on('close', function() {
          resolve(blockchain);
      });
  });
}


// import in simpleChain using require('./levelSandbox')
exports.addLevelDBData = addLevelDBData;
exports.getLevelDBData = getLevelDBData;
exports.addDataToLevelDB = addDataToLevelDB;
exports.loadBlockchain = loadBlockchain;
exports.updateBlockchain = updateBlockchain;
