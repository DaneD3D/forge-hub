import { createResource, Show } from "solid-js";
import { useAuth } from "../hooks/AuthContext";
import { fetchBungieNetUser } from "../api/user";

function ApiTest() {
  const auth = useAuth();
  const user = auth.user();
  const tokens = auth.tokens();
  const membershipId = user?.bungieMembershipId || "";
  const membershipType = "1"; // You may want to get this from user data if available
  const apiKey = import.meta.env.VITE_BUNGIE_API_KEY;

  const [userData, { refetch }] = createResource(() =>
    fetchBungieNetUser(membershipId)
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
    </div>
  );
}
export default ApiTest;