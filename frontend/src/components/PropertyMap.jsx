import PropTypes from "prop-types";

export default function PropertyMap({ lat, lng, label }) {
  const latitude = Number(lat);
  const longitude = Number(lng);

  const missingLatitude = lat === null || lat === undefined || lat === "";
  const missingLongitude = lng === null || lng === undefined || lng === "";

  if (
    missingLatitude ||
    missingLongitude ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) return null;

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const q = `${latitude},${longitude}`;
  const src = key
    ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(q)}&zoom=15`
    : `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;

  return (
    <div className="property-map">
      <iframe
        title={label || "Property map"}
        src={src}
        width="100%"
        height="300"
        style={{ border: 0 }}
        loading="lazy"
      />
      <div className="map-links">
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`} target="_blank" rel="noreferrer">Open in Google Maps</a>
      </div>
    </div>
  );
}

PropertyMap.propTypes = {
  lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string
};
