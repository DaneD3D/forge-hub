import { getBungieNetUserById } from "bungie-api-ts/user";
import { httpClient } from "../../utils/httpClient";

export async function fetchBungieNetUserById(membershipId: string) {
  try {
    const response = await getBungieNetUserById(httpClient, { id: membershipId });
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