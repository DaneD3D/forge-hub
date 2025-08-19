function Login() {
  const AUTH_URL = import.meta.env.VITE_AUTH_URL;
  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

  const handleLogin = () => {
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('bungie_oauth_state', state);
    const url = `${AUTH_URL}?client_id=${CLIENT_ID}&response_type=code&state=${state}&redirect_uri=${REDIRECT_URI}`;
    globalThis.location.href = url;
  };

  return (
    <div class="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div class="bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-sm w-full">
        <h1 class="text-3xl font-extrabold mb-4 text-orange-400">Bungie App</h1>
        <p class="mb-6 text-gray-400">
          Sign in to access your Destiny 2 information.
        </p>
        <button
          type="button"
          onClick={handleLogin}
          class="w-full py-3 px-6 rounded-md font-semibold text-lg bg-orange-600 hover:bg-orange-700 transition-colors duration-200 ease-in-out shadow-lg"
        >
          Authenticate with Bungie
        </button>
      </div>
    </div>
  );
}

export default Login;
