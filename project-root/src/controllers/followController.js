// followController.js placeholder
import Follow from '../models/followModel.js';
import User from '../models/userModel.js';

// @desc    Follow a user
// @route   POST /api/follows
// @access  Private
const followUser = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is trying to follow themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: userId,
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow relationship
    const follow = await Follow.create({
      follower: req.user._id,
      following: userId,
    });

    // Emit socket event for real-time notification
    if (req.io) {
      req.io.to(userId).emit('newFollow', {
        type: 'follow',
        from: {
          _id: req.user._id,
          username: req.user.username,
          profilePicture: req.user.profilePicture,
        },
      });
    }

    res.status(201).json(follow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/follows/:userId
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find and remove follow relationship
    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: userId,
    });

    if (!follow) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get followers of a user
// @route   GET /api/follows/followers/:userId
// @access  Public
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get followers
    const followers = await Follow.find({ following: userId })
      .populate('follower', 'username profilePicture');

    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get users followed by a user
// @route   GET /api/follows/following/:userId
// @access  Public
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get following
    const following = await Follow.find({ follower: userId })
      .populate('following', 'username profilePicture');

    res.json(following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if user is following another user
// @route   GET /api/follows/check/:userId
// @access  Private
const checkFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if follow relationship exists
    const follow = await Follow.findOne({
      follower: req.user._id,
      following: userId,
    });

    res.json({ following: !!follow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing,
};