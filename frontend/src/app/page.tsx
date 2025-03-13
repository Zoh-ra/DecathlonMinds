'use client';

import Link from 'next/link';
import Image from 'next/image';
import '../styles/pillButton.css';

export default function LaunchPage() {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        background: 'linear-gradient(180deg, #3643BA 8%, #3643BA 36%, #3643BA 66.5%, #989FDC 97.5%)',
        fontFamily: 'Arial, sans-serif',
        color: 'white',
        textAlign: 'center'
      }}
    >
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <img 
          src="/images/logo/DecathlonMindsLogo.png" 
          alt="Décathlon Minds Logo" 
          width="250" 
          height="100" 
          style={{ objectFit: 'contain' }} 
        />
      </div>
      
      <p style={{ 
        marginBottom: '60px', 
        textAlign: 'center', 
        maxWidth: '300px',
        fontSize: '18px',
        lineHeight: '1.5'
      }}>
        Être utile aux gens par le mouvement, parce-que nous sommes concernés par la santé mentale.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '320px' }}>
        <Link 
          href="/today" 
          style={{
            backgroundColor: '#F5603D',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '40px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '18px',
            display: 'block',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          Lancez vous !
        </Link>
        
        <Link 
          href="/today" 
          className="pillButton"
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            border: '2px solid #F5603D'
          }}
        >
          Continuer
        </Link>
      </div>
    </div>
  );
}
