import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mon Espace Prof',
  description: 'Gestion pédagogique personnelle : classes, élèves, notes, devoirs et documents.'
}

const colorScript = `
try {
  const p = JSON.parse(localStorage.getItem('ep-preferences-v2') || '{}');
  document.documentElement.style.setProperty('--title-color', p.titleColor || '#102a56');
  document.documentElement.style.setProperty('--subtitle-color', p.subtitleColor || '#64748b');
} catch(e) {}
`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <style>{`:root{--title-color:#102a56;--subtitle-color:#64748b}.top h1,.welcome-title h1,.panel-heading h2,.settings-title h2,.header-brand strong{color:var(--title-color)!important}.top p,.welcome-title p,.settings-title p,.header-brand small{color:var(--subtitle-color)!important}`}</style>
        <script dangerouslySetInnerHTML={{__html:colorScript}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
