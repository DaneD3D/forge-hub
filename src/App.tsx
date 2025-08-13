import { Router, Route, RouteSectionProps } from '@solidjs/router';
import Login from './hooks/Login';
import OAuthCallback from './hooks/OAuthCallback';
import ProtectedPage from './pages/ProtectedPage';
import NavBar from './components/navBar';
import ApiTest from './pages/ApiTest';

function App() {
  return (
    <div class="bg-gray-900 min-h-screen font-sans">
      <NavBar />
      <Router>
        <Route path="/" component={Login} />
        <Route path="/oauth-callback" component={OAuthCallback} />
        <Route path="/profile" component={ProtectedPage} />
        <Route path="/apiTest" component={ApiTest} />
      </Router>
    </div>
  );
}

export default App;
