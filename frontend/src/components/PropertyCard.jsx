function parsePhotos(rawPhotos) {
  if (!rawPhotos) {
    return [];
  }

  if (Array.isArray(rawPhotos)) {
    return rawPhotos.filter((photo) => typeof photo === "string" && photo);
  }

  if (typeof rawPhotos !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(rawPhotos);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((photo) => typeof photo === "string" && photo);
  } catch {
    return [];
  }
}

function formatCurrency(value) {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "-";
  }

  return new Intl.NumberFormat("en-US").format(number);
}

export default function PropertyCard({ property }) {
  const photos = parsePhotos(property.L_Photos);
  const firstPhoto = photos[0];
  const cityState = [property.L_City, property.L_State].filter(Boolean).join(", ");

  return (
    <article className="property-card">
      <div className="photo-frame">
        {firstPhoto ? (
          <img src={firstPhoto} alt={property.L_Address || "Property"} />
        ) : (
          <div className="photo-placeholder">No photo available</div>
        )}
      </div>

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
  );
}
