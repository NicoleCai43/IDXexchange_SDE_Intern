import { useEffect, useState } from "react";
import { fetchProperties } from "../api/client.js";
import PropertyCard from "./PropertyCard.jsx";

const PAGE_LIMIT = 20;

export default function ListingPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProperties() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchProperties({ limit: PAGE_LIMIT, offset: 0 });

        if (!ignore) {
          setProperties(Array.isArray(data.results) ? data.results : []);
          setTotal(Number(data.total) || 0);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.message ||
              "Unable to load properties. Please make sure the backend is running."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">IDX Exchange</p>
          <h1>Properties</h1>
        </div>
        {!loading && !error ? (
          <p className="result-count">
            Showing {properties.length} of {total} properties
          </p>
        ) : null}
      </header>

      {loading ? (
        <section className="state-panel">Loading properties...</section>
      ) : null}

      {error ? (
        <section className="state-panel error-panel">
          <strong>Could not load properties.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      {!loading && !error ? (
        <section className="property-grid" aria-label="Property listings">
          {properties.map((property) => (
            <PropertyCard key={property.L_ListingID || property.id} property={property} />
          ))}
        </section>
      ) : null}
    </main>
  );
}
