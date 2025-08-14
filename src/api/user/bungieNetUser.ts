import { getBungieNetUserById } from "bungie-api-ts/user";
import { useAuth } from "../../hooks/AuthContext";

export async function fetchBungieNetUserById(membershipId: string) {
  const auth = useAuth();
  try {
    const response = await getBungieNetUserById(auth.httpClient(), { id: membershipId });
    if (response.ErrorCode === 1) {
      return response.Response;
    } else {
      console.error("Error fetching user:", response.Message);
      return null;
    }
  } catch (error) {
    console.error("Network or other error:", error);
    return null;
  }
}