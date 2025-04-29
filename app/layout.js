import "./main.css";
import ScrollToTop from "../components/ScrollToTop";


export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className='dark'
      >
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}

