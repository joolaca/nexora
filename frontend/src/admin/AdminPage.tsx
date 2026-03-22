// src/admin/AdminPage.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getInternalAppError } from "./adminApi";

export function AdminPage() {
    const [result, setResult] = useState("");

    const appErrorMutation = useMutation({
        mutationFn: getInternalAppError,
        onSuccess: (data) => {
            setResult(JSON.stringify(data, null, 2));
        },
        onError: (error) => {
            setResult(JSON.stringify(error, null, 2));
        },
    });

    return (
        <div className="row">
            <div className="col-12 col-lg-8">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h2 className="h4 mb-3">Admin</h2>
                        <p className="text-muted">
                            Itt tudod meghívni az admin-only backend teszt végpontot.
                        </p>

                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => appErrorMutation.mutate()}
                            disabled={appErrorMutation.isPending}
                        >
                            {appErrorMutation.isPending ? "Futtatás..." : "App hiba teszt"}
                        </button>

                        {!!result && (
                            <div className="mt-4">
                                <h3 className="h6">Válasz</h3>
                                <pre
                                    className="bg-light p-3 rounded border small"
                                    style={{ whiteSpace: "pre-wrap" }}
                                >
                                    {result}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}