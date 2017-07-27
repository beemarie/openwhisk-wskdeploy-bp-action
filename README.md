# OpenWhisk Wskdeploy Blueprint Action
OpenWhisk action that uses git and wskdeploy to clone a Blueprint then deploy it on OpenWhisk

## Instructions
1. Clone repo
2. Make sure you have Docker and Dockerhub set-up
3. Create a Dockerfile (or use the one provided) that has the same syntax as the one in this repo, and then build it by running the following commands:

```
docker build . -t <YOUR DOCKERHUB USERNAME>/nodejs6action-git
docker push <YOUR DOCKERHUB USERNAME>/nodejs6action-git
```

4. Zip up the `deploy.js`, `package.json`, and `wskdeploy` files with:

```
zip action.zip deploy.js package.json wskdeploy
```

5. Deploy it to OpenWhisk by running:

```
wsk action update my-wskdeploy-action action.zip --docker <YOUR DOCKERHUB USERNAME>/nodejs6action-git
```

6. Invoke it with the following syntax

```
wsk action invoke my-wskdeploy-action -p user <GITHUB USERNAME> -p pass <GITHUB ACCESS TOKEN> -p repo <URL OF BLUEPRINT GITHUB REPO, i.e. github.com/blueprints/my-awesome-blueprint -r
```

* Note: the `-r` flag tells OpenWhisk to wait and return you the response.


## TODO:
1. Create `deploy.sh` script to simplify the process of zipping, updating, and deploying the action
