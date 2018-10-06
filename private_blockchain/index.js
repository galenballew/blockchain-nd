const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Block = require('./payload');
const Blockchain = require('./blockchain');
const chain = new Blockchain();

app.listen(8000, () => console.log('Listening on port 8000.'));
app.use(bodyParser.json());
app.get('/', (req, res) => res.status(404).json({
  "status": 404,
  "message": "Available methods: POST /block or GET /block/{BLOCK_HEIGHT}"
}));

/* ================= GET =============================
|           Fetch current blockchain height           |
|  ==================================================*/
app.get('/block/', async (req, res) => {
  chain.getBlockHeight().then(function(height){
    res.send("Current blockchain height: " + height + "\n");
  }).catch(function(error) {
  res.status(404).json({
    "status": 404,
    "message": "Blockchain is invalid."
  });
});
});

/* ================= GET =============================
|  Fetch a block by passing block height in payload  |
|  ==================================================*/
app.get('/block/:height', async (req, res) => {
    chain.getBlock(req.params.height).then(function(block){
      res.send(block + "\n");
    }).catch(function(error) {
    res.status(404).json({
      "status": 404,
      "message": "Block not found."
    });
  });
});

/* ================= POST =============================
|       Add a new block to the blockchain             |
|  ===================================================*/
app.post('/block', async (req, res) => {
  if (req.body.body === '' || req.body.body === undefined) {
    res.status(400).json({
      "status": 400,
      message: "Block body missing."
    });
  }
  chain.addBlock(new Block(req.body.body))
  chain.getBlockHeight().then((height) => {
    res.send("Block added successfully. New blockchain height: " + height + "\n");
  }).catch(function(error) {
    res.status(404).json({
      "status": 400,
      "message": "Block not added."
    });
  });
});
