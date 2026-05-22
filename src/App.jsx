import React, { useState } from 'react';
import { albums } from './data/data.js';
import AlbumTile from './components/AlbumTile.jsx';
import Navbar from './components/Navbar.jsx';
import AnimatedGradient from './components/AnimatedGradient.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const [query, setQuery] = useState('');
  const [activeArtist, setActiveArtist] = useState(null);
  const [activeGenre, setActiveGenre] = useState(null);
  const [sortBy, setSortBy] = useState('album-az');

  const albumList = Object.values(albums);

  const artists = [...new Set(
    albumList.flatMap(a => a.artist.split('&').map(name => name.trim()))
  )].sort();

  const genres = [...new Set(
    albumList.flatMap(a => a.genre.split('/').map(g => g.trim()))
  )].sort();

  const filtered = albumList.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.artist.toLowerCase().includes(query.toLowerCase());
    const matchesArtist =
      activeArtist === null ||
      a.artist.split('&').map(n => n.trim()).includes(activeArtist);
    const matchesGenre =
      activeGenre === null ||
      a.genre.split('/').map(g => g.trim()).includes(activeGenre);
    return matchesSearch && matchesArtist && matchesGenre;
  });

  const sortedAndFiltered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'album-az':
        return a.name.localeCompare(b.name);
      case 'album-za':
        return b.name.localeCompare(a.name);
      case 'artist-az':
        return a.artist.localeCompare(b.artist);
      case 'artist-za':
        return b.artist.localeCompare(a.artist);
      case 'date-oldest':
        return new Date(a.releaseDate) - new Date(b.releaseDate);
      case 'date-newest':
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      default:
        return 0;
    }
  });

  return (
    <>
      <AnimatedGradient colors={['#33003c', '#2f001d', '#070f21', '#00072f']} />
      <Navbar
        onSearch={setQuery}
        onFilterArtist={setActiveArtist}
        onFilterGenre={setActiveGenre}
        onSortChange={setSortBy}
        artists={artists}
        genres={genres}
        activeArtist={activeArtist}
        activeGenre={activeGenre}
        sortBy={sortBy}
      />
      <div className="container mt-3">
        <div className="row">
          {sortedAndFiltered.map((album) => (
            <AlbumTile key={album.id} album={album} />
          ))}
        </div>
        {sortedAndFiltered.length === 0 && (
          <p className="text-white text-center mt-5" style={{ opacity: 0.5 }}>
            No albums found.
          </p>
        )}
      </div>
      <Footer/>
    </>
  );
}

export default App;