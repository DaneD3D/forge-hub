import { createContext, createSignal, useContext, onMount, Accessor, JSX } from 'solid-js';
import { httpClient } from '../utils/httpClient.ts';

export interface User {
  bungie_membership_id: string;
  destiny_membership_id: string;
  destiny_membership_type: number;
  bungie_global_display_name?: string;
  bungie_global_display_name_code?: number;
  applicable_membership_types?: number[];
}

export interface BungieTokenResponse {
  token: string;
  expires_in: number;
  bungie_membership_id: string;
  membership_type: number;
  token_type: string;
  refresh_expires_in?: number;
}

export interface AuthContextType {
  user: Accessor<User | null>;
  tokens: Accessor<BungieTokenResponse | null>;
  isAuthenticated: Accessor<boolean>;
  login: (userData: User, tokens: BungieTokenResponse) => void;
  logout: () => void;
  exchangeAuthorizationCode: (code: string, state: string) => Promise<BungieTokenResponse>;
  exchangeAuthorizationCodeAndLogin: (code: string, state: string) => Promise<void>;
  httpClient: () => typeof httpClient;
}

const AuthContext = createContext<AuthContextType>();

export const AuthProvider = (props: { children: JSX.Element }) => {
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


    // Moved from OAuthCallback.tsx
    const exchangeAuthorizationCode = async (code: string, state: string): Promise<BungieTokenResponse> => {
        const payload = { code, state };
        const response = await fetch("https://68tctxxzd8.execute-api.us-east-1.amazonaws.com/default/BungieOAuthHandoff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`Failed to exchange token: ${response.statusText}. Detail: ${JSON.stringify(errorBody)}`);
        }
        const data = await response.json();
        return {
            token: data.access_token,
            expires_in: data.expires_in,
            bungie_membership_id: data.membership_id,
            membership_type: data.membership_type,
            token_type: data.token_type,
            refresh_expires_in: data.refresh_expires_in,
        };
    };

    // New: handles both exchange and login
    const exchangeAuthorizationCodeAndLogin = async (code: string, state: string) => {
        const payload = { code, state };
        const response = await fetch("https://68tctxxzd8.execute-api.us-east-1.amazonaws.com/default/BungieOAuthHandoff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`Failed to exchange token: ${response.statusText}. Detail: ${JSON.stringify(errorBody)}`);
        }
        const data = await response.json();
        const profile = data.linkedProfiles?.profiles?.[0];
        if (!profile) throw new Error("No profile found in token response");
        const userProfile: User = {
            bungie_membership_id: data.membership_id,
            destiny_membership_id: profile.membershipId,
            destiny_membership_type: profile.membershipType,
            bungie_global_display_name: profile.bungieGlobalDisplayName,
            bungie_global_display_name_code: profile.bungieGlobalDisplayNameCode,
            applicable_membership_types: profile.applicableMembershipTypes,
        };
        const tokenResponse: BungieTokenResponse = {
            token: data.access_token,
            expires_in: data.expires_in,
            bungie_membership_id: data.membership_id,
            membership_type: data.membership_type,
            token_type: data.token_type,
            refresh_expires_in: data.refresh_expires_in,
        };
        login(userProfile, tokenResponse);
    };

    const value: AuthContextType = {
        user,
        tokens,
        isAuthenticated,
        login,
        logout,
        exchangeAuthorizationCode,
        exchangeAuthorizationCodeAndLogin,
        httpClient: () => httpClient
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
