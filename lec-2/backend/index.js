import express from 'express';

// how to assemble java script file --> in package.json we have type: module or commonjs
// module the new way to write java script file using import, it import file asynchronously by default
// commonjs is the old way to write java script file using require, it import file synchronously by default

const app = express();

//app.use(express.static('dist'));
// it is bad practice we should not do it we are creating build of frontend project and adding it to
// backend so backend changes reflect . 

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/api/jokes', (req, res) => {
    const jokes = [
        {
            id: 1,
            joke: 'What do you call a fish with no eyes? A fsh.'
        },
        {
            id: 2,
            joke: 'Why did the chicken cross the road? To get to the other side.'
        },
        {
            id: 3,
            joke: 'What do you call a fish with no eyes? A fsh.'
        },
        {
            id: 4,
            joke: 'What do you call a fish with no eyes? A fsh.'
        },
        {
            id: 5,
            joke: 'What do you call a fish with no eyes? A fsh.'
        },
    ]
    res.json(jokes);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});