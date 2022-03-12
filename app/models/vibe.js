const mongoose = require('mongoose')
// const likesSchema = require('./likes')

const vibeSchema = new mongoose.Schema(
  {
    img: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: false
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Likes'
    }],
    favorited: {
      type: Boolean,
      default: false
    },
    // favorited: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Favorites'
    // }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Vibe', vibeSchema)
