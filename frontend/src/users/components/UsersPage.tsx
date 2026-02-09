// src/users/components/UsersPage.tsx
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUsersList } from "../usersHooks";
import type { UserListItem } from "../usersApi";
import { SidePanel } from "../../components/SidePanel";
import { UsersToolbar } from "./UsersToolbar";
import { UsersTable } from "./UsersTable";
import { UserDetailsPanel } from "./UserDetailsPanel";
import { useTranslation } from "react-i18next";

type SortKey = "rank_desc" | "rank_asc" | "username_asc" | "username_desc";

export function UsersPage() {
    const { t } = useTranslation("user");
    const [sp, setSp] = useSearchParams();
    const selectedUserId = sp.get("userId");

    const [limit, setLimit] = useState(20);
    const [sort, setSort] = useState<SortKey>("rank_desc");

    const list = useUsersList({ limit, sort });

    const selectedUser: UserListItem | null = useMemo(() => {
        if (!selectedUserId) return null;
        if (!list.data) return null;
        return list.data.find((u) => u.id === selectedUserId) ?? null;
    }, [selectedUserId, list.data]);

    const openUser = (id: string) => {
        const next = new URLSearchParams(sp);
        next.set("userId", id);
        setSp(next, { replace: true });
    };

    const closePanel = () => {
        const next = new URLSearchParams(sp);
        next.delete("userId");
        setSp(next, { replace: true });
    };

    return (
        <div className="container py-3">
            <UsersToolbar limit={limit} sort={sort} onLimitChange={setLimit} onSortChange={setSort} />

            {list.isLoading && <div className="text-muted">{t("panel.loading")}</div>}

            {list.isError && <div className="alert alert-danger py-2">{t("errors.listFailed")}</div>}

            {list.data && <UsersTable users={list.data} onSelect={openUser} />}

            <SidePanel
                open={!!selectedUserId}
                title={selectedUser ? selectedUser.username : t("panel.titleFallback")}
                onClose={closePanel}
            >
                <UserDetailsPanel user={selectedUser} isLoading={list.isLoading} />
            </SidePanel>
        </div>
    );
}
