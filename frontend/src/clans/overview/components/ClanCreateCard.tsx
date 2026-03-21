// src/clans/overview/components/ClanCreateCard.tsx
import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateClan } from "../hooks/overview.hooks";
import { translateApiError } from "../../../i18n/translateApiError";

export function ClanCreateCard() {
    const { t } = useTranslation("clan");
    const create = useCreateClan();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");

    const canSubmit = useMemo(() => {
        return name.trim().length >= 3 && !create.isPending;
    }, [name, create.isPending]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        create.mutate({
            name: name.trim(),
            slug: slug.trim() ? slug.trim() : undefined,
        });
    };

    const errMsg = create.isError
        ? translateApiError(create.error, t, "overview.create.failed")
        : "";

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h2 className="h4 mb-3">{t("overview.create.title")}</h2>

                <div className="alert alert-secondary py-2">
                    {t("overview.shared.noClanYet")}
                </div>

                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="form-label">{t("overview.create.name")}</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("overview.create.namePh")}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">{t("overview.create.slug")}</label>
                        <input
                            className="form-control"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder={t("overview.create.slugPh")}
                        />
                        <div className="form-text">{t("overview.create.slugHelp")}</div>
                    </div>

                    {create.isError && (
                        <div className="alert alert-danger py-2">{errMsg}</div>
                    )}

                    {create.isSuccess && (
                        <div className="alert alert-success py-2">
                            {t("overview.create.success")} <strong>{create.data.name}</strong> ({create.data.slug})
                        </div>
                    )}

                    <button className="btn btn-primary" type="submit" disabled={!canSubmit}>
                        {create.isPending
                            ? t("overview.create.submitting")
                            : t("overview.create.submit")}
                    </button>
                </form>
            </div>
        </div>
    );
}