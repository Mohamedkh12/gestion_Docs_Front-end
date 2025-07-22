"use client";

import { useState } from "react";
import InvitationForm from "../../components/invitUser/InvitationForm";
import InvitationsTable from "../../components/invitUser/InvitationsTable";
import { IconUserPlus } from "@tabler/icons-react";

export default function UsersPage() {
    const [refresh, setRefresh] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const handleInvited = () => {
        setRefresh(prev => prev + 1);
        setShowModal(false);
    };

    return (
        <div className="card p-4 shadow rounded-xl max-w-5xl mx-auto " style={{ marginTop: "20px" }}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Invitations envoyées</h2>
                <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => setShowModal(true)}
                >
                    <IconUserPlus size={18} />
                    Inviter un utilisateur
                </button>
            </div>

            <InvitationsTable key={refresh} />

            {showModal && (
                <div style={overlayStyle} onClick={() => setShowModal(false)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                        >
                            ✕
                        </button>
                        <InvitationForm onInvited={handleInvited} />
                    </div>
                </div>
            )}
        </div>
    );
}

const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
} as const;

const modalStyle = {
    position: "relative",
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    animation: "fadeScale 0.3s ease-out",
} as const;
