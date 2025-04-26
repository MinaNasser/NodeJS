// likeDislikeModel.js placeholder
import mongoose from 'mongoose';

const likeDislikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      enum: ['video', 'comment', 'reply'],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'contentType',
    },
    type: {
      type: String,
      enum: ['like', 'dislike'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only like or dislike a content once
likeDislikeSchema.index({ user: 1, contentType: 1, contentId: 1 }, { unique: true });

const LikeDislike = mongoose.model('LikeDislike', likeDislikeSchema);

export default LikeDislike;