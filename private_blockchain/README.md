# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

This project uses the **Express.js framework** for its RESTful API. Find out more at [http://expressjs.com/](http://expressjs.com/).

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init

npm install crypto-js --save

npm install level --save

npm install express --save

npm install bitcoinjs-message --save
```
## Testing the RESTful API
The source code is configured to run locally on port 8000. Test the available endpoints and methods using `curl` or another HTTP tool.

Before testing the endpoints, be sure to start the service using `$ node index.js`

*GET*
- Endpoint: /block/{BLOCK_HEIGHT}
- Example `curl` command
  - hello `curl http://localhost:8000/block/0`
  - returns the gensis block

- Endpoint: /stars/address:[address]
- Example `curl` command (you will need to supply a authentic hash)
```
curl "http://localhost:8000/stars/address:142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ
```

 *POST*
 - Endpoint: /block
 - Example `curl` command
```
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "star": {
    "dec": "-26° 29'\'' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
  }
}'
```

 - Endpoint: /requestValidation
 - Example `curl` command
```
curl -X "POST" "http://localhost:8000/requestValidation" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
}'
```

 - Endpoint: /message-signature/validate
 - Example `curl` command
```
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
}'
```

 - Endpoint: /message-signature/validate
 - Example `curl` command
```
curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
}'
```

---
## Testing the source code
---
```
node
.load simple.js

let blockchain = new Blockchain();

//add some blocks
for (var i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}

// Validate blockchain
blockchain.validateChain();

//Induce errors by changing block data
let inducedErrorBlocks = [2,4,7];
for (var i = 0; i < inducedErrorBlocks.length; i++) {
  blockchain.chain[inducedErrorBlocks[i]].data='induced chain error';
}

//expect errors on validation
blockchain.validateChain();
```
