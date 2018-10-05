# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install express with --save flag
```
npm install express --save
```
## Testing the RESTful API
The source code is configured to run locally on port 8000. Test the available endpoints and methods using `curl` or another HTTP tool.

Before testing the endpoints, be sure to start the service using `$ node index.js`

*GET*
- Endpoint: /block/{BLOCK_HEIGHT}
- Example `curl` command
  - hello `curl http://localhost:8000/block/0`
  - returns the gensis block

 *POST*
 - Endpoint: /block
 - Example payload: `$'{"body":"THIS IS THE BODY FIELD OF THE BLOCK"}'`
 - Example `curl` command
  - `curl -X "POST" "http://localhost:8000/block" -H 'Content-Type: application/json' -d $'{"body":"UDACITY FTW"}`

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
