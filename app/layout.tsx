import { ThemeProvider } from 'next-themes';
import './globals.css';
import { ResponsiveProvider } from './components/Responsive/ResponsiveProvider';
import ImageViewer from './components/ImageViewer/ImageViewer';


export const metadata = {
  title: 'AI studio',
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
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full"
    >
      <body className="h-full w-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ResponsiveProvider>{children}</ResponsiveProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
