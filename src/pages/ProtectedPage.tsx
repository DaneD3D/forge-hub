import { Show } from "solid-js";
import { useAuth } from "../hooks/AuthContext.tsx";

function ProtectedPage() {
  const auth = useAuth();
  
  // Use a Show component to conditionally render content based on authentication status
  return (
    <Show
      when={auth.isAuthenticated()}
      fallback={
        <div class="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          <p class="text-xl">You are not logged in. <a href="/">Go to login</a></p>
        </div>
      }
    >
      <div class="min-h-screen bg-gray-900 text-white p-8">
        <div class="container mx-auto">
          <h1 class="text-4xl font-extrabold text-orange-400 mb-4">Welcome, Guardian!</h1>
          <p class="text-xl text-gray-300 mb-6">
            Your Bungie Global Display Name is: 
            <span class="font-mono bg-gray-800 text-orange-400 px-2 py-1 rounded-md ml-2">
              {auth.user()?.bungie_global_display_name}
            </span>
          </p>
          <button
            type="button"
            onClick={() => auth.logout()}
            class="py-2 px-4 rounded-md font-semibold bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </Show>
  );
}

export default ProtectedPage;