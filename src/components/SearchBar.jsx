import { useRef, useEffect } from 'react';

/**
 * Highlight matching portions in search result text.
 */
function highlightText(text, query) {
  if (!query || !text) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchBar({ searchState }) {
  const {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    selectedIndex,
    handleKeyDown,
    scrollToResult,
  } = searchState;

  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search sections..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay closing so click can register
            setTimeout(() => setIsOpen(false), 200);
          }}
          onKeyDown={handleKeyDown}
          aria-label="Search sections"
          aria-expanded={isOpen && results.length > 0}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="search-results" role="listbox" aria-label="Search results">
          {results.map((result, i) => {
            const item = result.item;
            return (
              <li
                key={item.id}
                role="option"
                aria-selected={i === selectedIndex}
                className={`search-result-item ${i === selectedIndex ? 'selected' : ''}`}
                onClick={() => scrollToResult(item.elementId)}
                onMouseEnter={() => {
                  // Update selected on hover
                }}
              >
                <span className="search-result-type">{item.type === 'heading' ? '§' : '•'}</span>
                <span className="search-result-text">
                  {item.type === 'item' && (
                    <span className="search-result-heading">{highlightText(item.heading, query)} → </span>
                  )}
                  {highlightText(item.type === 'item' ? item.content : item.heading, query)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="search-no-results">No results found</div>
      )}
    </div>
  );
}
