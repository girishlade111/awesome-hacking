import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';

/**
 * Build search index from parsed content sections.
 * Each item: { id, type, heading, content, elementId }
 */
export function buildSearchIndex(sections) {
  const items = [];

  for (const section of sections) {
    // Add heading
    items.push({
      id: `heading-${section.id}`,
      type: 'heading',
      heading: section.heading,
      content: '',
      elementId: section.id,
    });

    // Add each bullet/list item
    if (section.items) {
      for (let i = 0; i < section.items.length; i++) {
        const item = section.items[i];
        items.push({
          id: `item-${section.id}-${i}`,
          type: 'item',
          heading: section.heading,
          content: item.text,
          elementId: section.id,
        });
      }
    }
  }

  return items;
}

export function useSearch(allSections) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const index = useMemo(() => {
    const items = buildSearchIndex(allSections);
    return new Fuse(items, {
      keys: [
        { name: 'heading', weight: 0.6 },
        { name: 'content', weight: 0.4 },
      ],
      threshold: 0.35,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [allSections]);

  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    return index.search(query.trim()).slice(0, 15);
  }, [query, index]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      const el = document.getElementById(results[selectedIndex].item.elementId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setQuery('');
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setQuery('');
      setIsOpen(false);
    }
  };

  const scrollToResult = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setQuery('');
    setIsOpen(false);
  };

  return {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    selectedIndex,
    handleKeyDown,
    scrollToResult,
  };
}
