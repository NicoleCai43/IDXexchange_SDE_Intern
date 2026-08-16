import { useState } from "react";

function parsePhotos(rawPhotos) {
  if (!rawPhotos) return [];
  if (Array.isArray(rawPhotos)) return rawPhotos.filter(Boolean);
  try {
    const parsed = JSON.parse(rawPhotos);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

export default function PropertyImageCarousel({ photosRaw, onClick }) {
  const photos = parsePhotos(photosRaw);
  const [index, setIndex] = useState(0);

  if (photos.length === 0) return null;

  function prev(e) {
    e.stopPropagation();
    setIndex((i) => (i <= 0 ? photos.length - 1 : i - 1));
  }

  function next(e) {
    e.stopPropagation();
    setIndex((i) => (i >= photos.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="carousel">
      <div className="photo-frame" onClick={onClick}>
        <img src={photos[index]} alt={`Photo ${index + 1}`} />
      </div>

      {photos.length > 1 ? (
        <div className="carousel-controls">
          <button type="button" className="carousel-prev" onClick={prev} aria-label="Previous photo">‹</button>
          <span className="carousel-counter">{index + 1} / {photos.length}</span>
          <button type="button" className="carousel-next" onClick={next} aria-label="Next photo">›</button>
        </div>
      ) : null}
    </div>
  );
}
