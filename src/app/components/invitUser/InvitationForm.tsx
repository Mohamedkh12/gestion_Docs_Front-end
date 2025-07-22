"use client";

import { useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";

const roles = [
    { label: "Membre", value: "member" },
    { label: "Admin", value: "admin" },
];

export default function InvitationForm({ onInvited }: { onInvited: () => void }) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async () => {
        if (!email.trim()) {
            setMessage({ type: "error", text: "Veuillez saisir une adresse email." });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const res = await api.post("/api/invitations/inviteUser", { email, role });

            setMessage({ type: "success", text: res.data.message });
            setEmail("");
            setRole("member");
            toast.success("Invitation envoyée avec succès 🎉");
            onInvited();
        } catch (e: any) {
            const errorMsg =
                e.response?.data?.message === "Utilisateur non trouvé dans la base de données."
                    ? "L'utilisateur avec cet email n'existe pas dans la base de données."
                    : e.response?.data?.message || "Erreur lors de l'envoi.";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 px-2 py-1">
            <h2 className="text-center text-lg font-bold mb-2">Inviter un utilisateur</h2>

            {message && (
                <div
                    className={`alert ${message.type === "error" ? "alert-danger" : "alert-success"}`}
                    role="alert"
                >
                    {message.text}
                </div>
            )}

            <div className="mb-2">
                <label className="form-label">Adresse email</label>
                <input
                    type="email"
                    className="form-control"
                    placeholder="ex: user@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="mb-2">
                <label className="form-label">Rôle</label>
                <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    {roles.map((r) => (
                        <option key={r.value} value={r.value}>
                            {r.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-footer mt-3">
                <button
                    type="button"
                    className={`btn btn-primary w-full transition duration-200 ${loading ? "disabled opacity-70" : "hover:scale-105"}`}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Envoi en cours..." : "Envoyer l'invitation"}
                </button>
            </div>
        </div>
    );
}
