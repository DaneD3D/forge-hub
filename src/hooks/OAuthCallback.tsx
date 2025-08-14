import { onMount } from "solid-js";
import { BungieTokenResponse, useAuth, User } from "./AuthContext";
import { useNavigate } from "@solidjs/router";

async function exchangeAuthorizationCode(code: string, state: string): Promise<BungieTokenResponse> {
  const payload = {
    code,
    state,
  };

  const response = await fetch("https://68tctxxzd8.execute-api.us-east-1.amazonaws.com/default/BungieOAuthHandoff", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Better error message to help with debugging
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(`Failed to exchange token: ${response.statusText}. Detail: ${JSON.stringify(errorBody)}`);
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
        // Pass both code and state to the exchange function
        const tokenResponse: BungieTokenResponse = await exchangeAuthorizationCode(code, state);

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
