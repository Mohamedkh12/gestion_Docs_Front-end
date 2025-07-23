"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconUser, IconLogout } from "@tabler/icons-react";
import api from "@/lib/api";

export default function Navbar() {
    const [user, setUser] = useState<{ firstname: string; lastname: string; email: string } | null>(null);
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Récupère le user depuis l'API
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/api/users/getUser");
                setUser(res.data);
            } catch (error) {
                console.error("Erreur lors de la récupération de l'utilisateur :", error);
            }
        };
        fetchUser();
    }, []);

    const getInitial = (name?: string) => name?.charAt(0).toUpperCase() ?? "?";

    const handleLogout = async () => {
        try {
            await api.post("/api/users/logout");
            router.push("/signin");
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "1rem",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                position: "relative",
                zIndex: 9999,
            }}
        >
            {user && (
                <div ref={menuRef} style={{ position: "relative" }}>
                    <div
                        onClick={() => setOpen((prev) => !prev)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            userSelect: "none",
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: "#228be6",
                                color: "white",
                                width: 36,
                                height: 36,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                fontWeight: "bold",
                            }}
                        >
                            {getInitial(user.firstname)}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                {user.firstname} {user.lastname}
              </span>
                            <span style={{ fontSize: "12px", color: "#666" }}>{user.email}</span>
                        </div>
                    </div>

                    {open && (
                        <div
                            style={{
                                position: "absolute",
                                top: "calc(100% + 8px)",
                                right: 0,
                                background: "#fff",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                padding: "8px 0",
                                minWidth: "180px",
                                zIndex: 10000,
                            }}
                        >
                            <button
                                onClick={() => {
                                    router.push("/dashboard/profile");
                                    setOpen(false);
                                }}
                                style={dropdownItemStyle}
                            >
                                <IconUser size={18} style={{ marginRight: 8 }} />
                                Mon profil
                            </button>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setOpen(false);
                                }}
                                style={{ ...dropdownItemStyle, color: "red" }}
                            >
                                <IconLogout size={18} style={{ marginRight: 8 }} />
                                Déconnexion
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const dropdownItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    width: "100%",
    background: "transparent",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.2s ease",
};
