const express = require("express");
const app = express();
const PORT = 3000;
const jokes = require('./blagues.json');

app.listen(PORT,()=>{
    console.log(`Server listen on port ${PORT}`)
})

function getJoke(type){
    const filteredJokes = jokes.filter(joke=>!type || joke.type === type);
    return filteredJokes[Math.floor(Math.random()*filteredJokes.length)];
}

app.get("/:type?",((req, res) => {
    const joke = getJoke(req.params.type);
    if(!joke){
        return res.status(404).json({
            error:"Oh zut je n'ai pas trouvé de blague..."
        })
    }
    res.json({
        joke:joke.joke,
        answer:joke.answer
    })
}));
