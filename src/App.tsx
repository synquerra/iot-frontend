import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { UserContextProvider } from './contexts/UserContext';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <UserContextProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </UserContextProvider>
  );
}

export default App
