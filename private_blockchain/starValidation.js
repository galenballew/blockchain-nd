const db = require('level')('./stardata');
const bitcoinMessage = require('bitcoinjs-message');


class StarValidation {
    constructor(req) {
        /* Instantiates Validator
		* input: req [JSON]
		* return:
		*/ 
        this.req = req;
    }

    addressIncluded() {
        /* Checks that the request contains an address key/value
		* input: 
		* return: [Boolean]
		*/ 
        if (!this.req.body.address) {
            throw new Error('Address not provided in request body.');
          }
        return true;
    }

    signatureIncluded() {
        /* Checks that the request contains a signature key/value
		* input: 
		* return: [Boolean]
		*/ 
        if (!this.req.body.signature) {
            throw new Error('Signature not provided in request body.');
          }
        return true;
    }

    starIncluded() {
        /* Checks that the request contains a star key/value
		* input: 
		* return: [Boolean]
		*/ 
        if (!this.req.body.star) {
            throw new Error('Star data not provided in request body.');
          }
        return true;
    }

    isExpired(value) {
        /* Checks that the request is within the past 5 minutes
		* input: value [JSON]
		* return: [Boolean]
		*/ 
        return  value.requestTimeStamp < Date.now() - (5 * 60 * 1000)
    }

    isOwner(message, address, signature) {
        /* Checks that the public key matches across the signature, message, and address
        * https://github.com/bitcoinjs/bitcoinjs-message/blob/master/index.js
        * input: message, address, signature
		* return: [Boolean]
        */ 
        try {
            return bitcoinMessage.verify(message, address, signature);
        } catch (error) {
            return false;
        }
    }

    invalidate(address) {
        db.del(address);
    }

    validateStar(star) {
        /* Checks that star properties are non-empty strings
        * checks story length is under 500 bytes
        * checks that story is properly hex encoded
		* input: star [JSON]
		* return: [Boolean]
		*/ 
        const {dec, ra, story} = star;
        const STORY_SIZE = 500;

        if (typeof dec !== 'string' || typeof ra !== 'string' || typeof story !== 'string' || !dec.length || !ra.length || !story.length) {
            throw new Error("Star parameters are not non-empty strings.");
        }
        if (new Buffer(story).length > MAX_STORY_BYTES) {
            throw new Error('Maximum story size is 500 bytes.');
        }
        if (!(/^[\x00-\x7F]*$/.test(story))) {
            throw new Error('Story contains non-ASCII symbols.');
        }
        return;
    }

    validateRequest() {
        /* Runs validation methods
		* input: 
		* return: 
		*/ 
        this.addressIncluded();
        this.signatureIncluded();
        this.starIncluded();
        const {star} = this.req.body.star;
        validateStar(star);
    }

    async validateMessageSignature(address, signature) {
        /* verifies time window and message signature
		* input: address, signature
		* return: request status [JSON]
		*/ 
        return new Promise((resolve, reject) => {
            db.get(address, (error, value) => {
                if (value === undefined) {
                    reject(new Error("Address not found."));
                } else if (error) {
                    reject(error);
                }

                value = JSON.parse(value);
                const expired = this.isExpired(value);
                const valid = this.isOwner(value.message, address, signature);

                if (expired) {
                    value.validationWindow = 0;
                    value.messageSignature = "Validation window older than 5 minutes.";
                } else {
                    value.validationWindow = Math.floor((value.requestTimeStamp - (Date.now() - (5 * 60))));
                    value.messageSignature = valid ? "valid" : "invalid";
                }

                db.put(address, JSON.stringify(value));
                resolve({
                    registerStar: !expired && valid,
                    status: value
                });
            });
        });
    }

    writeNewRequest(address) {
        /* submits new request
		* input: address
		* return: request data [JSON]
		*/ 
        const timestamp = Date.now();
        const message = `${address}:${timestamp}:starRegistry`;
        const validationWindow = 300;
        const data = {
            address: address,
            message: message,
            requestTimeStamp: timestamp,
            validationWindow: validationWindow
        };

        db.put(data.address, JSON.stringify(data));
        return data;
    }

    async getPendingRequest(address) {
        /* fetches request
		* input: address
		* return: request data [JSON]
		*/ 
        return new Promise((resolve, reject) => {
            db.get(address, (error, value) => {
                if (value === undefined) {
                    reject(new Error("Address not found."));
                } else if (error) {
                    reject(error);
                }
            });

            value = JSON.parse(value)
            const expired = this.isExpired(value);

            if (expired) {
                resolve(this.writeNewRequest(address));
            } else {
                const data = {
                    address: address,
                    message: value.message,
                    requestTimeStamp: value.requestTimeStamp,
                    validationWindow: Math.floor((value.requestTimeStamp - (Date.now() - (5 * 60))))
                };
                resolve(data);
            }
        });
    }

}

module.exports = StarValidation;