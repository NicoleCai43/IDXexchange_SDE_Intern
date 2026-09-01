import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropertyImageGallery from "../components/PropertyImageGallery.jsx";
import PropertyMap from "../components/PropertyMap.jsx";
import OpenHouses from "../components/OpenHouses.jsx";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [openhouses, setOpenhouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/properties/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error(`Failed to load property: ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setProperty(data);

        const ohRes = await fetch(`/api/properties/${encodeURIComponent(id)}/openhouses`);
        if (ohRes.ok) {
          const ohData = await ohRes.json();
          setOpenhouses(Array.isArray(ohData) ? ohData : []);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load property");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <main className="page-shell"><section className="state-panel">Loading property...</section></main>;

  if (error) return <main className="page-shell"><section className="state-panel error-panel"><strong>Error</strong><div>{error}</div><button onClick={() => navigate(-1)}>Back</button></section></main>;

  if (!property) return <main className="page-shell"><section className="state-panel">Property not found</section></main>;

  const photos = property.L_Photos;
  const lat = property.LMD_MP_Latitude ?? property.LMD_MP_Lat ?? property.LMD_MP_Latitude;
  const lng = property.LMD_MP_Longitude ?? property.LMD_MP_Long ?? property.LMD_MP_Longitude;

  return (
    <main className="page-shell">
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>{property.L_Address || "Property Detail"}</h1>
      <p className="result-count">{property.L_SystemPrice ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.L_SystemPrice) : 'Price unavailable'}</p>

      <PropertyImageGallery photosRaw={photos} />

      <section className="property-details">
        <h2>Details</h2>
        <p>{property.L_Description || property.L_PublicRemarks || "No description available."}</p>
        <dl className="facts">
          <div><dt>Beds</dt><dd>{property.L_Keyword2 ?? "-"}</dd></div>
          <div><dt>Baths</dt><dd>{property.LM_Dec_3 ?? "-"}</dd></div>
          <div><dt>Sqft</dt><dd>{property.LM_Int2_3 ?? "-"}</dd></div>
        </dl>
      </section>

      <PropertyMap lat={lat} lng={lng} label={property.L_Address} />

      <OpenHouses list={openhouses} />
    </main>
  );
}
