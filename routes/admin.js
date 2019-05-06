const path = require('path');

const express = require('express');
const { check, body } = require('express-validator/check');

const auth = require('../middlewares/auth');
const adminController = require('../controllers/admin');

const router = express.Router();

const productValidation = [
  body('title')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters.')
    .trim(),
  body('imageUrl', 'Image URL is invalid.').isURL(),
  body('price', 'Price must be a valid number.').isNumeric(),
  body('description', 'Description must be less than 400 characters.')
    .isLength({ min: 1, max: 400 })
    .trim()
]

// /admin/add-product => GET
router.get('/add-product', auth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', auth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  '/add-product', 
  auth, 
  productValidation,
  adminController.postAddProduct
);

// /admin/edit-product => GET
router.get('/edit-product/:productId', auth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post(
  '/edit-product', 
  auth, 
  productValidation,
  adminController.postEditProduct
);

// /admin/delete-product => POST
router.post('/delete-product', auth, adminController.postDeleteProduct);

module.exports = router;
