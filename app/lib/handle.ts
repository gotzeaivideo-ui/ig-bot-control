export function extractHandle(input: string): string | null {
  const trimmed = input.trim();

  if (!trimmed) return null;

  // Reject obvious non-profile Instagram URLs (posts, reels)
  if (/instagram\.com\/(p|reel)\//i.test(trimmed)) {
    return null;
  }

  // Case: starts with @
  if (trimmed.startsWith("@")) {
    const handle = trimmed.slice(1).toLowerCase();
    return isValidHandle(handle) ? handle : null;
  }

  // Case: a full Instagram URL
  const urlMatch = trimmed.match(
    /instagram\.com\/([a-zA-Z0-9._]+)\/?/i
  );
  if (urlMatch) {
    const handle = urlMatch[1].toLowerCase();
    return isValidHandle(handle) ? handle : null;
  }

  // Case: plain handle typed directly
  const plain = trimmed.toLowerCase();
  return isValidHandle(plain) ? plain : null;
}

function isValidHandle(handle: string): boolean {
  return /^[a-z0-9._]{1,30}$/.test(handle);
}