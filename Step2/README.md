# Step 2: Dynamic HTTP server with express.js

## Container creation

```dockerfile
FROM node:15.13.0
COPY ./src/ ./src
COPY package*.json .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

In the src folder we put an index.js which contains all the requests that our server handles and a JSON file 
which contains the data needed for the requests.
In this dockerfile we use a node image where we copy the src folder, and the node config file ```package.json```.
On the image build we run ```npm install``` to install the dependencies need. 
We finally add the command to execute when we create a container from the image which is ```npm start```. 
This command will launch the script in the start section of the ```package.json```

### node config
When we do an ```npm start``` commande we launch this command ```node ./src/index.js``` which will launch our server

## How to build and run the container

```bash
docker build -t res/express_app .
docker run -p 9090:3000 res/express_app
```
## The two requests of our app:
Now we can try our joke simulator with these requests:
- ```GET /``` To get a random joke
- ```GET /:type``` To get a random joke in the desired category like _beauf_, _dev_ or _dark_

## There are two sort of response:
### Response ```200```
```json 
{
    "joke": "joke",
    "answer": "response"
}
```
### Response ```404```
#### When the server doesn't find a joke (The category doesn't exist)
```json 
{
  "error": "Oh zut je n'ai pas trouvé de blague..."
}
```

## Copyright
We found the ```blague.json``` file on a Github repository
- https://raw.githubusercontent.com/Blagues-API/api/master/blagues.json
