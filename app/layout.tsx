import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata = {
  title: 'Chat Application',
  description: 'A modern chat application built with Next.js',
  icons: {
    icon: '/chat.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider 
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
