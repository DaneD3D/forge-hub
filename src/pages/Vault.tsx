import { get } from "bungie-api-ts/http";
import { useAuth } from "../hooks/AuthContext";
import { getDestinyManifest } from "bungie-api-ts/destiny2";
import { getProfile, GetProfileParams } from "bungie-api-ts/destiny2";

function Vault(){
    const {user} = useAuth();
    const membershipId = user()?.destiny_membership_id;
    const membershipType = user()?.destiny_membership_type;

    const profileParams: GetProfileParams = {
        destinyMembershipId: membershipId,
        membershipType: membershipType,
        components: [100, 102, 200, 201] // Profiles, Characters, CharacterInventories
    };

    getProfile(useAuth().httpClient(), profileParams).then(profile => {
        console.log("Destiny Profile:", profile);
    });

    // getDestinyManifest(useAuth().httpClient()).then(manifest => {
    //     console.log("Destiny Manifest:", manifest);
    // });

    return (
        <div class="flex flex-col items-center justify-center h-screen">
            <h1 class="text-4xl font-bold mb-4">Vault</h1>
            <p class="text-lg">This is the Vault page.</p>
        </div>
    );
}

export default Vault;