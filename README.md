# Remme core activity simulation

Simulate activity in a test network of the Remme blockchain (core) to show how it works.

## Production

For production [AWS Lambda](https://aws.amazon.com/lambda/features) is used. ``AWS Lambda`` is a serverless compute 
service that runs your code in response to events and automatically manages the underlying compute resources.

It runs:

1. On ``CloudWatch`` events, so lambda is executed once per specified time, e.g. 5 minutes.
2. Also ``Amazon CloudWatch Logs`` feature is enable to collect the lambdas logs.
3. Runtime is ``Node.js 8.10``.

### Lambdas

To build an environment for lambdas and bundle each to own ``zip-archive``, build the container first:

```bash
$ docker build -t lambdas . -f ops/Dockerfile.buildLambdasToProduction
```

Afterwards, run the container, export ``zip-archives`` from container to host and stop the container with the following 
commands:

```bash
$ docker run -d --name lambdas lambdas
$ docker cp lambdas:/lambdas/transferTokensLambda/transferTokensLambda.zip .
$ docker stop lambdas
```

Now you can upload it to the ``AWS Lambda`` service and test with the following command:

```bash
$ aws lambda update-function-code --function-name activitySimulationTrasferTokens --zip-file fileb:/$pwd/transferTokensLambda.zip
```

### Environment variables

The production requires the following environment variables on the ``AWS Lambda`` environment:

1. ``NODE_ADDRESS`` — the address of the node to work with (e.g. ``node-genesis-testnet.remme.io`` or ``139.59.148.55``).
2. ``MASTER_ACCOUNT_PRIVATE_KEY`` — private key from the account on the blockchain that is accessible by the node address 
that could be a faucet for the transactions execution (have tokens on the account).

## Development

Clean containers and images with the following commands:

```bash
$ docker rm $(docker ps -a -q) -f
$ docker rmi $(docker images -q) -f
```

### Transfer tokens lambda

To build an environment for lambda that transfer tokens, build the container first:

```bash
$ docker build  \
      --build-arg MASTER_ACCOUNT_PRIVATE_KEY=ad2dc65ca66706aa4b5a2b63a10472c91e113b7f82614260f3bb3a2cd28a0cdc \
      --build-arg NODE_ADDRESS=139.59.148.55 \
      -f Dockerfile.transferTokensLambda \
      -t transfer-tokens-lambda .
```

Then you could execute the lambda like it should be executed in the production with the following command. This command
execute lambda in the container, that container is destroyed, so you can do it again immediately. 

```bash
$ docker run \
      -v $PWD/src/callers/transferTokensLambdaHandlerCaller.js:/lambdas/transferTokensLambda/transferTokensLambdaHandlerCaller.js \
      -v $PWD/src/lambdas/transferTokensLambdaHandler.js:/lambdas/transferTokensLambda/transferTokensLambdaHandler.js \
      --name transfer-tokens-lambda --rm transfer-tokens-lambda
```

