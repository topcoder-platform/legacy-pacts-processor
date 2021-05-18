# Legacy Challenge Migration CLI Tool

Reviews informix tables for payments created by v5 legacy-payment-processor and moves them through the payment process

## Intended use
- Mimic PACTs processing of payments from status Entered to status Owed

## Prerequisites

-  [NodeJS](https://nodejs.org/en/) 
-  [Informix](https://www.ibm.com/cloud/informix)
-  [Docker](https://www.docker.com/)(CE 17+)
-  [Docker Compose](https://docs.docker.com/compose/)

## Configuration

See `config/default.js`. Most of them is self explain there.
- `PORT`: API server port; default to `3001`
- `SYNC_INTERVAL`: the interval of schedule; default to `5`(minutes)
- `SYNC_ENABLED`: if the sync should run. Allows you to turn off the service via config
- `LOG_LEVEL`: default info
- `INFORMIX`: object of properties to connect to informix

## Local Deployment
### Foreman Setup
To install foreman follow this [link](https://theforeman.org/manuals/1.24/#3.InstallingForeman)
To know how to use foreman follow this [link](https://theforeman.org/manuals/1.24/#2.Quickstart) 

If you run something with `nf run npm run <something>` instead of `npm run <something>`, it'll load in a `.env` file from the root of the project

### Deployment
 To simplify deployment, we're using docker. To build the images
or run the container:
```
cd <legacy-challenge-migration-cli>/docker
docker-compose up
```
This will automatically build the image if have not done this before.
After container has been run, go to container shell and install dependencies:

```
docker exec -ti legacy-challenge-migration-cli bash
npm i
```
