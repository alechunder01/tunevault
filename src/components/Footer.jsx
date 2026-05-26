function Footer() {
    return (
        <>
            <div 
            className="glass-tile"
            style={{    
                zIndex: 100,
                margin: '2.5vh 2.5vw',
                padding: '12px 24px',
                borderRadius: '16px',
                width: '95vw',
                height: '20vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                backgroundColor: 'rgba(105, 105, 105, 0.16)'
            }}>
                <span style={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '2rem',
                    letterSpacing: '-0.3px',
                    flexShrink: 0,
                }}>
                    Tune Vault
                </span>
                <span style={{
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    letterSpacing: '-0.3px',
                    flexShrink: 0,
                }}>
                    made by Alex Nicolas
                </span>
                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    fontSize: '1.4rem'
                }}>
                    <a href="">About</a>
                    <a href="">Contact</a>
                    <a href="">GitHub</a>
                </div>
            </div>
            <div style={{
                width: '100vw',
                height: '2.5vh'
            }}>

            </div>
        </>
    )
}

export default Footer;