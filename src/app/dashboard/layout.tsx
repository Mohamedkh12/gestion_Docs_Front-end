"use client";

import Sidebar from '@/app/components/sidebar/Sidebar';
import Navbar from '@/app/components/navBar/NavBar';

export default function DashboardLayout({ children }) {
    return (
        <div style={{ display: 'flex', height: '100vh', margin: 0, padding: 0, boxSizing: 'border-box' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 0, padding: 0, boxSizing: 'border-box' ,overflow: "auto"}}>
                <Navbar />
                <main style={{ flex: 1, padding: 0, overflowY: 'auto', backgroundColor: '#f9fafb', margin: 0, boxSizing: 'border-box' }}>
                    <div style={{ padding: '0 2rem' }}>{children}</div>
                </main>
            </div>
        </div>
    );
}
