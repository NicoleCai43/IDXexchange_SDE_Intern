import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

function parsePhotos(rawPhotos) {
  if (!rawPhotos) return [];
  if (Array.isArray(rawPhotos)) {
    return rawPhotos.filter((photo) => typeof photo === "string" && photo.trim());
  }
  try {
    const parsed = JSON.parse(rawPhotos);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((photo) => typeof photo === "string" && photo.trim());
  } catch {
    return [];
  }
}

export default function PropertyImageGallery({ photosRaw }) {
  const photos = parsePhotos(photosRaw);
  const [mainIndex, setMainIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const lightboxInnerRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setMainIndex((i) => Math.min(i + 1, photos.length - 1));
      if (e.key === "ArrowLeft") setMainIndex((i) => Math.max(i - 1, 0));
    }

    if (lightboxOpen) {
      window.addEventListener("keydown", onKey);
      // focus inner container for keyboard users
      setTimeout(() => {
        lightboxInnerRef.current?.focus();
      }, 0);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [lightboxOpen, photos.length]);

  if (photos.length === 0) return null;

  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={photos[mainIndex]} alt={`Main photo ${mainIndex + 1}`} onClick={() => setLightboxOpen(true)} />
      </div>

      {photos.length > 1 ? (
        <div className="gallery-thumbs">
          {photos.map((p, idx) => (
            <button key={p} type="button" className={idx === mainIndex ? "thumb active" : "thumb"} onClick={() => setMainIndex(idx)}>
              <img src={p} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightboxOpen(false)}>
          <div
            className="lightbox-inner"
            onClick={(e) => e.stopPropagation()}
            ref={lightboxInnerRef}
            tabIndex={-1}
          >
            <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close">✕</button>
            <img src={photos[mainIndex]} alt={`Lightbox ${mainIndex + 1}`} />
            <div className="lightbox-controls">
              <button onClick={() => setMainIndex((i) => Math.max(i - 1, 0))} aria-label="Previous">‹</button>
              <span>{mainIndex + 1} / {photos.length}</span>
              <button onClick={() => setMainIndex((i) => Math.min(i + 1, photos.length - 1))} aria-label="Next">›</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

PropertyImageGallery.propTypes = {
  photosRaw: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
};
