// src/clans/overview/pages/ClanOverviewPage.tsx
import { useTranslation } from "react-i18next";
import { ClanCreateCard } from "../components/ClanCreateCard";
import { ClanEditCard } from "../components/ClanEditCard";
import { useMyClan } from "../hooks/overview.hooks";
import { ApiError } from "../../../api/types";

function isApiError(err: unknown): err is ApiError {
    return typeof err === "object" && err !== null && (err as any).name === "ApiError";
}

export function ClanOverviewPage() {
    const { t } = useTranslation();
    const myClan = useMyClan();

    if (myClan.isLoading) {
        return <div className="text-muted">{t("common.loading")}</div>;
    }

    // Ha a backend 404-gyel vagy CLAN_NOT_FOUND kóddal jelzi, hogy nincs klán:
    if (myClan.isError) {
        if (isApiError(myClan.error)) {
            const status = myClan.error.statusCode;
            const code = myClan.error.body?.error?.code;

            if (status === 404 || code === "CLAN_NOT_FOUND") {
                return (
                    <div className="row g-3">
                        <div className="col-12 col-lg-8">
                            <ClanCreateCard />
                        </div>
                    </div>
                );
            }
        }

        return <div className="alert alert-danger">{t("common.errorGeneric")}</div>;
    }

    const clan = myClan.data;

    if (!clan) {
        return (
            <div className="row g-3">
                <div className="col-12 col-lg-8">
                    <ClanCreateCard />
                </div>
            </div>
        );
    }

    return (
        <div className="row g-3">
            <div className="col-12 col-lg-8">
                <ClanEditCard clan={clan} />
            </div>
        </div>
    );
}
