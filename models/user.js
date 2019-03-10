const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [
      { 
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product) {
  const existingProdIndex = this.cart.items.findIndex(item => {
    return item.productId.toString() === product._id.toString();
  });
  const newCartItems = [...this.cart.items];
  let newQuantity = 1;

  if (existingProdIndex >= 0) {
    newQuantity = this.cart.items[existingProdIndex].quantity + 1;
    newCartItems[existingProdIndex].quantity = newQuantity;
  } else {
    newCartItems.push(
      { productId: product._id, quantity: newQuantity }
    );
  }
  
  this.cart = { items: newCartItems };

  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  const newCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });

  this.cart.items = newCartItems;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };

  return this.save();
}

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// const ObjectId = mongodb.ObjectId;
// const _getUsersCollection = () => getDb().collection('users');

// class User {
//   constructor(name, email, cart, id) {
//     this.name = name;
//     this.email = email;
//     this.cart = cart;
//     this._id = id ? new ObjectId(id) : null;
//   }

//   save() {
//     _getUsersCollection().updateOne({ _id: this._id }, { $set: this }, true);
//   }

//   addToCart(product) {
//     const existingProdIndex = this.cart.items.findIndex(item => {
//       return item.productId.toString() === product._id.toString();
//     });
//     const newCartItems = [...this.cart.items];
//     let newQuantity = 1;

//     if (existingProdIndex >= 0) {
//       newQuantity = this.cart.items[existingProdIndex].quantity + 1;
//       newCartItems[existingProdIndex].quantity = newQuantity;
//     } else {
//       newCartItems.push(
//         { productId: new ObjectId(product._id), quantity: newQuantity }
//       );
//     }
    
//     const newCart = { 
//       items: newCartItems 
//     };

//     return _getUsersCollection()
//       .updateOne(
//         { _id: this._id }, 
//         { $set: { cart: newCart } }
//       )
//       .catch(err => console.log(err));
//   }

//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map(item => item.productId);
    
//     return db
//       .collection('products')
//       .find({ _id: { $in: productIds }})
//       .toArray()
//       .then(products => {
//         // Creating map of product IDs to cart quantities for constant
//         // time lookup
//         const prodQuantities = this.cart.items.reduce((acc, item) => {
//           acc[item.productId.toString()] = item.quantity;
//           return acc;
//         }, {});

//         return products.map(product => {
//           return {
//             ...product,
//             quantity: prodQuantities[product._id.toString()]
//           }
//         });
//       })
//       .catch(err => console.log(err));
//   }

//   deleteCartItem(productId) {
//     const newCartItems = this.cart.items.filter(item => {
//       return item.productId.toString() !== productId.toString();
//     });

//     return _getUsersCollection()
//       .updateOne(
//         { _id: this._id }, 
//         { $set: { cart: { items: newCartItems } } }
//       )
//   }

//   addOrder() {
//     const db = getDb();

//     return this.getCart()
//       .then(products => {
//         const order = {
//           items: products,
//           user: {
//             _id: this._id,
//             name: this.name,
//             email: this.email
//           }
//         }

//         return db.collection('orders')
//           .insertOne(order)
//       })
//       .then(() => {
//         this.cart = { items: [] };

//         return _getUsersCollection()
//           .updateOne(
//             { _id: this._id }, 
//             { $set: { cart: { items: [] } } }
//           )
//       })
//       .catch(err => console.log(err));
//   }

//   getOrders() {
//     const db = getDb();

//     return db.collection('orders')
//       .find({ 'user._id': this._id })
//       .toArray()
//       .catch(err => console.log(err));
//   }

//   static findById(userId) {
//     return _getUsersCollection()
//       .find({ _id: new ObjectId(userId) })
//       .next()
//       .then(user => user)
//       .catch(err => console.log(err));
//   }
// }

// module.exports = User;