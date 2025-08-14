import { createResource, Show } from "solid-js";
import { useAuth } from "../hooks/AuthContext";
import { fetchProfile } from "../api/destiny2/getProfile";

function ApiTest() {
  const auth = useAuth();
  const user = auth.user();
  const tokens = auth.tokens();
  const membershipId = user?.bungieMembershipId;
  const membershipType = user?.bungieMembershipType;

  return (
    <div class="text-white p-8">
      <h1 class="text-2xl font-bold mb-4">API Test Page</h1>
      <p class="mb-4">This is a test page for API calls.</p>
      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-2">User Information</h2>
        <p><strong>Membership ID:</strong> {membershipId}</p>
        <p><strong>Membership Type:</strong> {membershipType}</p>
      </div>

      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-2">Authentication Status</h2>
        <p><strong>Authenticated:</strong> {auth.isAuthenticated() ? "Yes" : "No"}</p>
        <Show when={auth.isAuthenticated()}>
          <p><strong>User ID:</strong> {user?.id || "N/A"}</p>
          <p><strong>Bungie Membership ID:</strong> {user?.bungieMembershipId || "N/A"}</p>
        </Show>
        <Show when={!auth.isAuthenticated()}>
          <p class="text-red-500">You are not authenticated. Please log in.</p>
        </Show>
      </div>
    </div>
  );
}
export default ApiTest;