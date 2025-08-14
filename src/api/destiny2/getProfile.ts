import { HttpClient } from "bungie-api-ts/http";
import { getProfile } from "bungie-api-ts/destiny2";

export async function fetchProfile(
  http: HttpClient,
  membershipId: string,
  membershipType: number
) {
  try {
    const response = await getProfile(http, {
      destinyMembershipId: membershipId,
      membershipType: membershipType,
      components: [
        100, // Profiles
        200, // Characters
        201, // CharacterInventories
      ],
    });

    if (response.ErrorCode === 1) {
      return response.Response;
    } else {
      console.error("Error fetching profile:", response.Message);
      return null;
    }
  } catch (error) {
    console.error("Network or other error:", error);
    return null;
  }
}