# Step 1 - Static HTTP server with apache httpd

## Container creation

```dockerfile
FROM php:7.2-apache
COPY content/ /var/www/html/
```

In the content folder we put a boostrap template.
In this dockerfile we use a php image with apache

## How to build and run the container

```bash
docker build -t res/apache_php .
docker run -p 9090:80 res/apache_php
```

## List of commands to show the default apache config

```bash
docker exec -it <container_name> /bin/bash

# We're now in the container bash
cd /etc/apache2/sites-available/
more 000-default.conf
```
