import { createResource, Show } from "solid-js";
import { useAuth } from "../hooks/AuthContext";
import { fetchBungieNetUserById } from "../api/user/bungieNetUser";
import { fetchProfile } from "../api/destiny2/getProfile";

function ApiTest() {
  const auth = useAuth();
  const user = auth.user();
  const tokens = auth.tokens();
  const membershipId = user?.bungieMembershipId || "";
  const membershipType = "1"; // You may want to get this from user data if available
  const apiKey = import.meta.env.VITE_BUNGIE_API_KEY;

  const [userData, { refetch }] = createResource(() =>
    fetchBungieNetUserById(membershipId)
  );

  const [profileData, { refetch: refetchProfile }] = createResource(() =>
    fetchProfile(
      auth.httpClient(),
      membershipId,
      Number(membershipType)
    )
  );

  return (
    <div class="text-white p-8">
      <h1 class="text-2xl font-bold mb-4">API Test Page</h1>
      <p class="mb-4">This is a test page for API calls.</p>
      <button
        class="py-2 px-4 rounded-md font-semibold bg-gray-700 hover:bg-gray-600 transition-colors"
        onClick={() => refetch()}
      >
        Test Bungie User Net ID API Call
      </button>
      <Show when={userData.loading}>
        <p>Loading...</p>
      </Show>
      <Show when={userData.error}>
        <p class="text-red-500">Error: {userData.error.message}</p>
      </Show>
      <Show when={userData()}>
        {data => (
          <pre class="bg-gray-800 p-4 rounded mt-4 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </Show>
      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-2">User Information</h2>
        <p><strong>Membership ID:</strong> {membershipId}</p>
        <p><strong>Membership Type:</strong> {membershipType}</p>
        <p><strong>Access Token:</strong> {tokens?.access_token || "N/A"}</p>
        <p><strong>API Key:</strong> {apiKey}</p>
        <p><strong>User Data:</strong> {JSON.stringify(userData(), null, 2) || "N/A"}</p>
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

      <button
        class="py-2 px-4 rounded-md font-semibold bg-blue-700 hover:bg-blue-600 transition-colors ml-4"
        onClick={() => refetchProfile()}
      >
        Test Destiny2 getProfile API Call
      </button>
      <Show when={profileData.loading}>
        <p>Loading profile...</p>
      </Show>
      <Show when={profileData.error}>
        <p class="text-red-500">Profile Error: {profileData.error.message}</p>
      </Show>
      <Show when={profileData()}>
        {data => (
          <pre class="bg-gray-800 p-4 rounded mt-4 overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </Show>
    </div>
  );
}
export default ApiTest;