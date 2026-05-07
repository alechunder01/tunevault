import React from 'react';
import { albums } from './data/data.js';
import AlbumTile from './components/AlbumTile.jsx';

function App() {
  const albumList = Object.values(albums);

  return (
    <div className="container mt-5">
      <div className="row">
        {albumList.map((album) => (
          <AlbumTile key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}

export default App;