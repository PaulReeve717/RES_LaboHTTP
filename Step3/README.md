# Step 3 - Reverse Proxy

## Container creation

```dockerfile
FROM php:7.2-apache

COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
```

In the conf folder we put a sites-available folder which contains the two needed configurations files for the reverse proxy.
In this dockerfile we use a php image with apache then copy the conf folder at the appropriate place. 
We then activate the necessary apache modules to enable reverse proxying 
and finally we enable the two virtualhost configured by the config files

## Virtual host config
For the ```000-default.conf```, we didn't write any config but the file must be here to be the default connection
For the ```001-reverse.proxy.conf```, we configure how the reverse proxy redirected requests to the appropriate server.

```apacheconf
<VirtualHost *:80>
    ServerName demo.res.ch
    ProxyPass "/api/jokes/" "http://172.17.0.3:3000/"
    ProxyPassReverse "/api/jokes/" "http://172.17.0.3:3000/"


    ProxyPass "/" "http://172.17.0.2:80/"
    ProxyPassReverse "/" "http://172.17.0.2:80/"
</VirtualHost>
```
### Limitation: Static IP
The server's IP in the virtual host configuration are hardcoded. 
It's not the best because we cannot be assured that the server's containers keep the same IP when they are restarted

## Requests
Here's the different request and where which each one redirects.
- demo.res.ch:
## How to build and run the container

```bash
docker build -t <image_name> .
docker run -p 9090:80 <image_name>
```
This command is how you build and run the reverse proxy container.
The command to run the express and the static server are the same except 
that you don't map the ports when running (remove the "-p" parameter in the ```docker run`` command)

## List of commands to show the default apache config

```bash
docker exec -it <container_name> /bin/bash

# We're now in the container bash
cd /etc/apache2/sites-available/
more 000-default.conf
```

## Add our host config

### Windows
Edit the host file located here ```C:\Windows\System32\drivers\etc\hosts```, and add this line.
```
127.0.0.1 demo.res.ch
```
### MacOs
Edit the host file located here ```/private/etc/hosts```, and add this line.
```
127.0.0.1 demo.res.ch
```
### Linux
Edit the host file located here ```/etc/hosts```, and add this line.
```
127.0.0.1 demo.res.ch
```
