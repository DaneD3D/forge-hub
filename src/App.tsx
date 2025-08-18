import { Router, Route, RouteSectionProps } from '@solidjs/router';
import Login from './hooks/Login.tsx';
import OAuthCallback from './hooks/OAuthCallback.tsx';
import ProtectedPage from './pages/ProtectedPage.tsx';
import NavBar from './components/navBar.tsx';
import ApiTest from './pages/ApiTest.tsx';

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
