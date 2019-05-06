const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  }
}));

exports.getLogin = (req, res, next) => {
  const errors = req.flash('errors');
  const error = errors[0];

  const messages = req.flash('messages');
  const message = messages[0];

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errors: [],
    successMsg: message,
    inputValues: { email: '', password: '' }
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errors: [{ msg: 'A user with that email does not exist.', param: 'email' }],
          successMsg: '',
          inputValues: { email, password }
        })
      }

      return bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            return res.status(422).render('auth/login', {
              path: '/login',
              pageTitle: 'Login',
              errors: [{ msg: 'Invalid email or password.', param: 'all' }],
              successMsg: '',
              inputValues: { email, password }
            })
          } else {
            req.session.isLoggedIn = true;
            req.session.user = user;
            
            return req.session.save((err) => {
              if (err) {
                console.log(err);
              }

              res.redirect('/');
            })
          }
        })
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  const errors = req.flash('errors');

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errors: errors.map(error => ({ msg: error, param: '' })),
    inputValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
};

exports.postSignup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422)
      .render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errors: errors.array(),
        inputValues: { name, email, password, confirmPassword }
      });
  }

  return bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({ 
        name: name,
        email: email, 
        password: hashedPassword, 
        cart: { items: [] } 
      });

      return user.save();
    })
    .then(() => {
      req.flash('messages', 'Success! Your account has been created. Please log in to continue.')
      res.redirect('/login');

      return transporter.sendMail({
        to: email,
        from: 'shop@neils-store.com',
        subject: `Welcome to Neil's Shop!`,
        html: '<h1>You successfully signed up!</h1>'
      });
    })
    .catch(err => {
      console.log(err);
    })
    .catch(err => console.log(err));
};

exports.getReset = (req, res, next) => {
  const errors = req.flash('errors');
  const error = errors[0];

  const messages = req.flash('messages');
  const message = messages[0];

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMsg: error,
    message: message
  });
};

exports.postReset = (req, res, next) => {
  const { email } = req.body;
  User
    .findOne({ email })
    .then(user => {
      if (!user) {
        req.flash('errors', 'No account found with that email.');
        
        return res.redirect('/reset');
      }

      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          req.flash('errors', 'There was a problem resetting your password.');
          
          return res.redirect('/reset');
        }

        const token = buffer.toString('hex');
        user.resetToken = token;

        const oneHour = Date.now() + 3600000;
        user.resetTokenExpiration = oneHour;

        user
          .save()
          .then(() => {
            req.flash('messages', 'Please check your email. A message with a password reset link should arrive shortly.')
            res.redirect('/reset');

            transporter.sendMail({
              to: email,
              from: 'support@neils-store.com',
              subject: `Password Reset`,
              html: `
                <p>You requested to reset your password.</p>
                <p>Please click <a href="http://localhost:3000/reset/${token}">this link</a> to set a new password.</p>
              `
            })
            .then(info => console.log(info))
            .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      });
    })
    .catch(err => console.log(err));
};

exports.getNewPassword = (req, res, next) => {
  const { token } = req.params;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      if (!user) {
        req.flash('errors', 'That password reset token is expired or invalid. Please try resetting your password again.');
        
        return res.redirect('/reset');
      }

      const errors = req.flash('errors');
      const error = errors[0];

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMsg: error,
        userId: user._id.toString(),
        resetToken: token
      });
    })
    .catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const { userId, resetToken, password } = req.body;
  let userDoc;

  User.findOne({ 
    _id: userId, 
    resetToken: resetToken, 
    resetTokenExpiration: { $gt: Date.now() } 
  })
    .then(user => {
      if (!user) {
        req.flash('errors', `That didn't work. Your token may have expired. Please try resetting your password again.`);
        
        return res.redirect('/reset');
      }

      userDoc = user;

      return bcrypt.hash(password, 12)
    })
    .then(hashedPassword => {
      userDoc.password = hashedPassword;
      userDoc.resetToken = undefined;
      userDoc.resetTokenExpiration = undefined;

      return userDoc.save();
    })
    .then(() => {
      req.flash('messages', 'Your password has been reset successfully. Please log in using your new password.');

      return res.redirect('/login');
    })
    .catch(err => console.log(err));
};