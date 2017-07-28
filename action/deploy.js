var fs = require('fs');
var exec = require('child_process').exec;
const git = require('simple-git');

function main(params) {
  return new Promise(function(resolve, reject) {

    // Either build the remote URL for simple-git or build error
    let remoteOrError = convertParamsToRemote(params);

    // We received an error, reject with it
    if (typeof remoteOrError !== 'string') {
      const { error } = remoteOrError;
      reject(error);
    }

    const remote = remoteOrError;
    // Extract the name of the repo for the tmp directory
    const repoSplit = params.repo.split('/');
    const repoName = repoSplit[repoSplit.length - 1];

    // Make the async call to simple-git to clone the repo
    return git()
      .clone(remote, `${__dirname}/tmp/${repoName}`, (err, data) => {
        if (err) {
          console.log('Error cloning remote ', err);
          reject(err)
        }
        resolve(data)
      })

  })
  .then((data) => {
    console.log('Successfully cloned repo')

    return new Promise(function(resolve, reject) {
      exec('ls', { cwd: __dirname }, (err, data) => {
        if (err) {
          console.log('Error running `ls`: ', err);
          reject(err);
        }
        console.log('LS result is: ')
        console.log(data);
        resolve(data);
      });
    })
  })
  .then((data) => {
    return {
      msg: data
    }
  })
  .catch((err) => {
    console.log('ERROR:')
    console.log(err)
    return {
      msg: err
    }
  })
}

/**
 * Checks that a GitHub username, password (or access token), and repo
 *  are all passed in the params
 * @param  {Object } params   Params object
 * @return {String || Object} String of remote URL if successful, object if error
 */
function convertParamsToRemote(params) {
  const {
    user,
    pass,
    repo
  } = params;
  if (!user || !pass || !repo) {
    return {
      error: 'ERROR: Please enter username, password, and repo as params',
    };
  } else {
    return `https://${user}:${pass}@${repo}`;
  }
}

exports.main = main;
