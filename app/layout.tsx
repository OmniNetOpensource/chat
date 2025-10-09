import { ThemeProvider } from 'next-themes';
import './globals.css';
import { ResponsiveProvider } from './components/Responsive/ResponsiveProvider';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'AI studio',
  description: 'A modern chat application built with Next.js',
  icons: {
    icon: '/chat.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          <ResponsiveProvider>
            <div className="flex h-screen w-screen flex-row items-stretch">
              <Sidebar />
              {children}
            </div>
          </ResponsiveProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
