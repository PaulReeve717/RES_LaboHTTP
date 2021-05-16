# Step 5 - Dynamic reverse proxy configuration

## Dynamic IP configuration
We use a completely different way than the one presented in the webcast, 
we decide to use a docker-compose.yml to build all our containers and match the service's IP with intern Docker DNS

```yaml
version: '3.3'

services:
  reverse-proxy:
    image: 'res/apache-rp'
    build:
      context: './images/reverse-proxy'
      dockerfile: ./Dockerfile
    depends_on:
      - static
      - dynamic
    ports:
      - "80:80"
  static: #Warning this service's name is used as intern DNS name in the apache config in the reverse proxy
    image: 'res/apache_php'
    build:
      context: './images/static-php'
      dockerfile: ./Dockerfile
  dynamic: #Warning this service's name is used as intern DNS name in the apache config in the reverse proxy
    image: 'res/express'
    build:
      context: './images/dynamic-express'
      dockerfile: ./Dockerfile
```
This file will build all the three images (the static server, the dynamic server and the reverse proxy). 
The "depends-on" field in the reverse-proxy config will assure us that it is builded after the two other images.



We edit the ``001-reverse-proxy.conf`` to add the two services name as DNS name
```apacheconf
<VirtualHost *:80>
    ServerName demo.res.ch
    ProxyPass "/api/jokes/" "http://dynamic:3000/"
    ProxyPassReverse "/api/jokes/" "dynamic:3000/"


    ProxyPass "/" "http://static:80/"
    ProxyPassReverse "/" "http://static:80/"
</VirtualHost>
```

## How to run the containers
We run this command in the folder that contains the "docker-compose.yml" file
```bash
docker-compose up
```
It will create the 3 server's containers. 
Now you can stop and restart the static/dynamic server and even if they change their IP while they restart,
The system will still work.
