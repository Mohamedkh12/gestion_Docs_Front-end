"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

export default function AcceptInvitationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Token manquant.");
            setLoading(false);
            return;
        }

        const acceptInvitation = async () => {
            try {
                const res = await api.post("/api/invitations/accept-invitation", { token });

                console.log("Réponse accept-invitation:", res.data);

                const invitedByUserId = res.data.user?.invitedBy;

                if (!invitedByUserId) {
                    throw new Error("ID de l'utilisateur invité manquant.");
                }

                setSuccess(true);

                setTimeout(() => router.push(`/dashboard/documents?userId=${invitedByUserId}`), 2000);

            } catch (err: any) {
                const msg = err?.response?.data?.message || "Erreur lors de l’acceptation.";
                setError(msg);
                setLoading(false);
            }
        };

        acceptInvitation();
    }, [token]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" />
                    <p>Traitement de l’invitation...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger mt-5 mx-auto" style={{ maxWidth: 400 }}>
                {error}
            </div>
        );
    }

    if (success) {
        return (
            <div className="alert alert-success mt-5 mx-auto" style={{ maxWidth: 400 }}>
                Bienvenue ! Redirection en cours...
            </div>
        );
    }

    return null;
}
