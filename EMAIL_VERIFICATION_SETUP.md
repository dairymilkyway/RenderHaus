# Email Verification Setup Guide

## Overview
This project now includes OTP-based email verification using Mailtrap for testing email functionality.

## Backend Implementation

### New Features Added:
1. **OTP Generation & Verification**: 6-digit numeric codes
2. **Email Templates**: Professional HTML email templates
3. **Database Schema Updates**: Added email verification fields to User model
4. **New API Endpoints**: `/verify-email` and `/resend-otp`
5. **Authentication Protection**: Users must verify email before login

### Database Changes:
```javascript
// Added to User schema:
isEmailVerified: { type: Boolean, default: false }
emailVerificationOTP: { type: String }
emailVerificationExpires: { type: Date }
```

### API Endpoints:

#### POST `/api/auth/register`
- Creates user account
- Sends verification email with OTP
- Returns user data (no tokens until verified)

#### POST `/api/auth/verify-email`
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### POST `/api/auth/resend-otp`
```json
{
  "email": "user@example.com"
}
```

#### POST `/api/auth/login`
- Now checks if email is verified
- Blocks login for unverified accounts

## Frontend Implementation

### New Components:
1. **EmailVerification.js**: OTP input form with timer
2. **Auth.js**: Main authentication flow controller

### Features:
- 6-digit OTP input with automatic formatting
- Resend timer (60 seconds)
- Professional UI matching existing design
- Error handling and success feedback

## Mailtrap Configuration

### Setup Instructions:

1. **Create Mailtrap Account**:
   - Go to [mailtrap.io](https://mailtrap.io)
   - Sign up for a free account
   - Create a new inbox

2. **Get Credentials**:
   - In your Mailtrap inbox, go to "SMTP Settings"
   - Copy the username and password

3. **Update Environment Variables**:
   ```env
   MAILTRAP_USER=your_username_here
   MAILTRAP_PASS=your_password_here
   ```

4. **Current Configuration** (already set):
   ```env
   MAILTRAP_USER=ad370c1730db1c
   MAILTRAP_PASS=33145d3248c642
   ```

## Email Template Features

### Professional Design:
- NaviBuild branding
- Responsive HTML layout
- Clear OTP display
- Security messaging
- Professional typography

### Template Structure:
```html
- Header with branding
- Welcome message
- Prominent OTP display
- Expiry information (10 minutes)
- Security footer
```

## Security Features

### OTP Security:
- 6-digit numeric codes
- 10-minute expiry
- SHA-256 hashed storage
- One-time use only

### Email Protection:
- Rate limiting on resend
- Input validation
- Secure token generation

## User Flow

1. **Registration**:
   - User fills registration form
   - Account created (unverified)
   - Verification email sent
   - Redirect to verification screen

2. **Email Verification**:
   - User receives OTP via email
   - Enters OTP in verification form
   - System validates OTP
   - Account activated, tokens issued
   - Redirect to dashboard

3. **Login Protection**:
   - Unverified users cannot login
   - Clear error message provided
   - Option to resend verification

## Testing

### Using Mailtrap:
1. Register a new account
2. Check Mailtrap inbox for email
3. Copy OTP from email
4. Verify using frontend form

### Email Preview:
All emails appear in your Mailtrap inbox with:
- Subject: "Verify Your Email - NaviBuild"
- Professional HTML formatting
- 6-digit OTP clearly displayed

## Error Handling

### Common Scenarios:
- **Expired OTP**: Clear message, option to resend
- **Invalid OTP**: Error feedback, allow retry
- **Already Verified**: Skip verification process
- **Email Send Failure**: Graceful fallback
- **Network Issues**: Retry mechanisms

## Production Considerations

### For Production Deployment:
1. Replace Mailtrap with real SMTP service (SendGrid, AWS SES, etc.)
2. Update email templates with production branding
3. Implement email deliverability monitoring
4. Add backup verification methods
5. Configure proper DNS records (SPF, DKIM, DMARC)

### Environment Variables for Production:
```env
NODE_ENV=production
SMTP_HOST=your_production_smtp_host
SMTP_PORT=587
SMTP_USER=your_production_smtp_user
SMTP_PASS=your_production_smtp_password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your App Name
```

## Troubleshooting

### Common Issues:

1. **Emails not received**:
   - Check Mailtrap credentials
   - Verify environment variables
   - Check server logs

2. **OTP validation fails**:
   - Ensure OTP hasn't expired
   - Check for typos in input
   - Verify database connection

3. **Frontend integration issues**:
   - Check API endpoints
   - Verify CORS configuration
   - Monitor browser console

### Debug Commands:
```bash
# Check environment variables
node -e "console.log(process.env.MAILTRAP_USER)"

# Test email configuration
node -e "require('./config/mailer').sendEmail('test@example.com', 'verificationOTP', 'Test User', '123456')"
```

## Next Steps

### Potential Enhancements:
1. **SMS Verification**: Add phone number verification
2. **Social Login**: OAuth integration
3. **Password Reset**: Email-based password recovery
4. **Email Preferences**: User email settings
5. **Multi-language**: Internationalized email templates

This implementation provides a robust, secure, and user-friendly email verification system that enhances account security while maintaining a smooth user experience.
