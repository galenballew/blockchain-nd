const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Block = require('./block');
const Blockchain = require('./blockchain');
const chain = new Blockchain();
const StarValidation = require('./starValidation')

app.listen(8000, () => console.log('Listening on port 8000.'));
app.use(bodyParser.json());
app.get('/', (req, res) => res.status(404).json({
  "status": 404,
  "message": "See here for endpoints: https://github.com/galenballew/blockchain-nd/tree/master/private_blockchain"
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
// app.post('/block', async (req, res) => {
//   if (req.body.body === '' || req.body.body === undefined) {
//     res.status(400).json({
//       "status": 400,
//       message: "Block body missing."
//     });
//   }
//   chain.addBlock(new Block(req.body.body))
//   chain.getBlockHeight().then((height) => {
//     res.send("Block added successfully. New blockchain height: " + height + "\n");
//   }).catch(function(error) {
//     res.status(404).json({
//       "status": 400,
//       "message": "Block not added."
//     });
//   });
// });

validateAddress = async (req, res, next) => {
  try {
    const starValidation = new StarValidation(req);
    starValidation.addressIncluded();
    next();
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message
    })
  }
}

validateSignature = async (req, res, next) => {
  try {
    const starValidation = new StarValidation(req);
    starValidation.signatureIncluded();
    next();
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message
    })
  }
}

validatePayload = async (req, res, next) => {
  try {
    const starValidation = new StarValidation(req);
    starValidation.starIncluded();
    next();
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message
    })
  }
}

app.post('/requestValidation', [validateAddress], async (req, res) => {
  const starValidation = new StarValidation(req);
  const address = req.body.address;

  await starValidation.getPendingRequest(address).then((data) => {
    res.json(data);
  }).catch((error) => {
    const data = starValidation.writeNewRequest(address)
    res.json(data);
  });
});


app.post('/message-signature/validate', [validateAddress, validateSignature], async (req, res) => {
  const starValidation = new StarValidation(req);
  const {address, signature} = req.body;

  await starValidation.validateMessageSignature(address, signature).then((response) => {
    if (response.registerStar) {
      res.json(response);
    } else {
      res.status(401).json(response);
    }
  }).catch((error) => {
    res.status(404).json({
      status: 404,
      message: error.message
    });
  });
});

app.post('/block', [validatePayload], async (req, res) => {
  const starValidation = new StarValidation(req);
  const body = { address, star } = req.body;
  const story = star.story;

  body.star = {
    story: new Buffer.from(story).toString('hex'),
    dec: star.dec,
    ra: star.ra,
    mag: star.mag,
    con: star.con
  }

  try {
  chain.addBlock(new Block(body));
  const height = await chain.getBlockHeight();
  const block = await chain.getBlock(height);
  res.send(block);
  } catch (error) {
    res.status(404).json({
    "status": 400,
    "message": "Block not added."
    });
  }
});

app.get('/stars/address:address', async (req, res) => {
  const address = req.params.address.slice(1);
  
  await chain.getBlocksByAddress(address).then((blocks) => {
    res.send(blocks);
  }).catch((error) => {
    res.status(404).json({
      status: 404,
      message: "No blocks returned for given address."
    });
  });
});

app.get('/stars/hash:hash', async (req, res) => {
  const hash = req.params.hash.slice(1);

  await chain.getBlockByHash(hash).then((block) => {
    res.send(block);
  }).catch((error) => {
    res.status(404).json({
      status: 404,
      message: "No block returned for given hash."
    });
  });
});
