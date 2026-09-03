/**
 * The key that signs session cookies.
 *
 * A development fallback is a convenience locally and a hole in production:
 * the value was committed, so anyone who can read the repository could mint a
 * cookie claiming any role, including admin. In production the secret must be
 * supplied, and the app refuses to start without it rather than quietly
 * signing with a public string.
 */
export function requireSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET is missing or too short. Set it to at least 32 random ' +
        'characters in the deployment environment before starting the app.'
    );
  }

  if (secret) {
    console.warn(
      'SESSION_SECRET is shorter than 32 characters. This is tolerated in ' +
        'development only.'
    );
    return secret;
  }

  return 'development-only-session-key-not-for-deployment';
}
