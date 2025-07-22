'use client';

import React, { useState, useEffect } from 'react';
import {
    IconFolder,
    IconCategory,
    IconTags,
    IconChevronRight,
    IconChevronLeft, IconUsers,
} from '@tabler/icons-react';
import MenuItem from './MenuItem';
import api from '@/lib/api';
import { toast } from 'react-toastify';

interface Category {
    _id: string;
    nomCat: string;
}

interface Tag {
    _id: string;
    name: string;
    color: string;
}

const Sidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/api/category/listeCategories');
                setCategories(res.data);
            } catch {
                toast.error('Erreur lors du chargement des catégories');
            }
        };
        const fetchTags = async () => {
            try {
                const res = await api.get('/api/tag/getAllTags');
                setTags(res.data);
            } catch {
                toast.error('Erreur lors du chargement des tags');
            }
        };

        fetchCategories();
        fetchTags();
    }, []);

    // Prépare les sous-items pour catégories et tags (tags avec petit cercle)
    const categorySubItems = categories.map((cat) => ({
        text: cat.nomCat,
    }));

    const tagSubItems = tags.map((tag) => ({
        text: tag.name,
        color: tag.color,
    }));

    return (
        <aside
                className={`sidebar ${collapsed ? 'collapsed' : ''}`}
                style={{
                width: collapsed ? 80 : 260,
                backgroundColor: '#fff',
                borderRight: '1px solid #ddd',
                height: '100vh',
                padding: '16px',
                boxSizing: 'border-box',
                transition: 'width 0.3s ease',
                overflow: 'visible',
                position: 'relative',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
            }}
        >

            {/* Header */}
            <div
                className="sidebar-header"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                    paddingRight: 8,
                }}
            >
                <div
                    className="logo"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        flexGrow: 1,
                    }}
                >
                    <a href={"/dashboard"}>
                        <img
                            src="/pixelium.svg"
                            alt="Logo"
                            style={{
                                width: collapsed ? 50 : 30,
                                height: collapsed ? 50 : 30,
                                userSelect: 'none',
                                transition: 'all 0.3s ease',

                            }}
                        />
                    </a>
                    {!collapsed && (
                        <span
                            style={{
                                fontWeight: '700',
                                fontSize: 20,
                                color: '#222',
                                userSelect: 'none',
                            }}
                        >
              Pixelium
            </span>
                    )}
                </div>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label="Toggle sidebar"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#666',
                        padding: 4,
                        borderRadius: 6,
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
                >
                    {collapsed ? <IconChevronRight size={24} /> : <IconChevronLeft size={24} />}
                </button>
            </div>

            {/* Menu Section */}
            {!collapsed && (
                <div
                    className="section-title"
                    style={{
                        fontSize: 12,
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#999',
                        marginBottom: 12,
                        userSelect: 'none',
                    }}
                >
                    MENU
                </div>
            )}

            {/* Items */}
            <MenuItem
                icon={<IconFolder size={22} />}
                text="Documents"
                collapsed={collapsed}
                href="/dashboard/documents"
            />

            <MenuItem
                icon={<IconCategory size={22} />}
                text="Category"
                collapsed={collapsed}
                href="/dashboard/categories"
                subItems={categorySubItems}
                hasToggleIcon={true}
            />

            <MenuItem
                icon={<IconTags size={22} />}
                text="Tag"
                collapsed={collapsed}
                href="/dashboard/tags"
                subItems={tagSubItems}
                hasToggleIcon={true}
                isTagWithColorCircle={true}
            />
            {/* Menu Section */}
            {!collapsed && (
                <div
                    className="section-title"
                    style={{
                        fontSize: 12,
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#999',
                        marginBottom: 12,
                        userSelect: 'none',
                        marginTop:"18px"
                    }}
                >
                    Management
                </div>
            )}
            <MenuItem
                icon={<IconUsers size={22} />}
                text="User Management"
                collapsed={collapsed}
                hasToggleIcon={true}
                subItems={[
                    { text: "Membre", href: "/dashboard/users" },
                    { text: "Roles", href: "/dashboard/roles" },
                ]}
            />

        </aside>
    );
};

export default Sidebar;
