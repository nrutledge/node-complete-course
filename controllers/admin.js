const { validationResult } = require('express-validator/check');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errors: [],
    product: {
      title: '',
      imageUrl: '',
      price: '',
      description: ''
    }
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, imageUrl, description } = req.body;
  const errors = validationResult(req);

  console.log('postAddProduct errors', errors.array());

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errors: errors.array(),
      product: { title, price, imageUrl, description }
    });
  }

  const product = new Product({
    title, 
    price, 
    imageUrl, 
    description,
    userId: req.user
  });
  
  product
    .save()
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        errors: [],
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const { title, price, imageUrl, description, productId } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render(`admin/edit-product`, {
      pageTitle: 'Edit Product',
      path: `/admin/edit-product`,
      editing: true,
      errors: errors.array(),
      product: { title, price, imageUrl, description, _id: productId }
    });
  }

  Product
    .findOne({ _id: productId, userId: req.user._id })
    .then(product => {
      if (!product) {
        return res.redirect('/admin/products');
      }

      product.title = title;
      product.price = price;
      product.imageUrl = imageUrl;
      product.description = description;
      product.userId = req.user._id;

      return product.save()
        .then(() => res.redirect('/admin/products'))
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch(err => console.log(err));
};