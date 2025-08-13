import { onMount } from "solid-js";
import { BungieTokenResponse, useAuth, User } from "./AuthContext";

function OAuthCallback() {
  const auth = useAuth();

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    const storedState = localStorage.getItem('bungie_oauth_state');
    
    // Validate the state to prevent CSRF attacks
    if (state !== storedState) {
      console.error("State mismatch. Possible CSRF attack.");
      // Handle error, e.g., redirect to login
      return;
    }
    
    if (code) {
      //
      // IMPORTANT: The token exchange MUST be done on a secure server.
      // We are mocking this for demonstration purposes.
      //
      console.log('Authorization code received:', code);
      console.log('Simulating token exchange with a backend server...');

      try {
        const tokenResponse: BungieTokenResponse = await mockTokenExchange(code);
        
        // After getting the tokens, you can fetch user profile data if needed
        // For simplicity, we'll just use the membership_id from the token response
        const userProfile: User = {
          id: tokenResponse.membership_id,
          username: "Guardian-" + tokenResponse.membership_id.substring(0, 4), // Mocked username
          bungieMembershipId: tokenResponse.membership_id
        };

        // Store the user and tokens in our global state
        auth.login(userProfile, tokenResponse);
        
        // Redirect the user to a protected page
        window.location.href = "/profile";
        
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
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return a mocked token response
  return {
    access_token: "mock_access_token_" + code,
    refresh_token: "mock_refresh_token_" + code,
    expires_in: 3600,
    membership_id: "123456789",
    refresh_expires_in: 86400,
  };
}
