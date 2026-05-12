// AlbumTile.jsx
import React, { useState, useEffect, useRef } from 'react';

const AlbumTile = ({ album }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // NEW: stores the dominant color extracted from the album cover.
  // Starts as null — the modal uses a neutral fallback until Color Thief runs.
  const [dominantColor, setDominantColor] = useState(null);

  const overlayRef = useRef(null);

  // NEW: ref attached to the <img> inside the modal so Color Thief can read its pixels.
  const imgRef = useRef(null);

  // NEW: Color Thief extraction function.
  // Called by the <img> onLoad event inside the modal.
  // Color Thief's getPalette() returns an array of [r, g, b] arrays.
  // We only need the first one (index 0) — that's the most dominant color.
  const extractColor = () => {
    try {
      const img = imgRef.current;
      if (!img || !img.complete) return; // safety check: image must be fully loaded

      const thief = new ColorThief();
      const [r, g, b] = thief.getColor(img); // returns a single [r, g, b] array

      setDominantColor({ r, g, b });
    } catch (err) {
      // Color Thief can fail if the image is cross-origin or not fully loaded.
      // We silently swallow the error and just keep the neutral fallback.
      console.warn('ColorThief failed:', err);
    }
  };

  // NEW: builds the modal card's background style based on dominantColor.
  // When dominantColor is null (not extracted yet), falls back to a neutral dark glass.
  // When extracted, layers two things:
  //   1. A low-opacity fill of the dominant color (the tint)
  //   2. A subtle radial glow of the same color in the top-left corner for depth
  const getModalBackground = () => {
    if (!dominantColor) {
      // Fallback: neutral dark glass, same as before
      return 'rgba(30, 20, 40, 0.45)';
    }
    const { r, g, b } = dominantColor;
    // The tint is intentionally low opacity (0.25) so the glass effect still shows through.
    // Too high and it looks like a solid color block — too low and you can't see the tint.
    return `rgba(${r}, ${g}, ${b}, 0.25)`;
  };

  // NEW: builds a matching box-shadow glow on the modal card using the dominant color.
  // This makes the card look like it's glowing from within with the album's color.
  const getModalGlow = () => {
    if (!dominantColor) return '0 16px 48px rgba(0,0,0,0.5)';
    const { r, g, b } = dominantColor;
    return `0 16px 48px rgba(${r}, ${g}, ${b}, 0.35), 0 0 80px rgba(${r}, ${g}, ${b}, 0.15)`;
  };

  const openModal = () => {
    setIsVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpen(true);
        setIsAnimatingIn(true);
      });
    });
  };

  const closeModal = () => {
    setIsAnimatingIn(false);
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
      setIsVisible(false);
      setDominantColor(null); // NEW: reset the color when modal closes so it doesn't bleed into next open
    }, 420);
  };

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) closeModal();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* ── Tile ── */}
      <div className="col-6 col-md-6 col-lg-3 mb-4">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={openModal}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="ratio ratio-1x1 rounded album-pane"
            style={{
              backgroundImage: `url(${album.albumCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease',
              transform: isHovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0px) scale(1)',
              boxShadow: isHovered
                ? '0 20px 40px rgba(0,0,0,0.45)'
                : '0 4px 12px rgba(0,0,0,0.2)',
            }}
          />

          <div
            className="mt-2 text-center glass-tile text-white px-3 py-1"
            style={{
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0)' : 'translateY(-5px)',
              width: 'fit-content',
              margin: '0 auto',
              borderRadius: '50px',
              pointerEvents: 'none',
            }}
          >
            {album.name}
          </div>
        </div>
      </div>

      {/* ── Modal overlay ── */}
      {isVisible && (
        <div
          ref={overlayRef}
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isAnimatingIn ? 'rgba(30,20,40,0.65)' : 'rgba(30,20,40,0)',
            backdropFilter: isAnimatingIn ? 'blur(14px)' : 'blur(0px)',
            transition: 'background-color 0.42s ease, backdrop-filter 0.42s ease',
          }}
        >
          {/* ── Modal card ──
              NEW: background and boxShadow are now driven by getModalBackground() and getModalGlow().
              The background transitions smoothly because dominantColor updates via setState,
              which triggers a re-render — and the CSS transition on the div picks it up.
              We added 'background 1.2s ease' to the transition so the tint fades in
              gracefully after Color Thief finishes extracting, rather than snapping. */}
          <div
            className="glass-tile text-white p-5"
            style={{
              width: '88vw',
              maxWidth: '1200px',
              height: '80vh',
              display: 'flex',
              gap: '3rem',
              borderRadius: '20px',
              overflow: 'hidden',
              opacity: isAnimatingIn ? 1 : 0,
              transform: isAnimatingIn ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(24px)',
              // NEW: added 'background 1.2s ease, box-shadow 1.2s ease' so the color tint
              // fades in smoothly after extraction instead of popping in instantly
              transition: 'opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1), transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), background 1.2s ease, box-shadow 1.2s ease',
              background: getModalBackground(), // NEW: tinted glass background
              boxShadow: getModalGlow(),         // NEW: colored glow around the card
            }}
          >
            {/* ── Left: info + tracklist ── */}
            <div style={{ flex: '1', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <h1 className="mb-1" style={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                {album.name}
              </h1>
              <p className="mb-1" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem' }}>
                {album.artist} &nbsp;·&nbsp; {album.releaseDate} &nbsp;·&nbsp; {album.genre}
              </p>
              <p className="mb-4" style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.85rem' }}>
                {album.songs.length} tracks
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {album.songs.map((song, index) => (
                  <div
                    key={song.songId}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr auto',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      transition: 'background 0.18s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      color: 'rgba(255,255,255,0.35)',
                      fontSize: '0.8rem',
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {index + 1}
                    </span>

                    <div style={{ minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.92rem',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}>
                        {song.songName}
                      </span>
                      {song.songFeatures && (
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.42)' }}>
                          feat. {song.songFeatures}
                        </span>
                      )}
                    </div>

                    <span style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.8rem',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '0.03em',
                      flexShrink: 0,
                    }}>
                      {song.songLength}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: cover + close button ── */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              flexShrink: 0,
            }}>
              {/* NEW: crossOrigin="anonymous" is REQUIRED for Color Thief to read pixel data.
                  Without it the browser throws a CORS security error when Color Thief
                  tries to call canvas.getImageData() on the image.
                  onLoad={extractColor} fires once the image is fully loaded and ready,
                  which is the earliest safe moment to run Color Thief on it. */}
              <img
                ref={imgRef}
                src={album.albumCover}
                alt={`${album.name} cover`}
                crossOrigin="anonymous"
                onLoad={extractColor}
                style={{
                  width: '300px',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '14px',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                }}
                className="album-pane"
              />

              <button
                onClick={closeModal}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#fff',
                  borderRadius: '50px',
                  padding: '8px 28px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.2s ease, transform 0.2s ease',
                  letterSpacing: '0.05em',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'scale(1.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlbumTile;
