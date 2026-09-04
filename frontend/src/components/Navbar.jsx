import React from 'react';

function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      backgroundColor: '#1e1e2f',
      color: '#fff',
      marginBottom: '24px'
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>🎵 Music App</div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <a href="#home" style={{ color: '#fff', textDecoration: 'none' }}>Trang chủ</a>
        <a href="#playlist" style={{ color: '#fff', textDecoration: 'none' }}>Playlist</a>
      </div>
    </nav>
  );
}

export default Navbar;