const path = require('path');
const express = require('express');
const { config, engine } = require("express-edge");
const mongoose = require('mongoose');
const keys = require('./keys');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const storePost = require('./middleware/storePost');
const createPostController = require('./controllers/createPost');
const homePageController = require('./controllers/homePage');
const storePostController = require('./controllers/storePost');
const getPostController = require('./controllers/getPost');
const createUserController = require("./controllers/createUser");
const storeUserController = require('./controllers/storeUser');
const loginController = require("./controllers/login");
const loginUserController = require('./controllers/loginUser');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const auth = require("./middleware/auth");
const redirectIfAuthenticated = require('./middleware/redirectIfAuthenticated')
const connectFlash = require("connect-flash");
const edge = require("edge.js");
const logoutController = require("./controllers/logout");

const app= new express();

mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected.'))
    .catch(err => console.error(err))

    const mongoStore = connectMongo(expressSession);
    
app.use(expressSession({
    secret: 'secret',
    store: new mongoStore({
        mongooseConnection: mongoose.connection
    })
}));

app.use(connectFlash());
app.use(fileUpload());
app.use(express.static("public"));
app.use (engine);
// Configure Edge if need to
config({ cache: process.env.NODE_ENV === 'production' });
app.set('views', __dirname+'/views');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use('*', (req, res, next) => {
    edge.global('auth', req.session.userId)
    next()
});

app.use('/posts/store', storePost)
app.get ('/notific', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'pages/notific.html'));
});
app.get ('/settings', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'pages/settings.html'));
});
app.get("/", homePageController);
app.get("/post/:id", getPostController);
app.get("/posts/new", createPostController);
app.get('/auth/login', loginController);
app.post("/posts/store", storePost, storePostController);
app.post("/users/login", redirectIfAuthenticated, loginUserController);
app.get("/auth/register", redirectIfAuthenticated, createUserController);
app.post("/users/register", storeUserController);
app.get("/auth/logout", logoutController);
app.listen(4000, () => {
    console.log('App listening on port 4000')
});
