"use client";
import api from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/api/users/getUser");
                setUser(response.data);
            } catch (e) {
                if (e.response?.status === 401) {
                    console.warn("Utilisateur non connecté");
                } else {
                    console.error('Erreur lors de la récupération de l’utilisateur :', e);
                }
            }
        };

        fetchUser();
    }, []);


    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    return (
        <header className="navbar" style={{ margin: 0, padding: '0.5rem 1rem' }}>
            <div className="container-xl d-flex align-items-center justify-content-between">
                <h1 className="navbar-brand">
                </h1>

                <div className="navbar-nav flex-row order-md-last">
                    <div className="nav-item">
                        <a href="#" className="nav-link d-flex lh-1 text-reset p-0">
                            <span
                                className="avatar avatar-sm"
                                style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    borderRadius: '9999px',
                                    width: '36px',
                                    height: '36px',
                                }}
                            >
                                {getInitial(user?.firstname)}
                            </span>
                            <div className="d-none d-xl-block ps-2">
                                <div>{user?.firstname} {user?.lastname}</div>
                                <div className="mt-1 small text-secondary">{user?.email}</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}
