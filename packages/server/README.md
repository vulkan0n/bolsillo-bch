# `@selene-wallet/server`

Note: This repo is part of the Selene monorepo. Refer to the central documentation for more required information.

[NPM packages](https://www.npmjs.com/org/selene-wallet)

[Gitlab source](https://gitlab.com/selene.cash/selene-wallet)

[Docker images](https://hub.docker.com/u/bitcoincashpodcast)

## Getting Started

```
$ npm start
# Apollo GraphQL sandbox available at http://localhost:4000/

# Local database setup with Postgres & Prisma
$ createdb selene-wallet-local-db
# Make a copy of .env-example called .env

# Fill out with the correct values
# Ask a team member for values

DATABASE_URL="postgresql://<Username>:<Password>@<hostname>:<port>/<databasename>?schema=public"

e.g. DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

$ npx prisma generate
$ npx prisma migrate dev
$ npx prisma studio # Database browseable at http://localhost:5555
```

## Setup

Setup on a new AWS EC2 instance.

```
# Build server in Docker locally
$ docker build . -t selene-wallet-server
$ docker run -p 4000:4000 selene-wallet-server # Test locally

# Push to Docker hub
# Using `bitcoincashpodcast` docker account
$ docker login
$ docker tag selene-wallet-server bitcoincashpodcast/selene-wallet-server
$ docker push bitcoincashpodcast/selene-wallet-server

# Create an Amazon EC2 instance, use Ubuntu AWI (with Docker preinstalled)
# Create local keys (Selene Wallet Server Keys) when prompted, and connect from that folder
# Ensure EC2 instance Port 4000 is open in Security Group
$ chmod 400 Selene\ Wallet\ Server\ Keys.pem
$ ssh -i Selene\ Wallet\ Server\ Keys.pem ubuntu@ec2-54-208-15-113.compute-1.amazonaws.com
# Install and run Server on AWS instance
# Note that DATABASE_URL environment variable can only be passed in at container start time
ubuntu@ $ docker run -e DATABASE_URL="<DATABASE_URL>" -p 4000:4000 bitcoincashpodcast/selene-wallet-server
ubuntu@ $ docker container ps # Get container ID
ubuntu@ $ docker exec npx prisma migrate deploy # Run Prisma migrations
```

## Deployment

Deploying a new server version to AWS EC2 instance.

```
# Ensure code is finished
# Ensure package.json version is higher than [the NPM published version](https://www.npmjs.com/package/@selene-wallet/server). Bump and commit if needed.

# Build server in Docker locally
$ docker build . -t selene-wallet-server
$ docker run -p 4000:4000 selene-wallet-server # Test locally

# Push to Docker hub
# Using `bitcoincashpodcast` docker account
$ docker login
$ docker tag selene-wallet-server bitcoincashpodcast/selene-wallet-server
$ docker push bitcoincashpodcast/selene-wallet-server

# Publish to NPM
$ npm publish --access=public

# Create local keys (Selene Wallet Server Keys) when prompted, and connect from that folder
$ ssh -i Selene\ Wallet\ Server\ Keys.pem ubuntu@ec2-54-208-15-113.compute-1.amazonaws.com
# Replace running Server on AWS instance
# Note that DATABASE_URL environment variable can only be passed in at container start time
ubuntu@ $ docker run -e DATABASE_URL="<DATABASE_URL>" -p 4000:4000 bitcoincashpodcast/selene-wallet-server
ubuntu@ $ docker container ps # Get container ID
ubuntu@ $ docker exec npx prisma migrate deploy # Run Prisma migrations
```
