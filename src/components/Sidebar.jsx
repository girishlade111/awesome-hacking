import { useState, useCallback } from 'react';

/**
 * Recursive TOC tree renderer with collapsible groups.
 */
function TOCNode({ node, depth = 0, activeId, onNavigate }) {
  const [collapsed, setCollapsed] = useState(depth >= 2);

  const hasChildren = node.children && node.children.length > 0;
  const isActive = node.id === activeId;

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      onNavigate(node.id);
    },
    [node.id, onNavigate]
  );

  const handleToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <li className={`toc-item toc-depth-${depth}`}>
      <div className={`toc-link-wrapper ${hasChildren ? 'has-children' : ''}`}>
        {hasChildren && (
          <button
            className="toc-toggle"
            onClick={handleToggle}
            aria-label={collapsed ? `Expand ${node.text}` : `Collapse ${node.text}`}
            aria-expanded={!collapsed}
          >
            {collapsed ? '▸' : '▾'}
          </button>
        )}
        <a
          href={`#${node.id}`}
          className={`toc-link ${isActive ? 'active' : ''}`}
          onClick={handleClick}
          aria-current={isActive ? 'true' : undefined}
        >
          {node.text}
        </a>
      </div>
      {hasChildren && !collapsed && (
        <ul className="toc-children">
          {node.children.map((child) => (
            <TOCNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar({ tocTree, activeId, onNavigate, isOpen, onToggle }) {
  const handleNavigate = useCallback(
    (id) => {
      onNavigate(id);
      // On mobile, close the drawer after navigation
      if (window.innerWidth < 768) {
        onToggle();
      }
    },
    [onNavigate, onToggle]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} aria-hidden="true" />}

      <aside
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Table of contents"
        id="sidebar"
      >
        <nav className="sidebar-nav" aria-label="Table of contents navigation">
          <ul className="toc-list">
            {tocTree.map((node) => (
              <TOCNode
                key={node.id}
                node={node}
                depth={0}
                activeId={activeId}
                onNavigate={handleNavigate}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
