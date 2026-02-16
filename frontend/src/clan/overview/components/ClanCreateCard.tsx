// src/clan/overview/components/ClanCreateCard.tsx
import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateClan } from "../hooks/overview.hooks";
import { translateApiError } from "../../../i18n/translateApiError";

export function ClanCreateCard() {
    const { t } = useTranslation();
    const create = useCreateClan();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");

    const canSubmit = useMemo(() => name.trim().length >= 3 && !create.isPending, [name, create.isPending]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        create.mutate({
            name: name.trim(),
            slug: slug.trim() ? slug.trim() : undefined,
        });
    };

    const errMsg = create.isError ? translateApiError(create.error, t, "clan.createFailed") : "";

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h2 className="h4 mb-3">{t("clan.title")}</h2>

                <div className="alert alert-secondary py-2">{t("clan.noClanYet")}</div>

                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="form-label">{t("clan.name")}</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("clan.namePh")}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">{t("clan.slug")}</label>
                        <input
                            className="form-control"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder={t("clan.slugPh")}
                        />
                        <div className="form-text">{t("clan.slugHelp")}</div>
                    </div>

                    {create.isError && <div className="alert alert-danger py-2">{errMsg}</div>}

                    {create.isSuccess && (
                        <div className="alert alert-success py-2">
                            {t("clan.created")} <strong>{create.data.name}</strong> ({create.data.slug})
                        </div>
                    )}

                    <button className="btn btn-primary" type="submit" disabled={!canSubmit}>
                        {create.isPending ? t("clan.creating") : t("clan.create")}
                    </button>
                </form>
            </div>
        </div>
    );
}
