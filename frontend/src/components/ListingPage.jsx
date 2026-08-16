import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProperties } from "../api/client.js";
import PropertyCard from "./PropertyCard.jsx";
import PropertyFilters from "./PropertyFilters.jsx";

const PAGE_LIMIT = 20;

export default function ListingPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({});
  const requestIdRef = useRef(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const startIndex = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const endIndex = startIndex + properties.length - 1;

  const loadProperties = useCallback(async (params = {}, pageNumber = 1) => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError("");

    try {
      const data = await fetchProperties({
        limit: PAGE_LIMIT,
        offset: (pageNumber - 1) * PAGE_LIMIT,
        ...params,
      });

      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setProperties(Array.isArray(data.results) ? data.results : []);
      setTotal(Number(data.total) || 0);
      setPage(pageNumber);
    } catch (err) {
      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setError(
        err.message ||
          "Unable to load properties. Please make sure the backend is running."
      );
      setProperties([]);
      setTotal(0);
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  function handleSearch(nextFilters) {
    setFilters(nextFilters);
    loadProperties(nextFilters, 1);
  }

  function handleClear() {
    setFilters({});
    loadProperties({}, 1);
  }

  function handlePageChange(nextPage) {
    if (nextPage === page) {
      return;
    }

    loadProperties(filters, nextPage);
  }

  function getPageItems(totalPages, currentPage) {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 'ellipsis', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
  }

  return (
    <>
      <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">IDX Exchange</p>
          <h1>Properties</h1>
        </div>
        {!loading && !error && properties.length > 0 ? (
          <p className="result-count">
            Showing {startIndex}-{endIndex} of {total} properties
          </p>
        ) : null}
      </header>

      <PropertyFilters
        initialFilters={filters}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {loading ? (
        <section className="state-panel">Loading properties...</section>
      ) : null}

      {error ? (
        <section className="state-panel error-panel">
          <strong>Could not load properties.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      {!loading && !error && totalPages > 1 ? null : null}

      {!loading && !error && properties.length === 0 ? (
        <section className="state-panel">
          <strong>No properties found.</strong>
          <span>Try adjusting or removing some filters to show more results.</span>
        </section>
      ) : null}

      {!loading && !error && properties.length > 0 ? (
        <section className="property-grid" aria-label="Property listings">
          {properties.map((property) => (
            <PropertyCard key={property.L_ListingID || property.id} property={property} />
          ))}
        </section>
      ) : null}
      </main>

      {!loading && !error && totalPages > 1 ? (
        <nav className="site-pagination" aria-label="Page navigation">
          <div className="pagination-controls">
            <button
              type="button"
              className="page-btn prev"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              ‹
            </button>

            {getPageItems(totalPages, page).map((item, idx) =>
              item === 'ellipsis' ? (
                <span key={`e-${idx}`} className="ellipsis">…</span>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={"page-btn" + (item === page ? " active" : "")}
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => handlePageChange(Number(item))}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              className="page-btn next"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              ›
            </button>
          </div>
        </nav>
      ) : null}
    </>
  );
}
