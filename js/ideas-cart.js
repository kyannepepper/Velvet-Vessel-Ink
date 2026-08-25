/**
 * ideas-cart.js
 * -----------------------------------------------------------------------
 * "My Ideas" — a lightweight, temporary client-side cart of inspiration
 * designs (and/or a chosen portfolio piece) selected before starting a
 * tattoo request. Per spec, this lives ONLY in localStorage; nothing here
 * is submitted to Supabase until the client actually completes the
 * request form on booking.html.
 * -----------------------------------------------------------------------
 */

const IdeasCart = (function () {
  const KEY = 'vvi_my_ideas_v1';
  const SOURCE_KEY = 'vvi_source_portfolio_item_v1';

  function _read() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function _write(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* storage unavailable — fail silently, cart just won't persist */
    }
    document.dispatchEvent(new CustomEvent('ideas-cart:change', { detail: { count: list.length } }));
  }

  function getAll() {
    return _read();
  }

  function count() {
    return _read().length;
  }

  function isSaved(id) {
    return _read().some((d) => String(d.id) === String(id));
  }

  function add(design) {
    const list = _read();
    if (list.some((d) => String(d.id) === String(design.id))) return list;
    list.push({
      id: design.id,
      name: design.name,
      style: design.style,
      image_url: design.image_url,
      suggested_placement: design.suggested_placement,
      suggested_size: design.suggested_size,
    });
    _write(list);
    return list;
  }

  function remove(id) {
    const list = _read().filter((d) => String(d.id) !== String(id));
    _write(list);
    return list;
  }

  function toggle(design) {
    return isSaved(design.id) ? remove(design.id) : add(design);
  }

  function clear() {
    _write([]);
  }

  // Optional single "source" portfolio item, set when a visitor clicks
  // "Use This as Inspiration" from a completed-work detail view.
  function setSourcePortfolioItem(item) {
    try {
      localStorage.setItem(
        SOURCE_KEY,
        JSON.stringify({ id: item.id, title: item.title, image_url: item.image_url, style: item.style })
      );
    } catch {
      /* ignore */
    }
  }

  function getSourcePortfolioItem() {
    try {
      const raw = localStorage.getItem(SOURCE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function clearSourcePortfolioItem() {
    try {
      localStorage.removeItem(SOURCE_KEY);
    } catch {
      /* ignore */
    }
  }

  return {
    getAll, count, isSaved, add, remove, toggle, clear,
    setSourcePortfolioItem, getSourcePortfolioItem, clearSourcePortfolioItem,
  };
})();

window.IdeasCart = IdeasCart;
