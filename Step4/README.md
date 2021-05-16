# Step 4 - Ajax request with ~~Jquery~~ Fetch

## Container creation

We modify the static server dockerfile by adding the following line which install vim:
```dockerfile
RUN apt-get update && apt-get install -y vim
```

## How to build and run the container
to update the new php container with the script tag.
```bash
docker build -t res/apache_php .
docker run -p 9090:80 res/apache_php
```


## The JavaScript
We haven't use JQuery Ajax because why using a framework when we can use directly use modern ways.
Actually we use the ``fetch API`` and use directly the ``querySelector`` to access DOM elements. 
No framework just pure simple JavaScript. 

Just add this script tag in the header (don't forget to put ``defer`` in the script tag)
```html
<script defer>
    async function getJoke(){
        // fetch the joke api, get the response and deserialize the json body
       const json = await fetch("/api/jokes/").then(r=>r.json());
       
       //set the tag's text
       document.querySelector('#jokeContainer').innerText = json.joke;
       document.querySelector('#jokeAnswer').innerText = json.answer;
    }
    getJoke(); // get joke immediately 
    //get a new joke every 5s
    setInterval(()=>getJoke(),5000);
</script>
```
