// src/users/components/UsersToolbar.tsx
import { useTranslation } from "react-i18next";

type SortKey = "rank_desc" | "rank_asc" | "username_asc" | "username_desc";

type Props = {
    limit: number;
    sort: SortKey;
    onLimitChange: (v: number) => void;
    onSortChange: (v: SortKey) => void;
};

export function UsersToolbar({ limit, sort, onLimitChange, onSortChange }: Props) {
    const { t } = useTranslation("user");

    return (
        <div className="d-flex align-items-center justify-content-between mb-3">
            <h1 className="h4 m-0">{t("title")}</h1>

            <div className="d-flex gap-2 align-items-center">
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
            </div>
        </div>
    );
}
