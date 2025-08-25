import { Show } from 'solid-js';
import { useAuth } from '../hooks/AuthContext';
import { getProfile, GetProfileParams } from 'bungie-api-ts/destiny2';
import { initDatabase } from '../hooks/ManifestDatabase';

function ApiTest() {
  const auth = useAuth();
  const user = auth.user();
  const membershipId = user?.destiny_membership_id;
  const membershipType = user?.destiny_membership_type;

  const GetProfileParams: GetProfileParams = {
    destinyMembershipId: membershipId,
    membershipType: membershipType,
    components: [100, 200, 201, 202, 205, 300, 301, 302, 304, 305, 306],
  };

  return (
    <div class="text-white p-8">
      <h1 class="text-2xl font-bold mb-4">API Test Page</h1>
      <p class="mb-4">This is a test page for API calls.</p>
      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-2">User Information</h2>
        <p>
          <strong>Membership ID:</strong> {membershipId}
        </p>
        <p>
          <strong>Membership Type:</strong> {membershipType}
        </p>
      </div>

      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-2">Authentication Status</h2>
        <p>
          <strong>Authenticated:</strong>{' '}
          {auth.isAuthenticated() ? 'Yes' : 'No'}
        </p>
        <Show when={auth.isAuthenticated()}>
          <p>
            <strong>Bungie Membership ID:</strong>{' '}
            {user?.bungie_membership_id || 'N/A'}
          </p>
        </Show>
        <Show when={!auth.isAuthenticated()}>
          <p class="text-red-500">You are not authenticated. Please log in.</p>
        </Show>

        <button
          class="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          type="button"
          onClick={async () => {
            if (membershipId && membershipType) {
              try {
                const result = await getProfile(
                  auth.httpClient(),
                  GetProfileParams,
                );
                console.log('getProfile result:', result);
              } catch (err) {
                console.error('getProfile error:', err);
              }
            } else {
              console.warn('Missing membershipId or membershipType');
            }
          }}
        >
          Test Destiny2 getProfile API Call
        </button>
        <button
          class="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          type="button"
          onClick={async () => {
            try {
              await initDatabase(auth.httpClient());
              console.log('Database initialized with manifest data');
            } catch (err) {
              console.error('Error initializing database:', err);
            }
          }}
        >
          Initialize Database with Manifest Data
        </button>
      </div>
    </div>
  );
}
export default ApiTest;
