'use strict'

// require mongoose
const mongoose = require('mongoose')

// define the structure of the comment in the schema constructor
const favoritesSchema = new mongoose.Schema(
  {
    type: Boolean,
    default: false,
    required: false,
    owner: {
      // the type to use for a one-to-many reference
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

// export
module.exports = mongoose.model('Favorites', favoritesSchema)
