/**
 * Feature flags for functionality that's fully built but temporarily
 * turned off. Flip these back to `true` to re-enable - no other code
 * needs to change; register/login/dashboard all branch on these flags.
 */

// When false: registration and login skip the OTP/2FA step entirely.
// The OTP email sending, verify-email/verify-login pages, and APIs all
// still exist and work - this just controls whether the flow uses them.
export const ENABLE_LOGIN_OTP = false;

// When false: the dashboard never redirects to /subscribe, regardless of
// trial/subscription status, and the trial banner is hidden. The
// subscription model, Razorpay APIs, /subscribe page, and the Settings
// subscription card all still exist and work if this is turned back on.
export const ENABLE_SUBSCRIPTION_GATE = false;
