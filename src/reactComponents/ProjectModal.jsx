import { useAtomValue, useAtom } from "jotai";
import { useState, useEffect, useCallback, useMemo } from "react";
import { isProjectModalVisibleAtom, chosenProjectDataAtom} from "../store"

export default function ProjectModal() {
  const projectData = useAtomValue(chosenProjectDataAtom);
  const [isVisible, setIsVisible] = useAtom(isProjectModalVisibleAtom);
  const [lightboxIndex, setLightboxIndex] = useState(null); // number | null

  const images = projectData?.images || [];

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(() => {
    if (!images.length || lightboxIndex === null) return;
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length, lightboxIndex]);
  const showNext = useCallback(() => {
    if (!images.length || lightboxIndex === null) return;
    setLightboxIndex((i) => (i + 1) % images.length);
  }, [images.length, lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  // ---- Parse description into structured blocks (headings + bullets) ----
  const parsedDescriptionBlocks = useMemo(() => {
    const desc = projectData?.description || "";
    if (!desc) return [];
    const lines = desc.split(/\n/);
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
      let line = lines[i].trim();
      if (line === "") { i++; continue; }
      const next = lines[i+1]?.trim();
      const isBullet = line.startsWith("• ");
      if (!isBullet) {
        if (next && next.startsWith("• ")) {
          const heading = line;
          const items = [];
          i++;
          while (i < lines.length && lines[i].trim().startsWith("• ")) {
            items.push(lines[i].trim().replace(/^•\s+/, ""));
            i++;
          }
            blocks.push({ type: 'section', heading, items });
          continue;
        } else {
          const paragraphLines = [line];
          i++;
          while (i < lines.length && lines[i].trim() !== '' && !lines[i].trim().startsWith('• ')) {
            paragraphLines.push(lines[i].trim());
            i++;
          }
          blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
          continue;
        }
      } else {
        const items = [];
        while (i < lines.length && lines[i].trim().startsWith("• ")) {
          items.push(lines[i].trim().replace(/^•\s+/, ""));
          i++;
        }
        blocks.push({ type: 'list', items });
        continue;
      }
    }
    return blocks;
  }, [projectData?.description]);

  return (
    isVisible && (
      <>
      <div className="modal">
        <div className="modal-content modal--project">
          <h1>{projectData.title}</h1>
          <div className={"modal-body" + (projectData.layout === 'side' ? ' modal-body--side' : '')}>
            <div className={projectData.layout === 'side' ? 'modal-text-block' : ''}>
              <div className="modal-description">
                {parsedDescriptionBlocks.map((b, idx) => {
                  if (b.type === 'paragraph') return <p key={idx} className="modal-paragraph">{b.text}</p>;
                  if (b.type === 'section') return (
                    <div key={idx} className="modal-section-block">
                      <h2 className="modal-subheading">{b.heading}</h2>
                      <ul className="modal-bullets">
                        {b.items.map((it, j) => <li key={j}>{it}</li>)}
                      </ul>
                    </div>
                  );
                  if (b.type === 'list') return (
                    <ul key={idx} className="modal-bullets">
                      {b.items.map((it, j) => <li key={j}>{it}</li>)}
                    </ul>
                  );
                  return null;
                })}
              </div>
            </div>
            <div className={"modal-gallery" + (projectData.layout === 'side' ? ' modal-gallery--side' : '')}>
              {images.map((img, i) => (
                <figure className={"modal-figure" + (projectData.layout === 'side' ? ' modal-figure--side' : '')} key={i}>
                  <img
                    className={"modal-image" + (projectData.layout === 'side' ? ' modal-image--large' : '')}
                    src={img.src}
                    alt={img.alt || projectData.title}
                    loading="lazy"
                    onClick={() => setLightboxIndex(i)}
                    style={{ cursor: "zoom-in" }}
                  />
                  {img.alt && <figcaption className="modal-caption">{img.alt}</figcaption>}
                </figure>
              ))}
            </div>
          </div>

          <div className="modal-btn-container--project">
            {projectData.links && projectData.links.length > 0 && projectData.links.map((linkData) => (
              <button
                key={linkData.id}
                className={"modal-btn"}
                onClick={() => {
                  window.open(linkData.link, "_blank");
                }}
              >
                {linkData.name}
              </button>
            ))}
            <button
              className={"modal-btn modal-btn--close"}
              onClick={() => {
                setIsVisible(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div className="lightbox-backdrop" onClick={closeLightbox}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-nav lightbox-nav--prev"
              onClick={showPrev}
              aria-label="Previous image"
            >
              ‹
            </button>
            <img
              className="lightbox-image"
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt || projectData.title}
            />
            <button
              className="lightbox-nav lightbox-nav--next"
              onClick={showNext}
              aria-label="Next image"
            >
              ›
            </button>
            <button
              className="lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="lightbox-counter">{lightboxIndex + 1} / {images.length}</div>
          </div>
        </div>
      )}
      </>
    )
  );
}