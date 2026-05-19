import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { AdminModeProvider } from '@/features/admin-mode/AdminModeContext';
import App from '@/App';

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AdminModeProvider>
        <App />
      </AdminModeProvider>
    </StrictMode>
  );
}
