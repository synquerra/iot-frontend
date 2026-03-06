import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { UserContextProvider } from './contexts/UserContext';

function App() {
  return <UserContextProvider><RouterProvider router={router} /></UserContextProvider>;
}

export default App
