const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// const _getProdCollection = () => getDb().collection('products');

// class Product {
//   constructor(title, price, imageUrl, description, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const dbOp = this._id ?
//       _getProdCollection().updateOne({ _id: this._id }, { $set: this }) :
//       _getProdCollection().insertOne(this);

//     return dbOp
//       // .then(result => console.log(result))
//       .catch(err => console.log(err));
//   }

//   static fetchAll() {
//     return _getProdCollection()
//       .find()
//       .toArray()
//       .then(products => {
//         // console.log(products);
//         return products;
//       })
//       .catch(err => console.log(err));
//   }

//   static findById(prodId) {
//     return _getProdCollection()
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then(product => product)
//       .catch(err => console.log(err));
//   }

//   static delete(prodId) {
//     return _getProdCollection()
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .catch(err => console.log(err));
//   }
// }

// module.exports = Product;