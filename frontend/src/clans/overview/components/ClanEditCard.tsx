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
    const { t } = useTranslation("clan");
    const edit = useEditClan();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");

    useEffect(() => {
        setName((prev) => (prev ? prev : clan.name));
        setSlug((prev) => (prev ? prev : clan.slug));
    }, [clan.id, clan.name, clan.slug]);

    const canSubmit = useMemo(() => {
        const nameTrim = name.trim();
        const slugTrim = slug.trim();
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

    const errMsg = edit.isError
        ? translateApiError(edit.error, t, "overview.edit.failed")
        : "";

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h3 className="h5 mb-2">{t("overview.edit.title")}</h3>

                <div className="text-muted small mb-2">
                    {t("overview.shared.inClanAs")} <strong>{clan.name}</strong> ({clan.slug}) —{" "}
                    {t("overview.shared.myRole")}: <strong>{clan.myRole}</strong>
                </div>

                <div className="text-muted small mb-3">
                    {t("overview.edit.hint")}
                </div>

                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="form-label">{t("overview.edit.name")}</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("overview.edit.namePh")}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">{t("overview.edit.slug")}</label>
                        <input
                            className="form-control"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder={t("overview.edit.slugPh")}
                        />
                    </div>

                    {edit.isError && (
                        <div className="alert alert-danger py-2">{errMsg}</div>
                    )}

                    {edit.isSuccess && (
                        <div className="alert alert-success py-2">
                            {t("overview.edit.success")}
                        </div>
                    )}

                    <button className="btn btn-outline-primary" type="submit" disabled={!canSubmit}>
                        {edit.isPending
                            ? t("overview.edit.submitting")
                            : t("overview.edit.submit")}
                    </button>
                </form>
            </div>
        </div>
    );
}