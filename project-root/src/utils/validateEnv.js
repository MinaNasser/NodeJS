/**
 * Validates required environment variables
 * @returns {boolean} True if all required variables are present
 */
export const validateEnv = () => {
    const requiredEnvVars = [
      'PORT',
      'MONGODB_URI',
      'JWT_SECRET'
    ];
    
    const optionalEnvVars = [
      'CLOUD_STORAGE_KEY',
      'STORAGE_BUCKET',
      'EMAIL_SERVICE',
      'EMAIL_USERNAME',
      'EMAIL_PASSWORD',
      'EMAIL_FROM'
    ];
    
    let missingVars = [];
    
    // Check required variables
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }
    
    // Log warnings for missing optional variables
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        console.warn(`Warning: Optional environment variable ${envVar} is not set.`);
      }
    }
    
    // If any required variables are missing, log error and return false
    if (missingVars.length > 0) {
      console.error(`Error: Required environment variables are missing: ${missingVars.join(', ')}`);
      return false;
    }
    
    return true;
  };