import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { marked } from 'marked';
import { extractTOC, buildTOCTree } from './utils/toc-generator.js';
import { slugify } from './utils/slugify.js';
import { useTheme } from './hooks/useTheme.js';
import { useSearch } from './hooks/useSearch.js';
import Sidebar from './components/Sidebar.jsx';
import SearchBar from './components/SearchBar.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// Raw markdown content — loaded at build time via Vite
import rawMarkdown from '../content/awesome-hacking.md?raw';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Parse markdown into sections for the search index.
 * Each section = { heading, id, items: [{ text, ... }] }
 */
function parseSections(markdown) {
  const sections = [];
  const lines = markdown.split('\n');
  let currentSection = null;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{2,6})\s+(.+)/);
    if (headingMatch) {
      const text = headingMatch[2].trim();
      const displayText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
      currentSection = {
        heading: displayText,
        id: slugify(displayText),
        items: [],
      };
      sections.push(currentSection);
    } else if (currentSection && line.match(/^\s*[*-]\s+/)) {
      // Clean list item text
      const itemText = line.replace(/^\s*[*-]\s+/, '').trim();
      // Strip markdown for search
      const cleanText = itemText
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim();
      if (cleanText) {
        currentSection.items.push({ text: cleanText });
      }
    }
  }

  return sections;
}

/**
 * Custom renderer to add proper IDs to headings.
 */
class CustomRenderer extends marked.Renderer {
  heading(token) {
    const text = token.text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
    const id = slugify(text);
    const level = token.depth;
    return `<h${level} id="${id}">${token.text}</h${level}>\n`;
  }
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const contentRef = useRef(null);

  // Parse markdown
  const tocHeadings = useMemo(() => extractTOC(rawMarkdown), []);
  const tocTree = useMemo(() => buildTOCTree(tocHeadings), [tocHeadings]);
  const sections = useMemo(() => parseSections(rawMarkdown), []);

  // Search
  const searchState = useSearch(sections);

  // Render markdown
  const htmlContent = useMemo(() => {
    const renderer = new CustomRenderer();
    return marked.parse(rawMarkdown, { renderer });
  }, []);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const headings = document.querySelectorAll('#content h1, #content h2, #content h3, #content h4, #content h5, #content h6');
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    for (const h of headings) observer.observe(h);
    return () => observer.disconnect();
  }, [htmlContent]);

  const handleNavigate = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  }, []);

  return (
    <div className="app">
      {/* Skip to content link */}
      <a href="#content" className="skip-link">
        Skip to content
      </a>

      {/* Header */}
      <header className="header" role="banner">
        <div className="header-inner">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? 'Close table of contents' : 'Open table of contents'}
            aria-expanded={sidebarOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <h1 className="header-title">Awesome Hacking</h1>

          <div className="header-actions">
            <SearchBar searchState={searchState} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <div className="layout">
        {/* Sidebar TOC */}
        <Sidebar
          tocTree={tocTree}
          activeId={activeId}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Main Content */}
        <main className="main-content" id="content" ref={contentRef} role="main" tabIndex="-1">
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </main>
      </div>

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  );
}
