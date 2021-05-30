const Dockerode = require('dockerode');
const express = require('express')

const docker = new Dockerode();

class Container {
    constructor(image, label) {
        this.image = image;
        this.label = label;
        this.labels = {};
        this.containers = [];
    }

    setRouterRule(rule) {
        this.labels[`traefik.http.routers.${this.label}.rule`] = rule;
        return this;
    }

    setBalancerPort(port) {
        this.labels[`traefik.http.services.${this.label}.loadbalancer.server.port`] = `${port}`;
        return this;
    }

    useStickyBalancer() {
        this.labels[`traefik.http.services.${this.label}.loadBalancer.sticky.cookie`] = "true";
        return this;
    }

    setStripPath(path) {
        this.labels[`traefik.http.middlewares.${this.label}.stripprefix.prefixes`] = path;
        this.labels[`traefik.http.routers.${this.label}.middlewares`] = `${this.label}@docker`;
        return this;
    }

    async stop() {
        const promises = [];
        for (let i = 0; i < this.containers.length; ++i) {
            const c = this.containers.pop();
            promises.push(c.stop().finally(() => c.remove()));
        }
        await Promise.allSettled(promises);
    }

    async scale(size) {
        const promises = [];
        console.log("remove", this.containers.length - size);
        console.log("add", size - this.containers.length);
        for (let i = 0; i < this.containers.length - size; ++i) {
            const c = this.containers.pop();
            promises.push(c.stop().finally(() => c.remove()));
        }
        for (let i = 0; i < size - this.containers.length; ++i) {
            promises.push(this.create(true));
        }
        await Promise.allSettled(promises);
    }

    async remove(){
        return this.scale(this.containers.length-1)
    }

    async add(){
        return this.scale(this.containers.length+1)
    }

    async create(start = true) {
        console.log(this.image, this.labels);
        const c = await docker.createContainer({
            Image: this.image,
            Labels: this.labels,
            NetworkingConfig: {
                'default': 'gateway'
            }
        });
        this.containers.push(c);
        if (start) await c.start();
        return c;
    }

    toJSON(){
        return {
            image:this.image,
            label:this.label,
            active: this.containers.length,
            rule: this.labels[`traefik.http.routers.${this.label}.rule`]
        }
    }
}


const containers = [];
const app = express();
app.use(express.json());
app.use(express.static('public'))

app.get('/containers', async (req, res) => {
    res.json(containers.map((c,id)=>({id,...c.toJSON()})))
});
app.get('/containers/:id', async (req, res) => {
    const id = req.params.id;
    const c = containers[id];
    if(!c) return res.status(404).json({error:`no container with id ${id}`});
    res.json({id,...c.toJSON()})
});

app.post('/containers', async (req, res) => {
    const image = req.body.image;
    const label = req.body.label;

    if(!image || !label)return res.status(400).json({error:"need label and image"});

    const rule = req.body.rule;
    const port = req.body.port;
    const sticky = req.body.sticky;
    const strip = req.body.strip;

    const c = new Container(image,label);
    if(rule) c.setRouterRule(rule);
    if(port) c.setBalancerPort(port);
    if(sticky) c.useStickyBalancer();
    if(strip) c.setStripPath(strip);
    containers.push(c);
    const id = containers.indexOf(c);
    res.json({id,...c.toJSON()})
})

app.get('/containers/:id/start', async (req, res) => {
    const id = req.params.id;
    const c = containers[id];
    if(!c) return res.status(404).json({error:`no container with id ${id}`});
    await c.scale(req.query.scale??1);
    res.json({success:true});
});

app.get('/containers/:id/stop', async (req, res) => {
    const id = req.params.id;
    const c = containers[id];
    if(!c) return res.status(404).json({error:`no container with id ${id}`});
    await c.stop();
    res.json({success:true});
});

app.get('/containers/:id/add', async (req, res) => {
    const id = req.params.id;
    const c = containers[id];
    if(!c) return res.status(404).json({error:`no container with id ${id}`});
    await c.add();
    res.json({success:true});
});

app.get('/containers/:id/remove', async (req, res) => {
    const id = req.params.id;
    const c = containers[id];
    if(!c) return res.status(404).json({error:`no container with id ${id}`});
    await c.remove();
    res.json({success:true});
});

app.listen(3000);
