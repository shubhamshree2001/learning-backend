require('dotenv').config()

const express = require('express'); // common js
// import express from 'express'; // modern js 

//both the above statement are same but the first one is more common and the second one is more modern
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// / is a home route
// express server is running on port 3000 , the app variable is having a method get which is used to handle the get request and it will 
//send the request to the server and the server will send the response to the client 
// it is a callback function which is used to handle the get request and it will send the response to the client 
//in res we are sending hello world! as response to the client

app.get('/twitter', (req, res) => {
    res.send('shubham.01');
});

app.get('/login', (req, res) => {
    res.send('<h1> login page </h1>');
});


const githubData = {
    "login": "shubhamshree2001",
    "id": 49955445,
    "node_id": "MDQ6VXNlcjQ5OTU1NDQ1",
    "avatar_url": "https://avatars.githubusercontent.com/u/49955445?v=4",
    "gravatar_id": "",
    "url": "https://api.github.com/users/shubhamshree2001",
    "html_url": "https://github.com/shubhamshree2001",
    "followers_url": "https://api.github.com/users/shubhamshree2001/followers",
    "following_url": "https://api.github.com/users/shubhamshree2001/following{/other_user}",
    "gists_url": "https://api.github.com/users/shubhamshree2001/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/shubhamshree2001/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/shubhamshree2001/subscriptions",
    "organizations_url": "https://api.github.com/users/shubhamshree2001/orgs",
    "repos_url": "https://api.github.com/users/shubhamshree2001/repos",
    "events_url": "https://api.github.com/users/shubhamshree2001/events{/privacy}",
    "received_events_url": "https://api.github.com/users/shubhamshree2001/received_events",
    "type": "User",
    "user_view_type": "public",
    "site_admin": false,
    "name": "Shubham Agrawal ",
    "company": null,
    "blog": "",
    "location": "Bengaluru",
    "email": null,
    "hireable": null,
    "bio": "Software Engineer | 4+ Years | Flutter, Dart, React, Node.js, TypeScript | Mobile & Frontend Development",
    "twitter_username": null,
    "public_repos": 28,
    "public_gists": 0,
    "followers": 2,
    "following": 12,
    "created_at": "2019-04-24T16:21:10Z",
    "updated_at": "2026-08-07T10:30:28Z"
}

app.get('/github', (req, res) => {
    res.json(githubData);
});


app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});

// listen is a method which is used to listen to the port and the port is the port on which the server is running
//the listen method is also came from app variable which is express
// it takes port as an argument and a callback function as an argument

// so here the application is continuing to run and the server is running on port 3000
// so if we go to the browser and type localhost:3000/twitter , we will see the response shubham.01
// so it is a simple server 

// if we go to the browser and type localhost:3000/login , it will show error , we need to stop and restart the server
// to solve this problem there is a package 

