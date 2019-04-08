const Remme = require("remme");
const remmeKeys = require("remme-keys");

const privateKeyHex = process.env.MASTER_ACCOUNT_PRIVATE_KEY;
const nodeAddress = process.env.NODE_ADDRESS;

const remme = new Remme.Client({
    accountConfig: { privateKeyHex },
    networkConfig: {
        nodeAddress: nodeAddress + ":8080"
    }
});


exports.storePublicKeyLambdaHandler = async (event) => {

    const keys = await Remme.Keys.construct(remmeKeys.KeyType.RSA);

    const validFrom = Math.round(Date.now() / 1000);
    const validTo = Math.round(Date.now() / 1000 + 1000);

    const storeResponse = await remme.publicKeyStorage.createAndStore({
        data: "store data",
        keys: keys,
        rsaSignaturePadding: remmeKeys.RSASignaturePadding.PSS,
        validFrom: validFrom,
        validTo: validTo,
        doOwnerPay: false,
     });

    const remme_address = remme.account.address;
    const batchIdentifier = storeResponse.data.id;

    console.log(`Public key has been stored to \`${remme_address}\`. Batch identifier is \`${batchIdentifier}\`.`);

    return batchIdentifier;

};
