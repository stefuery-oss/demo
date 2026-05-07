import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastProvider } from '@zendeskgarden/react-notifications';
import { ThemeProvider } from '@zendeskgarden/react-theming';
import '@zendeskgarden/css-bedrock/dist/index.css';
import './styles.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider zIndex={1}>
        <App />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
