import { onMount } from "solid-js";
import { useAuth } from "./AuthContext";
import { useNavigate } from "@solidjs/router";

function OAuthCallback() {
  const auth = useAuth();
  const navigate = useNavigate();

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    const storedState = localStorage.getItem('bungie_oauth_state');
    
    // Always validate the state to prevent CSRF attacks
    if (state !== storedState) {
      console.error("State mismatch. Possible CSRF attack.");
      return;
    }
    
    // Now check that both code and state exist before proceeding
    if (code && state) {
      try {
        await auth.exchangeAuthorizationCodeAndLogin(code, state);
        navigate("/profile");
      } catch (error) {
        console.error("Token exchange failed:", error);
      }
    }
  });

  // A simple loading screen while we handle the redirect
  return (
    <div class="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div class="text-center">
        <p class="text-2xl font-bold text-orange-400">Authenticating...</p>
      </div>
    </div>
  );
}

export default OAuthCallback;
