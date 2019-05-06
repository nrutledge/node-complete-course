require('dotenv').config();

const path = require('path');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const mongoose = require('mongoose');
const csurf = require('csurf');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions'
});

const csrfProtection = csurf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.SESSION_SECRET.length < 20) {
  throw new Error('SESSION_SECRET too short!');
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(flash())
app.use(csrfProtection);

app.use((req, res, next) => {
  if (!req.session.user) return next();

  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
  .connect(process.env.MONGO_URI)
  .then(result => {
    console.log('Connected to Mongo');

    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Neil',
          email: 'neil@test.com',
          password: '12345',
          cart: {
            items: []
          }
        });
    
        user.save();
      }
    })
    .catch(err => console.log(err));
    
    app.listen(3000);
  })
  .catch(err => console.log(err));
