const mongoose = require('mongoose')

const vibeSchema = new mongoose.Schema(
  {
    img: {
      // data: Buffer,
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
    liked: {
      type: Boolean,
      default: false
    },
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
