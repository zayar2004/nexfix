/**
 * Convert a title to a URL-safe slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate slug from title. Fallback if empty (Myanmar/emoji only).
 */
export function generateSlug(title: string): string {
  const slug = slugify(title);
  if (slug) return slug;
  return `article-${Date.now()}`;
}

/**
 * Validate manually-entered slug.
 */
export function validateSlug(slug: string): string | null {
  if (!slug) return "Slug cannot be empty.";
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return "Slug may only contain lowercase English letters, numbers, and hyphens.";
  }
  if (slug.length < 2) return "Slug must be at least 2 characters.";
  if (slug.length > 200) return "Slug must be 200 characters or less.";
  return null;
}
