import { useState } from 'react';

const Navbar = ({ 
  onSearch, 
  onFilterArtist, 
  onFilterGenre, 
  onSortChange,
  artists, 
  genres, 
  activeArtist, 
  activeGenre,
  sortBy 
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <nav
      className="glass-tile"
      style={{
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        margin: '16px 24px',
        padding: '12px 24px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Title */}
      <span style={{
        color: '#fff',
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '-0.3px',
        flexShrink: 0,
      }}>
        Tune Vault
      </span>

      <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
        {/* Artist dropdown */}
        <select
          value={activeArtist ?? ''}
          onChange={e => onFilterArtist(e.target.value || null)}
          style={dropdownStyle}
        >
          <option value="">All Artists</option>
          {artists.map(artist => (
            <option key={artist} value={artist}>{artist}</option>
          ))}
        </select>

        {/* Genre dropdown */}
        <select
          value={activeGenre ?? ''}
          onChange={e => onFilterGenre(e.target.value || null)}
          style={dropdownStyle}
        >
          <option value="">All Genres</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value)}
          style={dropdownStyle}
        >
          <option value="album-az">Album Name (A-Z)</option>
          <option value="album-za">Album Name (Z-A)</option>
          <option value="artist-az">Artist Name (A-Z)</option>
          <option value="artist-za">Artist Name (Z-A)</option>
          <option value="date-oldest">Release Date (Oldest - Newest)</option>
          <option value="date-newest">Release Date (Newest - Oldest)</option>
        </select>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search albums..."
        value={query}
        onChange={handleSearch}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50px',
          padding: '7px 16px',
          color: '#fff',
          fontSize: '0.85rem',
          outline: 'none',
          backdropFilter: 'blur(8px)',
          width: '180px',
          flexShrink: 0,
        }}
      />
    </nav>
  );
};

const dropdownStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '50px',
  padding: '7px 16px',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  backdropFilter: 'blur(8px)',
  cursor: 'pointer',
  appearance: 'none',
  paddingRight: '32px',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
};

export default Navbar;