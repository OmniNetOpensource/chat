import { ThemeProvider } from 'next-themes';
import './globals.css';
import { AuthProvider } from './components/Auth/AuthProvider';
import { ResponsiveProvider } from './components/Responsive/ResponsiveProvider';
import { auth } from '@/auth';


export const metadata = {
  title: 'AI studio',
  description: 'A modern chat application built with Next.js',
  icons: {
    icon: '/chat.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full w-full flex flex-col">
        <AuthProvider session={session}>
          <ThemeProvider 
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ResponsiveProvider>
              {children}
            </ResponsiveProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
