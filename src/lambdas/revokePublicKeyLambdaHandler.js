const Remme = require("remme");

const privateKeyHex = process.env.MASTER_ACCOUNT_PRIVATE_KEY;
const nodeAddress = process.env.NODE_ADDRESS;

const remme = new Remme.Client({
    accountConfig: { privateKeyHex },
    networkConfig: {
        nodeAddress: nodeAddress + ":8080"
    }
});


exports.revokePublicKeyLambdaHandler = async (event) => {

    const publicKeyAddresses = await remme.publicKeyStorage.getAccountPublicKeys(remme.account.address);

    const publicKeyAddress = publicKeyAddresses[publicKeyAddresses.length - 1];

    const info = await remme.publicKeyStorage.getInfo(publicKeyAddress);

    if (info.isRevoked === false) {
        const revokeResponse = await remme.publicKeyStorage.revoke(publicKeyAddress);

        const remme_address = remme.account.address;
        const batchIdentifier = revokeResponse.data.id;

        console.log(`Public key that belongs to address \`${remme_address}\` has been revoked. Batch identifier is \`${batchIdentifier}\`.`);

        return batchIdentifier;
    }
    else {
        console.log(`Public key address \`${publicKeyAddress}\` has been already revoked.`);
    }

};
