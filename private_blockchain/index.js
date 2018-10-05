const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Block = require('./payload');
const Blockchain = require('./simple');
const chain = new Blockchain();

app.listen(8000, () => console.log('Listening on port 8000'));
app.use(bodyParser.json());
app.get('/', (req, res) => res.status(404).json({
  "status": 404,
  "message": "Available methods: POST /block or GET /block/{BLOCK_HEIGHT}"
}));

/* ================= GET =============================
|  Fetch a block by passing block height in payload  |
|  ==================================================*/
app.get('/block/:height', async (req, res) => {
  try {
    const response = chain.getBlock(req.params.height);
    res.send(response);
  } catch (error) {
    res.status(404).json({
      "status": 404,
      "message": "Block not found."
    });
  }
});

/* ================= POST =============================
|       Add a new block to the blockchain             |
|  ===================================================*/
app.post('/block', async (req, res) => {
  try {
    if (req.body.body === '' || req.body.body === undefined) {
      throw new Error("Payload missing. Include stringified block in request payload.");
    }
    chain.addBlock(new Block(req.body.body));
    // use .then() to make sure it happens in order
    // otherwise you'll catch an error about height not having resolved yet
    let response = chain.getBlockHeight().then(function(height) {
      chain.getBlock(height);
    });
    res.status(201).send(response);
  } catch (error) {
    res.status(400).json({
      "status": 400,
      "message": error
    });
  }
});
