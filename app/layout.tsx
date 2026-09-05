import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mon Espace Prof',
  description: 'Gestion pédagogique personnelle : classes, élèves, notes, devoirs et documents.'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
