// frontend/src/user-details/UserDetailsPanel.tsx
import { SidePanel } from "../components/SidePanel";
import { useUserPublicData } from "../users/usersHooks";
import { useUserDetails } from "./UserDetailsContext";

export function UserDetailsPanel() {
    const { userId, close } = useUserDetails();
    const { data, isLoading, isError } = useUserPublicData(userId);

    return (
        <SidePanel
            open={!!userId}
            title={data?.username ?? "Felhasználó részletek"}
            onClose={close}
        >
            {isLoading && <div className="text-muted">Betöltés...</div>}

            {isError && (
                <div className="alert alert-danger py-2 mb-0">
                    Nem sikerült betölteni a publikus user adatokat.
                </div>
            )}

            {!isLoading && !isError && !data && (
                <div className="text-muted">Nincs adat.</div>
            )}

            {data && (
                <>
                    <div className="mb-2">
                        <div className="text-muted small">Felhasználónév</div>
                        <div className="fw-semibold">{data.username}</div>
                    </div>

                    <div className="mb-2">
                        <div className="text-muted small">Rank</div>
                        <div className="fw-semibold">{data.rank}</div>
                    </div>

                    <div className="mb-2">
                        <div className="text-muted small">About</div>
                        <div>{data.about || <span className="text-muted">—</span>}</div>
                    </div>
                </>
            )}
        </SidePanel>
    );
}