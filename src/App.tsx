import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { UserContextProvider } from './contexts/UserContext';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { GlobalLoadingProvider } from './contexts/GlobalLoadingContext';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <UserContextProvider>
        <GlobalLoadingProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </GlobalLoadingProvider>
      </UserContextProvider>
    </ThemeProvider>
  );
}

export default App
