import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { SessionProvider } from './auth/SessionContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><SessionProvider><ProtectedRoute><App/></ProtectedRoute></SessionProvider></React.StrictMode>);
