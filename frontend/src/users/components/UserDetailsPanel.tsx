///src/users/components/UserDetailsPanel.tsx
import type { UserListItem } from "../usersApi";
import { useTranslation } from "react-i18next";
import { useMyClan } from "../../clans/overview/hooks/overview.hooks";
import { useInviteToClan } from "../../clans/requests/hooks/requests.hooks";

type Props = {
    user: UserListItem | null;
    isLoading: boolean;
};

export function UserDetailsPanel({ user, isLoading }: Props) {
    const { t: tUser } = useTranslation("user");
    const { t: tClan } = useTranslation("clan");

    if (isLoading) return <div className="text-muted">{tUser("panel.loading")}</div>;
    if (!user) return <div className="text-muted">{tUser("panel.notFound")}</div>;

    const { data: myClan } = useMyClan();
    const invite = useInviteToClan();

    // Most már: akkor is hívható, ha a user klánban van.
    // Csak az a feltétel, hogy te legyél klánban.
    const canInvite = !!myClan?.id;

    const onInvite = () => {
        if (!myClan?.id) return;
        invite.mutate({ clanId: myClan.id, body: { userId: user.id } });
    };

    return (
        <>
            <div className="mb-2">
                <div className="text-muted small">{tUser("panel.username")}</div>
                <div className="fw-semibold">{user.username}</div>
            </div>

            <div className="mb-2">
                <div className="text-muted small">{tUser("panel.rank")}</div>
                <div className="fw-semibold">{user.rank}</div>
            </div>

            <div className="mb-3">
                <div className="text-muted small">{tUser("panel.clans")}</div>
                {user.clan ? (
                    <div className="fw-semibold">
                        {user.clan.name} <span className="text-muted">({user.clan.slug})</span>
                    </div>
                ) : (
                    <div className="text-muted">{tUser("panel.noClan")}</div>
                )}
            </div>

            <hr />

            <div className="d-grid gap-2">
                <button
                    className="btn btn-primary w-100"
                    onClick={onInvite}
                    disabled={!canInvite || invite.isPending}
                    title={!canInvite ? tClan("invite.disabledTitle") : undefined}
                >
                    {invite.isPending ? tClan("invite.buttonInviting") : tClan("invite.buttonNext")}
                </button>

                {user.clan ? (
                    <div className="alert alert-secondary py-2 mb-0">
                        {tClan("invite.userCurrentClan")}: <strong>{user.clan.name}</strong>
                    </div>
                ) : (
                    <div className="alert alert-light py-2 mb-0">{tClan("invite.userNoClan")}</div>
                )}

                {invite.isError && (
                    <div className="alert alert-danger py-2 mb-0">{tClan("invite.error")}</div>
                )}

                {invite.isSuccess && (
                    <div className="alert alert-success py-2 mb-0">{tClan("invite.success")}</div>
                )}
            </div>
        </>
    );
}
