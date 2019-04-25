const Remme = require("remme");

const privateKeyHex = process.env.MASTER_ACCOUNT_PRIVATE_KEY;
const nodeAddress = process.env.NODE_ADDRESS;
const amountOfTokensToSend = process.env.AMOUNT_OF_TOKENS_TO_SEND;

const remme_from = new Remme.Client({
    accountConfig: { privateKeyHex },
    networkConfig: {
        nodeAddress: nodeAddress + ":8080"
    }
});

const remme_from_address = remme_from.token._remmeAccount._address;


exports.transferTokensLambdaHandler = async (event) => {

    const remme_to = new Remme.Client({
        networkConfig: {
            nodeAddress: nodeAddress + ":8080"
        }
    });

    const remme_to_address = remme_to.token._remmeAccount._address;

    const transactionResult = await remme_from.token.transfer(remme_to.token._remmeAccount._address, amountOfTokensToSend);
    const batchIdentifier = transactionResult.data.id;

    console.log(
        `Tokens transfer from \`${remme_from_address}\` to \`${remme_to_address}\`. Batch identifier is \`${batchIdentifier}\`.`
    );

    return transactionResult.data.id
};
