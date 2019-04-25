node('master') {

    stage ('Clone source code. Checkout') {
        sh "rm -rf * || true && rm -rf  .* || true"

        if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'master') {
            sh "git clone -b ${env.BRANCH_NAME} https://github.com/Remmeauth/remme-core-activity-simulation ."
        } else {
            sh "git clone -b ${env.CHANGE_BRANCH} https://github.com/Remmeauth/remme-core-activity-simulation ."
        }
    }

    stage ('Prepare environment') {
        sh "rm -rf $pwd/transferTokensLambda.zip"
        sh "rm -rf $pwd/storePublicKeyLambda.zip"
        sh "rm -rf $pwd/revokePublicKeyLambda.zip"
        sh "docker rm lambdas-${env.BRANCH_NAME.toLowerCase()} -f || true"
        sh "docker rmi lambdas-${env.BRANCH_NAME.toLowerCase()} -f || true"
    }

    stage ('Build lambdas') {
        sh "docker build -t lambdas-${env.BRANCH_NAME.toLowerCase()} . -f ops/Dockerfile.buildLambdasToProduction"
    }

    stage ('Export lambdas') {
        sh "docker rm lambdas-${env.BRANCH_NAME.toLowerCase()} -f || true && docker run -d --name lambdas-${env.BRANCH_NAME.toLowerCase()} lambdas-${env.BRANCH_NAME.toLowerCase()}"
        sh "docker cp lambdas-${env.BRANCH_NAME.toLowerCase()}:/lambdas/transferTokensLambda/transferTokensLambda.zip ."
        sh "docker cp lambdas-${env.BRANCH_NAME.toLowerCase()}:/lambdas/storePublicKeyLambda/storePublicKeyLambda.zip ."
        sh "docker cp lambdas-${env.BRANCH_NAME.toLowerCase()}:/lambdas/revokePublicKeyLambda/revokePublicKeyLambda.zip ."
        sh "docker stop lambdas-${env.BRANCH_NAME.toLowerCase()}"
    }

    if (env.BRANCH_NAME == 'master') {
        stage('Deploy lambda to production') {
            sh "aws lambda update-function-code \
                    --function-name 'prod-activitySimulationTransferTokens' \
                    --zip-file fileb://transferTokensLambda.zip"

            sh "aws lambda update-function-code \
                    --function-name 'prod-activitySimulationStorePublicKey' \
                    --zip-file fileb://storePublicKeyLambda.zip"

            sh "aws lambda update-function-code \
                    --function-name 'prod-activitySimulationRevokePublicKey' \
                    --zip-file fileb://revokePublicKeyLambda.zip"
        }
    }

    if (env.BRANCH_NAME == 'develop') {
        stage('Deploy lambda to staging') {
            sh "aws lambda update-function-code \
                    --function-name 'staging-activitySimulationTransferTokens' \
                    --zip-file fileb://transferTokensLambda.zip"

            sh "aws lambda update-function-code \
                    --function-name 'staging-activitySimulationStorePublicKey' \
                    --zip-file fileb://storePublicKeyLambda.zip"

            sh "aws lambda update-function-code \
                    --function-name 'staging-activitySimulationRevokePublicKey' \
                    --zip-file fileb://revokePublicKeyLambda.zip"
        }
    }

    if (env.BRANCH_NAME != 'master' && env.BRANCH_NAME != 'develop') {
        stage('Deploy lambda for preview') {
            sh "aws lambda delete-function --function-name 'deployPreview-activitySimulationTransferTokens-${env.BRANCH_NAME}' || true"
            sh "aws lambda delete-function --function-name 'deployPreview-activitySimulationStorePublicKey-${env.BRANCH_NAME}' || true"
            sh "aws lambda delete-function --function-name 'deployPreview-activitySimulationRevokePublicKey-${env.BRANCH_NAME}' || true"

            sh "aws lambda create-function \
                    --function-name 'deployPreview-activitySimulationTransferTokens-${env.BRANCH_NAME}' \
                    --runtime 'nodejs8.10' \
                    --handler 'transferTokensLambdaHandler.transferTokensLambdaHandler' \
                    --role 'arn:aws:iam::146998029420:role/HandleLambdasRole' \
                    --environment Variables='{MASTER_ACCOUNT_PRIVATE_KEY=${env.MASTER_ACCOUNT_PRIVATE_KEY},NODE_ADDRESS=${env.NODE_ADDRESS},AMOUNT_OF_TOKENS_TO_SEND=${env.AMOUNT_OF_TOKENS_TO_SEND}}' \
                    --zip-file fileb://transferTokensLambda.zip"

            sh "aws lambda create-function \
                    --function-name 'deployPreview-activitySimulationStorePublicKey-${env.BRANCH_NAME}' \
                    --runtime 'nodejs8.10' \
                    --handler 'storePublicKeyLambdaHandler.storePublicKeyLambdaHandler' \
                    --role 'arn:aws:iam::146998029420:role/HandleLambdasRole' \
                    --timeout '300' \
                    --environment Variables='{MASTER_ACCOUNT_PRIVATE_KEY=${env.MASTER_ACCOUNT_PRIVATE_KEY},NODE_ADDRESS=${env.NODE_ADDRESS}}' \
                    --zip-file fileb://storePublicKeyLambda.zip"

            sh "aws lambda create-function \
                    --function-name 'deployPreview-activitySimulationRevokePublicKey-${env.BRANCH_NAME}' \
                    --runtime 'nodejs8.10' \
                    --handler 'revokePublicKeyLambdaHandler.revokePublicKeyLambdaHandler' \
                    --role 'arn:aws:iam::146998029420:role/HandleLambdasRole' \
                    --timeout '300' \
                    --environment Variables='{MASTER_ACCOUNT_PRIVATE_KEY=${env.MASTER_ACCOUNT_PRIVATE_KEY},NODE_ADDRESS=${env.NODE_ADDRESS}}' \
                    --zip-file fileb://revokePublicKeyLambda.zip"
        }
    }

    stage ('Clean up an environment') {
        sh "rm -rf transferTokensLambda.zip"
        sh "rm -rf storePublicKeyLambda.zip"
        sh "rm -rf revokePublicKeyLambda.zip"
        sh "docker rm lambdas-${env.BRANCH_NAME.toLowerCase()} -f || true"
        sh "docker rmi lambdas-${env.BRANCH_NAME.toLowerCase()} -f || true"
    }
}
