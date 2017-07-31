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

    // Grab wskAuth and apihost for wskdeploy command
    const {
      wskAuth,
      wskApiHost
    } = params;

    // Extract the name of the repo for the tmp directory
    const repoSplit = params.repo.split('/');
    const repoName = repoSplit[repoSplit.length - 1];

    // Make the async call to simple-git to clone the repo
    // @TODO: Add optimization/caching here if repo exists on invoker already
    return git()
      .clone(remote, `${__dirname}/tmp/${repoName}`, (err) => {
        if (err) {
          console.log('Error cloning remote ', err);
          reject(err);
        }
        resolve({
          repoDir: `${__dirname}/tmp/${repoName}`,
          wskAuth,
          wskApiHost,
        });
      });
  })
  .then((data) => {
    console.log('Creating config file for wskdeploy');
    const {
      wskAuth,
      wskApiHost
    } = data;
    return new Promise(function(resolve, reject) {
      exec(`echo "AUTH=${wskAuth}\nAPIHOST=${wskApiHost}\nNAMESPACE=_" > .wskprops && cat .wskprops`, {
        cwd: `/root/`
      }, (err, stdout, stderr) => {
        if (err) {
          console.log('Error creating .wskdeploy props', err);
          reject(err);
        }
        if (stdout) {
          console.log('stdout: ');
          console.log(stdout);
        }
        if (stderr) {
          console.log('stderr: ');
          console.log(stderr);
        }
        resolve(data);
      }
    )
    });
  })
  .then((data) => {
    const { repoDir } = data;
    return new Promise(function(resolve, reject) {
      exec(`printf 'y' | ./wskdeploy -m ${repoDir}/blueprint/manifest.yaml &> result.txt`, {
        cwd: __dirname,
        env : {
          // CLOUDANT_HOSTNAME: 'FILL ME IN',
          // CLOUDANT_USERNAME: 'FILL ME IN',
          // CLOUDANT_PASSWORD: 'FILL ME IN',
          // CLOUDANT_DATABASE: 'FILL ME IN',
        }
      }, (err, stdout, stderr) => {
        if (err) {
          console.log('Error running `./wskdeploy`: ', err);
          reject(err);
        }
        if (stdout) {
          console.log('stdout: ');
          console.log(stdout);
        }
        if (stderr) {
          console.log('stderr: ');
          console.log(stderr);
        }
        resolve(data);
      });
    })
  })
  .then((data) => {
    console.log('Performing LS')
    return new Promise(function(resolve, reject) {
      exec('ls', {
        cwd: __dirname,
      }, (err, stdout, stderr) => {
        if (err) {
          console.log('Error running `ls`: ', err);
          reject(err);
        }
        console.log('ls result is: ')
        if (stdout) {
          console.log('stdout: ');
          console.log(stdout);
        }
        if (stderr) {
          console.log('stderr: ');
          console.log(stderr);
        }
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
    repo,
    wskAuth,
    wskApiHost,
  } = params;
  if (!user || !pass || !repo || !wskAuth || !wskApiHost) {
    return {
      error: 'ERROR: Please enter wskAuth, wskApiHost, username, password, and repo as params',
    };
  } else {
    return `https://${user}:${pass}@${repo}`;
  }
}

exports.main = main;
