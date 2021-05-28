# Additional steps: Load balancing: round robin & sticky sessions

## Configure load balancer
We start with the standard load balancer in the previous step [here](../LoadBalancing/README.md) 
and we edit the apache config to add __Sticky Session__ to the __static servers__.

So we change the reverse proxy configuration.
Here's the configuration file for the reverse proxy virtual host:
```apacheconf
<VirtualHost *:80>
    ServerName demo.res.ch

    Header add Balancer-Route "%{BALANCER_WORKER_ROUTE}e"
    Header add Set-Cookie "ROUTEID=.%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED
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
        ProxySet stickysession=ROUTEID
    </Proxy>
    #use sticky session only for static
    ProxyPass "/" "balancer://static/" stickysession=ROUTEID|jsessionid scolonpathdelim=On 
    ProxyPassReverse "/" "balancer://static/"

</VirtualHost>
```
### For sticky session:
We added a cookie header named ROUTEID that will be set to one of the three static servers on the first client request
then every next request from this client will be sent to the server indicated in the cookie.

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







