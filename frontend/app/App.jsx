import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ToastSystem } from './components/toasts/ToastSystem';
import { AppProvider } from './store/AppContext';
import { ToastProvider } from './store/ToastContext';
import { ErrorBoundary } from './ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <RouterProvider router={router} />
          <ToastSystem />
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
