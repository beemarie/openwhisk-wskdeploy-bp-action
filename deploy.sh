#!/bin/bash
set -e

# https://github.com/csantanapr/openwhisk-demos/blob/master/db2Action/deploy.sh

OW_ACTION_NAME=${OW_ACTION_NAME:=$1}
OW_ACTION_NAME=${OW_ACTION_NAME:="clone-and-wskdeploy"}
ACTION_ZIP=${2:-action.zip}
OW_ACTION_DOCKER_IMAGE=${OW_ACTION_DOCKER_IMAGE:=$3}
OW_ACTION_DOCKER_IMAGE=${OW_ACTION_DOCKER_IMAGE:="zachschultz/nodejs6action-git"}
OW_HOST=${OW_HOST:=`wsk property get --apihost | awk '{printf $4}'`}
OW_AUTH=${OW_AUTH:=`wsk property get --auth | awk '{printf $3}'`}

# Create action zip with source code
if [ ${ACTION_ZIP} = "action.zip" ]; then
echo Creating ${ACTION_ZIP} using action/*
pushd action > /dev/null
zip -r ../action.zip *
popd > /dev/null
fi

# Update (or create) and deploy action
echo Deploying OpenWhisk action $OW_ACTION_NAME with content of ${ACTION_ZIP} using image $OW_ACTION_DOCKER_IMAGE to host $OW_HOST
bx wsk action update ${OW_ACTION_NAME} ${ACTION_ZIP} --docker ${OW_ACTION_DOCKER_IMAGE}
echo Action successfully deployed
echo Invoke action using:
echo "bx wsk action invoke ${OW_ACTION_NAME} -r -p wskAuth <WSK AUTH KEY> -p wskApiHost <WSK API HOST> -p user <GH_USER_NAME> -p pass <GH_ACCESS_TOKEN> -p repo <GH_REPO_URL> -p envData <JSON of env needed for wskdeploy, i.e. '{\"CLOUDANT_HOSTNAME\":\"MY_CLOUDANT_HOSTNAME\"}'>"
