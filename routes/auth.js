const express = require('express');
const { check, body } = require('express-validator/check');

const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user');

router.get('/login', authController.getLogin);
router.post(
  '/login', 
  [
    body('email', 'Please enter a valid email address.')
      .isEmail()
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 5  })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

const minPasswordLen = 8;
router.post(
  '/signup', 
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(existingUser => {
            if (existingUser) {
              return Promise.reject(
                'That email already exists. Please try a different one (or log in if you already have an account.'
              )
            }
          })
        })
      ,
    body('password', `Please enter a password at least ${minPasswordLen} characters long.`)
      .isLength({ min: minPasswordLen })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match.')
        }

        return true;
      })
  ],
  authController.postSignup
);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;