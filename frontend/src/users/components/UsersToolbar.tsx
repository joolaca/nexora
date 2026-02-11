// src/users/components/UsersToolbar.tsx
import { useTranslation } from "react-i18next";

type SortKey = "rank_desc" | "rank_asc" | "username_asc" | "username_desc";

type ClanFilter = "any" | "in" | "none";

type Props = {
    limit: number;
    sort: SortKey;
    minRank: string;
    maxRank: string;
    clan: ClanFilter;
    onLimitChange: (v: number) => void;
    onSortChange: (v: SortKey) => void;
    onMinRankChange: (v: string) => void;
    onMaxRankChange: (v: string) => void;
    onClanChange: (v: ClanFilter) => void;
    onResetFilters: () => void;
};

export function UsersToolbar({
                                 limit,
                                 sort,
                                 minRank,
                                 maxRank,
                                 clan,
                                 onLimitChange,
                                 onSortChange,
                                 onMinRankChange,
                                 onMaxRankChange,
                                 onClanChange,
                                 onResetFilters,
                             }: Props) {
    const { t } = useTranslation("user");
    const { t: tc } = useTranslation("common");

    return (
        <div className="d-flex align-items-end justify-content-between mb-3">
            <h1 className="h4 m-0">{t("title")}</h1>

            <div className="d-flex gap-2 align-items-end flex-wrap">
                <div>
                    <label className="form-label small mb-1">{t("toolbar.limit")}</label>
                    <select
                        className="form-select form-select-sm"
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                {/* sort */}
                <div>
                    <label className="form-label small mb-1">{t("toolbar.sort")}</label>
                    <select
                        className="form-select form-select-sm"
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value as SortKey)}
                    >
                        <option value="rank_desc">{t("sort.rankDesc")}</option>
                        <option value="rank_asc">{t("sort.rankAsc")}</option>
                        <option value="username_asc">{t("sort.usernameAsc")}</option>
                        <option value="username_desc">{t("sort.usernameDesc")}</option>
                    </select>
                </div>

                {/* minRank */}
                <div style={{ width: 120 }}>
                    <label className="form-label small mb-1">{tc("toolbar.minRank")}</label>
                    <input
                        className="form-control form-control-sm"
                        inputMode="numeric"
                        placeholder="0"
                        value={minRank}
                        onChange={(e) => onMinRankChange(e.target.value)}
                    />
                </div>

                {/* maxRank */}
                <div style={{ width: 120 }}>
                    <label className="form-label small mb-1">{tc("toolbar.maxRank")}</label>
                    <input
                        className="form-control form-control-sm"
                        inputMode="numeric"
                        placeholder="9999"
                        value={maxRank}
                        onChange={(e) => onMaxRankChange(e.target.value)}
                    />
                </div>

                {/* clan */}
                <div style={{ width: 160 }}>
                    <label className="form-label small mb-1">{tc("toolbar.clan")}</label>
                    <select
                        className="form-select form-select-sm"
                        value={clan}
                        onChange={(e) => onClanChange(e.target.value as any)}
                    >
                        <option value="any">{tc("toolbar.clanAny")}</option>
                        <option value="in">{tc("toolbar.clanIn")}</option>
                        <option value="none">{tc("toolbar.clanNone")}</option>
                    </select>
                </div>

                {/* reset */}
                <div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onResetFilters}>
                        {tc("actions.reset")}
                    </button>
                </div>
            </div>
        </div>
    );
}
