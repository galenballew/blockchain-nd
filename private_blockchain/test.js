//const simple = require('./simple');


/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/

/* Promises are asynchronous so unit tests don't really work
run in node to have things behave in realtime as expected */
// from bash:
node -i -e "repl.repl.ignoreUndefined=true"
> .load simple.js
> var blockchain = new Blockchain();
> blockchain.addBlock(new Block("testing testing 123"));
> blockchain.validateBlock(1);
etc etc
