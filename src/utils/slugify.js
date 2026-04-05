/**
 * Generate a stable URL-friendly slug from a heading string.
 * Mirrors GitHub's slugify algorithm for anchor compatibility.
 */
export function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
