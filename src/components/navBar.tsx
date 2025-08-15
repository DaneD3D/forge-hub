import { useAuth } from "../hooks/AuthContext.tsx";

function NavBar() {
    const auth = useAuth();
    return (
        <nav class="bg-gray-800 p-4">
            <div class="container mx-auto flex justify-between items-center">
                <a href="/" class="text-white text-lg font-bold">Bungie App</a>
                <div class="flex items-center gap-4">
                    <a href="/" class="text-gray-300 hover:text-white px-3 py-2">Home</a>
                    <a href="/profile" class="text-gray-300 hover:text-white px-3 py-2">Profile</a>
                    {auth.isAuthenticated() ? (
                        <span class="text-green-400 font-semibold px-3 py-2">Authenticated as {auth.user()?.bungie_global_display_name}</span>
                    ) : (
                        <span class="text-red-400 font-semibold px-3 py-2">Not Authenticated</span>
                    )}
                    <a href="/apiTest" class="text-gray-300 hover:text-white px-3 py-2">API Test</a>
                    <a href="/" onClick={() => auth.logout()} class="text-gray-300 hover:text-white px-3 py-2">Logout</a>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
