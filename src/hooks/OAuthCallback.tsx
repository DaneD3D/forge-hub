import { onMount } from "solid-js";
import { BungieTokenResponse, useAuth, User } from "./AuthContext";
import { useNavigate } from "@solidjs/router";

function OAuthCallback() {
  const auth = useAuth();
  const navigate = useNavigate();

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    const storedState = localStorage.getItem('bungie_oauth_state');
    
    // Validate the state to prevent CSRF attacks
    if (state !== storedState) {
      console.error("State mismatch. Possible CSRF attack.");
      return;
    }
    
    if (code) {
      try {
        const tokenResponse: BungieTokenResponse = await mockTokenExchange(code);

        // Store the user and tokens in our global state
        const userProfile: User = {
          id: tokenResponse.membership_id,
          bungieMembershipId: tokenResponse.membership_id,
        };
        auth.login(userProfile, tokenResponse);
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

async function mockTokenExchange(code: string): Promise<BungieTokenResponse> {
  // WARNING: This is insecure and for development only!
  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("client_id", CLIENT_ID);
  params.append("redirect_uri", REDIRECT_URI);

  const response = await fetch("https://www.bungie.net/Platform/App/OAuth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange token: " + response.statusText);
  }
  const data = await response.json();

  console.log("Token response data:", data);

  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
    membership_id: data.membership_id,
    token_type: data.token_type
  };
}
