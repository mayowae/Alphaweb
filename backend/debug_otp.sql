-- Check all merchants and their OTP status
SELECT 
    id,
    email,
    "businessName",
    otp,
    "otpExpires",
    "isVerified",
    "createdAt"
FROM merchants
ORDER BY "createdAt" DESC
LIMIT 10;

-- Check for a specific email (replace with your email)
-- SELECT 
--     id,
--     email,
--     otp,
--     "otpExpires",
--     "isVerified",
--     CASE 
--         WHEN "otpExpires" IS NULL THEN 'No expiry set'
--         WHEN "otpExpires" > NOW() THEN 'Valid (not expired)'
--         ELSE 'Expired'
--     END as otp_status,
--     EXTRACT(EPOCH FROM (NOW() - "otpExpires"))/60 as minutes_since_expiry
-- FROM merchants
-- WHERE email = 'your-email@example.com';

-- Update OTP for testing (replace with your email and desired OTP)
-- UPDATE merchants 
-- SET 
--     otp = '123456',
--     "otpExpires" = NOW() + INTERVAL '10 minutes'
-- WHERE email = 'your-email@example.com';
