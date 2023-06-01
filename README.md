# fragments

CCP555 Summer 2022 - hlee246

# npm setup

1. npm init -y
2. Modify the generated package.json file to
3. npm install

# prettier setup

1. npm install --save-dev --save-exact prettier
2. Create a .prettierrc file
3. Create a .prettierignore file
4. Create a folder .vscode/ and add a settings.json

# ESLint Setup

1. npm install --save-dev eslint
2. npx eslint --init
3. Add a lint script to your package.json file

# Structured Logging and Pino Setup

1. npm install --save pino pino-pretty pino-http
2. Create and configure logger.js in src/ folder

# express setup

1. npm install --save express cors helmet compression
2. create app.js in src/
3. npm install --save stoppable
4. Create a src/sever.js

# How to run script!!

1. npm run lint
2. node src/server.js
3. curl http://localhost:8080
4. curl -s localhost:8080 | jq -> need to run in cmd
5. curl -i localhost:8080 -> this too <br />
   <br />
   npm install --save-dev nodemon -> to automatically reload our server whenever the code changes. <br />
   (Add some npm scripts to package.json in order to automatically start our server. had to put cross-env for my case)<br />
   (add launch.json in .vscode/)<br />
   <br />
6. npm start
7. npm run dev
8. npm run debug
   <br />

# How to run docker

- run in 8080 port using AWS Cognito config
  docker run --rm --name fragments --env-file .env -p 8080:8080 fragments:latest

- use Basic Auth config
  docker run --rm --name fragments --env-file env.jest -p 8080:8080 fragments:latest

- rebuild image
  docker build -t fragments:latest .

- override the file
  docker run --rm --name fragments --env-file env.jest -e LOG_LEVEL=debug -p 8080:8080 fragments:latest

- run our container in the background
  docker run --rm --name fragments --env-file env.jest -e LOG_LEVEL=debug -p 8080:8080 -d fragments:latest
  docker logs -f "id printed"

- make docker image and push to docker hub
  docker build -t username/fragments:latest -t username/fragments:lab-6 -t username/fragments:90f9154 .
  docker tag fragments username/fragments:tag-name
  docker push username/fragments:tag
  docker push --all-tags user/fragments

# run on EC2

Expand pack on putty: tar -xvzf fragments-0.0.1.tgz<br/>
npm install<br/>
npm start

# run docker-compose

docker-compose --env-file docker.env up

# update version

(Need to push changes first)<br/>
npm version patch<br/>
git push origin main --tags

# hurl test-integration

npm run test:integration after start server(npm start)<br/>
