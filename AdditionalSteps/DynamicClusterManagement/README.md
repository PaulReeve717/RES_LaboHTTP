# Additional steps: Load balancing: Dynamic cluster management

## Configure cluster
For the reverse proxy in this step we used traefik instead of apache. We write all needed traefik config
in the docker compose in the labels section of each service. 
We also add a scale option for the static and dynamic server. 
This option will allow us to create as many containers as the value of this option when we do a ```docker compose up```.

```yaml
version: '3.3'

services:
  traefik-proxy:
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
  static:
    image: 'res/apache_php'
    scale: 2 # 2 containers of the static server will be created
    labels:
      # set the redirection
      - traefik.http.routers.static.rule=Host(`demo.res.ch`) && PathPrefix(`/`)
      # allow sticky session in a cooke named static_cookie
      - traefik.http.services.static.loadBalancer.sticky.cookie=true
      - traefik.http.services.static.loadBalancer.sticky.cookie.name=static_cookie
  dynamic:
    image: 'res/express'
    scale: 2 # 2 containers of the dynamic server will be created
    labels:
      # set the redirection
      - traefik.http.routers.dynamic.rule=Host(`demo.res.ch`) && PathPrefix(`/api/jokes/`)
      # correct the prefix because the dynamic server only accept request on '/'
      - traefik.http.middlewares.dynamic.stripprefix.prefixes=/api/jokes/
      - traefik.http.routers.dynamic.middlewares=dynamic@docker
```

### Launch dynamic containers in bash
```bash
cd servers
docker compose -p servers1 up -d --scale static=4 --scale dynamic=3
```

#### Tests
We test multiple scenarios
- __Check our config in real condition__
  
  To check our config we launch several Browser Session to verify that the assets are correctly downloaded from the same
  server tagged in the cookie.

- __Some static servers are down__
  
  We try to stop some static server during the runtime to check what happens. So we control then Apache detects 
  that the downed servers are correctly detected and then Apache set another Sticky Session value with a valid server.
### For Round Robin:
We didn't add any configuration for __Round Robin__ to apply in the dynamic servers because that's the default algorithm that 
apache use.

#### Tests
We test one scenario

- __One client doing the dynamic server servers__
    We saw that each response from dynamic servers came from a different server in an ordered and cyclic way
  (dynamic1 &rarr; dynamic2 &rarr; dynamic 3 &rarr; dynamic1 &rarr; ...). 
  We didn't do the test with multiple clients because it's easier to see the Round Robin with one client.

  
### Remarks
With our configuration the cookie is always send even in a request for the dynamic server that doesn't use it. 
We are sure than we can set the cookie only for some route, but we should have to dive in Apache's documentation.







