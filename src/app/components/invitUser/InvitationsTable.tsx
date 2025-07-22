"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { IconX, IconCheck } from "@tabler/icons-react";
import { toast } from "react-toastify";

const statusColor = {
    pending: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
};

export default function InvitationsTable() {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInvitations = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/api/invitations/getInvitations");
            setInvitations(data);
        } catch {
            toast.error("Erreur lors du chargement des invitations");
        } finally {
            setLoading(false);
        }
    };

    const handleExpire = async (token) => {
        try {
            await api.patch(`/api/invitations/invitations/${token}/expire`);
            toast.success("Invitation expirée");
            fetchInvitations();
        } catch {
            toast.error("Erreur lors de l'expiration");
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    return (
        <div className="card shadow rounded-xl p-4">
            <h2 className="text-xl font-bold mb-4">Invitations envoyées</h2>

            {loading ? (
                <div className="flex justify-center p-10">
                    <div className="loader" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-vcenter text-nowrap w-full">
                        <thead>
                        <tr>
                            <th>Email</th>
                            <th className="hidden sm:table-cell">Rôle</th>
                            <th>Statut</th>
                            <th className="hidden lg:table-cell">Invité par</th>
                            <th className="hidden md:table-cell">Date</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {invitations.map((invite) => (
                            <tr key={invite._id}>
                                <td>{invite.email}</td>
                                <td className="hidden sm:table-cell">{invite.role}</td>
                                <td>
                    <span className={`badge ${statusColor[invite.status] || "bg-gray-200 text-gray-800"}`}>
                      {invite.status}
                    </span>
                                </td>
                                <td className="hidden lg:table-cell">{invite.invitedBy?.email || "N/A"}</td>
                                <td className="hidden md:table-cell">{new Date(invite.createdAt).toLocaleString()}</td>
                                <td>
                                    {invite.status === "pending" ? (
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleExpire(invite.token)}
                                        >
                                            <IconX size={16} className="mr-1" />
                                            Expirer
                                        </button>
                                    ) : (
                                        <button className="btn btn-sm btn-outline-secondary" disabled>
                                            <IconCheck size={16} className="mr-1" />
                                            {invite.status === "accepted" ? "Acceptée" : "Expirée"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
