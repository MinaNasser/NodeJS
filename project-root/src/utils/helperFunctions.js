// helperFunctions.js placeholder
import crypto from 'crypto';

// Generate a random token for password reset
const generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Set expire time to 10 minutes
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return {
    resetToken,
    resetPasswordToken,
    resetPasswordExpire,
  };
};

// Pagination helper
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;

  return { limit, offset };
};

// Format pagination response
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, items, totalPages, currentPage };
};

export { generateResetToken, getPagination, getPagingData };