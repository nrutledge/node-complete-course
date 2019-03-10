const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  items: [
    { 
      product: { 
        title: { type: String, required: true },
        price: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        description: { type: String, required: true }
      },
      quantity: { type: Number, required: true }
    }
  ],
  user: { 
    name: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);