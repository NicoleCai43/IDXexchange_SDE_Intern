import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProperties } from "../api/client.js";
import PropertyCard from "./PropertyCard.jsx";
import PropertyFilters from "./PropertyFilters.jsx";

const PAGE_LIMIT = 20;

export default function ListingPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({});
  const requestIdRef = useRef(0);

  const loadProperties = useCallback(async (params = {}) => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError("");

    try {
      const data = await fetchProperties({ limit: PAGE_LIMIT, offset: 0, ...params });

      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      setProperties(Array.isArray(data.results) ? data.results : []);
      setTotal(Number(data.total) || 0);
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
    loadProperties(nextFilters);
  }

  function handleClear() {
    setFilters({});
    loadProperties();
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">IDX Exchange</p>
          <h1>Properties</h1>
        </div>
        {!loading && !error && properties.length > 0 ? (
          <p className="result-count">
            Showing {properties.length} of {total} properties
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
  );
}
