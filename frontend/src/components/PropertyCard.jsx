import PropertyImageCarousel from "./PropertyImageCarousel.jsx";
import { Link } from "react-router-dom";

function parsePhotos(rawPhotos) {
  if (!rawPhotos) return [];
  if (Array.isArray(rawPhotos)) return rawPhotos.filter((p) => typeof p === "string" && p);
  if (typeof rawPhotos !== "string") return [];
  try {
    const parsed = JSON.parse(rawPhotos);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => typeof p === "string" && p);
  } catch {
    return [];
  }
}

function formatCurrency(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Price unavailable";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "-";
  return new Intl.NumberFormat("en-US").format(number);
}

export default function PropertyCard({ property }) {
  const photos = parsePhotos(property.L_Photos);
  const cityState = [property.L_City, property.L_State].filter(Boolean).join(", ");

  return (
    <Link to={`/property/${property.L_ListingID || property.id}`} className="property-link">
      <article className="property-card">
        {photos.length > 0 ? (
          <PropertyImageCarousel photosRaw={property.L_Photos} onClick={() => {}} />
        ) : (
          <div className="photo-frame">
            <div className="photo-placeholder">No photo available</div>
          </div>
        )}

        <div className="card-body">
          <div>
            <p className="price">{formatCurrency(property.L_SystemPrice)}</p>
            <h2>{property.L_Address || "Address unavailable"}</h2>
            <p className="location">{cityState || "Location unavailable"}</p>
          </div>

          <dl className="facts">
            <div>
              <dt>Beds</dt>
              <dd>{formatNumber(property.L_Keyword2)}</dd>
            </div>
            <div>
              <dt>Baths</dt>
              <dd>{formatNumber(property.LM_Dec_3)}</dd>
            </div>
            <div>
              <dt>Sqft</dt>
              <dd>{formatNumber(property.LM_Int2_3)}</dd>
            </div>
          </dl>
        </div>
      </article>
    </Link>
  );
}
