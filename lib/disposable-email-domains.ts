// A practical (not exhaustive) list of well-known disposable/temporary
// email providers. The real guarantee of a genuine email comes from the
// OTP verification step - this list just rejects obviously-throwaway
// addresses up front with a clear error message.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "10minutemail.net",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "tempmail.com",
  "temp-mail.org",
  "tempmailo.com",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "fakeinbox.com",
  "sharklasers.com",
  "maildrop.cc",
  "mintemail.com",
  "dispostable.com",
  "moakt.com",
  "emailondeck.com",
  "mailnesia.com",
  "mailcatch.com",
  "spamgourmet.com",
  "burnermail.io",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}
