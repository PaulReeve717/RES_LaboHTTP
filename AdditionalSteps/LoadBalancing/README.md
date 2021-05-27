# Additional steps: Load balancing: multiple server nodes

## Configure load balancer
We first have to enable all the necessaries apache modules to support load balancing.
Here's the dockerfile of the reverse proxy:
```dockerfile
FROM php:7.2-apache

COPY conf/ /etc/apache2

RUN a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests headers
RUN a2ensite 000-* 001-*
```

We then change the docker compose file so it creates 3 static servers (static1, static2, static3) and
3 dynamic servers (dynamic1, dynamic2, dynamic3).

Then we change the reverse proxy configuration.
Here's the configuration file for the reverse proxy virtual host:
```apacheconf
<VirtualHost *:80>
    ServerName demo.res.ch

    Header add Balancer-Route "%{BALANCER_WORKER_ROUTE}e"
    
    <Proxy "balancer://dynamic">
        BalancerMember "http://dynamic1:3000" route=dynamic1
        BalancerMember "http://dynamic2:3000" route=dynamic2
        BalancerMember "http://dynamic3:3000" route=dynamic3
    </Proxy>
    ProxyPass "/api/jokes/" "balancer://dynamic/"
    ProxyPassReverse "/api/jokes/" "balancer://dynamic/"

    <Proxy "balancer://static">
        BalancerMember "http://static1:80" route=static1
        BalancerMember "http://static2:80" route=static2
        BalancerMember "http://static3:80" route=static3
    </Proxy>
    ProxyPass "/" "balancer://static/"
    ProxyPassReverse "/" "balancer://static/"

</VirtualHost>
```
We create two balancer cluster. One for the static site and one for the dynamic site.
For easier debug we add a response header named "Balancer-Route" which show from which server the response comes from.
With this we can easily check in our browser or in wireshark the "Balancer-Route" header value and we show that as planned
the requests are spread throughout all the servers.

