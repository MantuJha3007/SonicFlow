import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PlayerProvider } from '@/context/PlayerContext';
import GoogleProvider from '@/components/GoogleProvider';

export const metadata = {
  title: 'SonicFlow - Premium Music Streaming & Studio',
  description: 'A premium music streaming platform and artist publishing studio.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleProvider>
          <AuthProvider>
            <PlayerProvider>
              {children}
            </PlayerProvider>
          </AuthProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
