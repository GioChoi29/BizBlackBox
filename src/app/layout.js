import './globals.css'

export const metadata = {
  title: 'BBB Portal',
  description: 'BBB Portal Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Fraunces:opsz,ital,wght@9..144,0,400;9..144,0,600;9..144,0,700;9..144,1,400;9..144,1,600;9..144,1,700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
