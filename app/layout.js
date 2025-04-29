import "./main.css";
import ScrollToTop from "../components/ScrollToTop";
import Head from 'next/head'


export default function RootLayout({ children }) {

  return (
    <html lang="tr">
          {/* Meta etiketlerini ve viewport ayarlarını doğrudan buraya ekleyebilirsiniz */}
          <meta name="description" content="Best PWA app in the world!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          
          {/* Apple Web App */}
          <meta name="apple-mobile-web-app-title" content="My Awesome PWA App" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          
          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content="My Awesome PWA App" />
          <meta property="og:description" content="Best PWA app in the world!" />
          <meta property="og:site_name" content="PWA App" />
          
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="My Awesome PWA App" />
          <meta name="twitter:description" content="Best PWA app in the world!" />
          
          {/* Theme color */}
          <meta name="theme-color" content="#FFFFFF" />
          
          {/* Web App Manifest */}
          <link rel="manifest" href="/manifest.json" />
      <body
        className='dark'
      >
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}

