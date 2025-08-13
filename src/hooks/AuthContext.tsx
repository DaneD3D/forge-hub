import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { createContext, createSignal, useContext, onMount, Accessor, Show, JSXElement } from 'solid-js';
import { createStore } from 'solid-js/store';

export interface User {
  id: string;
}

export interface BungieTokenResponse {
  access_token: string;
  expires_in: number;
  membership_id: string;
  token_type: string;
}

interface AuthContextType {
  user: Accessor<User | null>;
  tokens: Accessor<BungieTokenResponse | null>;
  isAuthenticated: Accessor<boolean>;
  login: (userData: User, tokens: BungieTokenResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>();

export const AuthProvider = (props: { children: any }) => {
    const [user, setUser] = createSignal<User | null>(null);
    const [tokens, setTokens] = createSignal<BungieTokenResponse | null>(null);

    const isAuthenticated = () => !!user();

    onMount(() => {
        const storedUser = localStorage.getItem("user");
        const storedTokens = localStorage.getItem("tokens");
        if (storedUser && storedTokens) {
            setUser(JSON.parse(storedUser));
            setTokens(JSON.parse(storedTokens));
        }
    });

    const login = (user: User, tokens: BungieTokenResponse) => {
        setUser(user);
        setTokens(tokens);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("tokens", JSON.stringify(tokens));
    };

    const logout = () => {
        setUser(null);
        setTokens(null);
        localStorage.removeItem("user");
        localStorage.removeItem("tokens");
    };

    const value: AuthContextType = {
        user,
        tokens,
        isAuthenticated,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
