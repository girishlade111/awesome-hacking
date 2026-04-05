import { slugify } from './slugify.js';

/**
 * Parse markdown text and extract headings with their hierarchy.
 * Returns a flat array of { id, text, level } objects.
 */
export function extractTOC(markdown) {
  const headingRegex = /^(#{2,6})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length - 1; // ## = 2, ### = 3, etc.
    const text = match[2].trim();
    // Remove inline markdown links for the TOC display text
    const displayText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
    const id = slugify(displayText);
    headings.push({ id, text: displayText, level, originalText: text });
  }

  return headings;
}

/**
 * Build a nested TOC tree structure from flat headings.
 */
export function buildTOCTree(headings) {
  const tree = [];
  const stack = [{ level: 1, children: tree }];

  for (const heading of headings) {
    const node = { ...heading, children: [] };

    // Find the correct parent
    while (stack.length > 1 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }

  return tree;
}
