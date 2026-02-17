// src/clans/overview/components/ClanEditCard.tsx
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateApiError } from "../../../i18n/translateApiError";
import { useEditClan } from "../hooks/overview.hooks";
import type { ClanMeResponse } from "../api/overview.types";

type Props = {
    clan: ClanMeResponse;
};

export function ClanEditCard({ clan }: Props) {
    const { t } = useTranslation();
    const edit = useEditClan();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");

    // ✅ Prefill: amikor betölt a clans, töltsük fel a mezőket (de ne írjuk felül, ha user már gépelt)
    useEffect(() => {
        setName((prev) => (prev ? prev : clan.name));
        setSlug((prev) => (prev ? prev : clan.slug));
    }, [clan.id, clan.name, clan.slug]);

    const canSubmit = useMemo(() => {
        const nameTrim = name.trim();
        const slugTrim = slug.trim();
        // csak akkor engedjük, ha tényleg változott valami
        const changed = nameTrim !== clan.name || slugTrim !== clan.slug;
        return changed && !edit.isPending;
    }, [name, slug, clan.name, clan.slug, edit.isPending]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        const nameTrim = name.trim();
        const slugTrim = slug.trim();

        edit.mutate({
            name: nameTrim !== clan.name ? nameTrim : undefined,
            slug: slugTrim !== clan.slug ? slugTrim : undefined,
        });
    };

    const errMsg = edit.isError ? translateApiError(edit.error, t, "clans.editFailed") : "";

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h3 className="h5 mb-2">{t("clans.editTitle")}</h3>

                <div className="text-muted small mb-3">
                    {t("clans.inClanAs")} <strong>{clan.name}</strong> ({clan.slug}) — {t("clans.myRole")}:{" "}
                    <strong>{clan.myRole}</strong>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="form-label">{t("clans.editName")}</label>
                        <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">{t("clans.editSlug")}</label>
                        <input className="form-control" value={slug} onChange={(e) => setSlug(e.target.value)} />
                    </div>

                    {edit.isError && <div className="alert alert-danger py-2">{errMsg}</div>}

                    {edit.isSuccess && <div className="alert alert-success py-2">{t("clans.editSuccess")}</div>}

                    <button className="btn btn-outline-primary" type="submit" disabled={!canSubmit}>
                        {edit.isPending ? t("clans.editSaving") : t("clans.editSave")}
                    </button>
                </form>
            </div>
        </div>
    );
}
