import type { Component } from 'solid-js';
import { Router, Route, RouteSectionProps } from '@solidjs/router';
import Login from './hooks/Login';
import OAuthCallback from './hooks/OAuthCallback';
import ProtectedPage from './pages/ProtectedPage';

function App() {
  return (
    <div class="bg-gray-900 min-h-screen font-sans">
      <Router>
        <Route path="/" component={Login} />
        <Route path="/oauth-callback" component={OAuthCallback} />
        <Route path="/profile" component={ProtectedPage} />
      </Router>
    </div>
  );
}

export default App;
