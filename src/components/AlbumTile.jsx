// AlbumTile.jsx
import React, { useState } from 'react';

const AlbumTile = ({ album }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpened] = useState(false);

  return (
    <div className="col-6 col-md-6 col-lg-3 mb-4">
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        
        onMouseDown={() => {
            switch (isOpen) {
                case true:
                    setIsOpened(false);
                    break;
                case false:
                    setIsOpened(true);
                    break;
            }
        }}

        style={{ cursor: 'pointer' }}
      >
        <div 
          className="ratio ratio-1x1 rounded album-pane" 
          style={{
            backgroundImage: `url(${album.albumCover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
          }}
        ></div>

        <div 
            className="mt-2 text-center glass-tile text-white px-3 py-1"
            style={{ 
                transition: 'all 0.9s ease',
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateY(0)' : 'translateY(-5px)',
                width: 'fit-content', // Shrinks to text size
                margin: '0 auto',      // Centers the shrunk div
                borderRadius: '50px'  // Makes it rounded like the image
            }}
        >
            {album.name}
        </div>

        <div
            style={{
                position: 'fixed',
                top: '0', 
                left: '0',
                width: '100vw', 
                height: '100vh',
                display: isOpen ? 'flex' : 'none',
                zIndex: '2',
                backgroundColor: '#464646a5',
                backdropFilter: 'blur(10px)',
                justifyContent: 'center',
                alignItems: 'center',

            }}
        >
            <div
                className='glass-tile text-white p-5'
                style={{
                    width: '85vw',
                    maxWidth: '1200px',
                    height: '80vh',
                    display: 'flex',
                    gap: '3rem',
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}
            >
                {/* Left Side - Album Info + Tracklist */}
                <div style={{ flex: '1', overflowY: 'auto', paddingRight: '1rem' }}>
                    <h1 className="mb-2">{album.name}</h1>
                    <p className="mb-4" style={{color: '#000000'}}>
                        by {album.artist} | {album.releaseDate} | {album.songs.length} songs
                    </p>

                    <div className="container px-0">
                        <div className="row row-cols-1 row-cols-md-2 g-3">
                            {album.songs.map((song) => (
                                <div key={song.songId} className="col">
                                    <p className="mb-1 song-text">
                                        {song.songName}
                                        {song.songFeatures && (
                                            <span className="small ms-2" style={{color: '#000000'}}>feat. {song.songFeatures}</span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Album Cover */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0 
                }}>
                    <img 
                        src={album.albumCover} 
                        alt={`${album.name} album cover`} 
                        style={{ 
                            width: '320px', 
                            height: '320px',
                            objectFit: 'cover',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }} 
                        className='album-pane'
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumTile;