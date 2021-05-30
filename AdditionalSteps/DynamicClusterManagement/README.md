# Additional steps: Load balancing: Dynamic cluster management

## Configure cluster

We did two docker compose for this step. One for the traefik reverse proxy and one for the static and dynamic servers.
What needed to be in common with these two files was that all the servers and the reverse proxy use the same network 
so they can easily communicate between them.

### Reverse Proxy
For the reverse proxy in this step we used traefik instead of apache.

Here's the docker compose for it :
```yarn
version: '3.3'

services:
  traefik-proxy:
    container_name: global_traefik
    # The official v2 Traefik docker image
    image: traefik:v2.4
    # Enables the web UI and tells Traefik to listen to docker
    command: --api.insecure=true --providers.docker
    ports:
      # The HTTP port
      - "80:80"
      # The Web UI (enabled by --api.insecure=true)
      - "8080:8080"
    volumes:
      # So that Traefik can listen to the Docker events
      - //var/run/docker.sock:/var/run/docker.sock

    networks:
      # Attach the traefik container to the default network (which is the global "gateway" network)
      - default

# Make the externally created network "gateway" available as network "default"
networks:
  default:
      name: gateway
```

Original [here](docker-compose.yml).

This docker compose is heavily inspired from the one in the [traefik Quick start page](https://doc.traefik.io/traefik/getting-started/quick-start/)
### Servers
We write all needed traefik config in the labels section of each service (the static and dynamic server)

Here's the docker compose for it :
```yaml
version: '3.3'

services:
  static:
    image: 'res/apache_php'
    labels:
      - traefik.http.services.static.loadbalancer.server.port=80
      # Do the correct redirection
      - traefik.http.routers.static.rule=Host(`demo.res.ch`) && PathPrefix(`/`) 
      # Sticky session with a cookie
      - traefik.http.services.static.loadBalancer.sticky.cookie=true
      - traefik.http.services.static.loadBalancer.sticky.cookie.name=static_cookie 
    networks:
      - default
  dynamic:
    image: 'res/express'
    labels:
      - traefik.http.services.dynamic.loadbalancer.server.port=3000
      # Do the correct redirection
      - traefik.http.routers.dynamic.rule=Host(`demo.res.ch`) && PathPrefix(`/api/jokes/`)
      # Strip the prefix because our server only accept request on '/' 
      - traefik.http.middlewares.dynamic.stripprefix.prefixes=/api/jokes/
      - traefik.http.routers.dynamic.middlewares=dynamic@docker
    networks:
      - default

networks:
  default:
    name: gateway
```

Original [here](./images/reverse-proxy/servers/docker-compose.yml).

### Launch dynamic containers in bash
To launch the traefik container you just need to do a ```docker compose up```
in the folder that contains the docker compose for the traefik server.

For the servers you can launch the following command in the folder 
that contains the docker compose for the static and dynamic server:

```bash
docker compose -p servers1 up -d --scale static=4 --scale dynamic=3
```

This command example will create a new docker compose cluster named ```servers1``` which will contain thanks to the ```--scale```
option 4 static servers container and 3 dynamic server container.

#### Tests
We test all of it by first create our traefik container then multiple cluster of static and dynamic servers containers.
We then shutdown some static and dynamic servers and see the traefik container adapt to it by changing its loadbalancing config.







