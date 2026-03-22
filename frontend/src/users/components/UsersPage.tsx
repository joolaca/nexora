// src/users/components/UsersPage.tsx
import { useState, useEffect } from "react";
import { useUsersList } from "../usersHooks";
import { UsersToolbar } from "./UsersToolbar";
import { UsersTable } from "./UsersTable";
import { useTranslation } from "react-i18next";

type SortKey = "rank_desc" | "rank_asc" | "username_asc" | "username_desc";
type ClanFilter = "any" | "in" | "none";

function parseOptionalNonNegativeInt(input: string): number | undefined {
    const v = input.trim();
    if (v === "") return undefined;

    const n = Number(v);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
        return undefined;
    }

    return n;
}

export function UsersPage() {
    const { t } = useTranslation("user");
    const { t: tc } = useTranslation("common");

    // pagination + sorting
    const [limit, setLimit] = useState(20);
    const [sort, setSort] = useState<SortKey>("rank_desc");
    const [page, setPage] = useState(1);

    // filters
    const [minRank, setMinRank] = useState("");
    const [maxRank, setMaxRank] = useState("");
    const [clan, setClan] = useState<ClanFilter>("any");

    // reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [limit, sort, minRank, maxRank, clan]);

    const parsedMinRank = parseOptionalNonNegativeInt(minRank);
    const parsedMaxRank = parseOptionalNonNegativeInt(maxRank);

    const list = useUsersList({
        limit,
        sort,
        page,
        minRank: parsedMinRank,
        maxRank: parsedMaxRank,
        clan,
    });

    const users = list.data?.items ?? [];
    const meta = list.data?.meta;

    const goPrev = () => setPage((p) => Math.max(1, p - 1));

    const goNext = () => {
        if (!meta?.hasNext) return;
        setPage((p) => p + 1);
    };

    const resetFilters = () => {
        setMinRank("");
        setMaxRank("");
        setClan("any");
    };

    return (
        <div className="container py-3">
            {/* toolbar */}
            <UsersToolbar
                limit={limit}
                sort={sort}
                minRank={minRank}
                maxRank={maxRank}
                clan={clan}
                onLimitChange={setLimit}
                onSortChange={setSort}
                onMinRankChange={setMinRank}
                onMaxRankChange={setMaxRank}
                onClanChange={setClan}
                onResetFilters={resetFilters}
            />

            {/* pagination header */}
            <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="text-muted small">
                    {meta ? (
                        <>
                            {tc("pagination.page")} {meta.page} / {meta.totalPages} ·{" "}
                            {tc("pagination.total")} {meta.total}
                        </>
                    ) : (
                        <span>&nbsp;</span>
                    )}
                </div>

                <div className="btn-group">
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={goPrev}
                        disabled={!meta || !meta.hasPrev || list.isFetching}
                    >
                        {tc("pagination.prev")}
                    </button>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={goNext}
                        disabled={!meta || !meta.hasNext || list.isFetching}
                    >
                        {tc("pagination.next")}
                    </button>
                </div>
            </div>

            {/* states */}
            {list.isLoading && (
                <div className="text-muted">{t("panel.loading")}</div>
            )}

            {list.isError && (
                <div className="alert alert-danger py-2">
                    {t("errors.listFailed")}
                </div>
            )}

            {list.isFetching && !list.isLoading && (
                <div className="text-muted small mb-2">
                    {tc("pagination.loadingPage")}
                </div>
            )}

            {/* table */}
            <UsersTable users={users} />
        </div>
    );
}