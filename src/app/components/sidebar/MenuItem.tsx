'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { IconChevronRight, IconChevronDown } from '@tabler/icons-react';

interface SubItem {
    text: string;
    href?: string;
    color?: string;
}

interface MenuItemProps {
    icon: React.ReactNode;
    text: string;
    collapsed: boolean;
    subItems?: SubItem[];
    hasToggleIcon?: boolean;
    isTagWithColorCircle?: boolean;
    href?: string;
    onNavigate?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
                                               icon,
                                               text,
                                               collapsed,
                                               subItems = [],
                                               hasToggleIcon = false,
                                               isTagWithColorCircle = false,
                                               href,
                                               onNavigate,
                                           }) => {
    const pathname = usePathname();
    const isActive = href && pathname.startsWith(href);
    const hasSubmenu = subItems.length > 0;

    const [open, setOpen] = useState(false);
    const [showFlyout, setShowFlyout] = useState(false);

    const onToggleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!collapsed && hasSubmenu) {
            setOpen(!open);
        }
    };

    const ItemContent = (
        <div
            className="menu-item"
            title={collapsed ? text : undefined}
            style={{
                cursor: href ? 'pointer' : hasSubmenu && !collapsed ? 'default' : 'default',
                justifyContent: collapsed ? 'center' : 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 8,
                fontWeight: 500,
                userSelect: 'none',
                color: '#374151',
                backgroundColor: isActive ? '#e0e7ff' : open ? '#eef4ff' : 'transparent',
                textDecoration: 'none',
                transition: 'background-color 0.2s ease',
            }}
        >
            {icon}

            {!collapsed && (
                <span style={{ flexGrow: 1 }}>{text}</span>
            )}

            {hasToggleIcon && !collapsed && hasSubmenu && (
                <button
                    onClick={onToggleClick}
                    aria-label={open ? 'Réduire sous-menu' : 'Développer sous-menu'}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {open ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                </button>
            )}
        </div>
    );

    const Wrapper = (children: React.ReactNode) =>
        href ? (
            <Link href={href} onClick={onNavigate} style={{ textDecoration: 'none' }}>
                {children}
            </Link>
        ) : (
            <div onClick={hasSubmenu ? onToggleClick : undefined}>{children}</div>
        );

    return (
        <div
            style={{ position: 'relative' }}
            onMouseEnter={() => collapsed && hasSubmenu && setShowFlyout(true)}
            onMouseLeave={() => collapsed && hasSubmenu && setShowFlyout(false)}
        >
            {Wrapper(ItemContent)}

            {/* Sous-menu affiché si ouvert */}
            {hasSubmenu && open && !collapsed && (
                <div
                    style={{
                        paddingLeft: 36,
                        marginTop: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                    }}
                >
                    {subItems.map((item, i) =>
                        item.href ? (
                            <Link
                                key={i}
                                href={item.href}
                                onClick={onNavigate}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '6px 0',
                                    color: '#4b5563',
                                    fontSize: 14,
                                    textDecoration: 'none',
                                    borderRadius: 6,
                                }}
                            >
                                {isTagWithColorCircle && item.color ? (
                                    <span
                                        style={{
                                            backgroundColor: item.color,
                                            color: '#fff',
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            lineHeight: '1.4',
                                            display: 'inline-block',
                                            maxWidth: '100%',
                                        }}
                                    >
                                        {item.text}
                                    </span>
                                ) : (
                                    <span>{item.text}</span>
                                )}
                            </Link>
                        ) : (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '6px 0',
                                    color: '#4b5563',
                                    fontSize: 14,
                                    borderRadius: 6,
                                    cursor: 'default',
                                }}
                            >
                                {isTagWithColorCircle && item.color ? (
                                    <span
                                        style={{
                                            backgroundColor: item.color,
                                            color: '#fff',
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            lineHeight: '1.4',
                                            display: 'inline-block',
                                            maxWidth: '100%',
                                        }}
                                    >
                                        {item.text}
                                    </span>
                                ) : (
                                    <span>{item.text}</span>
                                )}
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Flyout menu pour sidebar réduite */}
            {hasSubmenu && collapsed && showFlyout && (
                <div
                    style={{
                        position: 'absolute',
                        left: '100%',
                        top: 0,
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        padding: 8,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        zIndex: 9999,
                        minWidth: 180,
                        animation: 'fadeIn 0.2s ease',
                        pointerEvents: 'auto',
                    }}
                >
                    {subItems.map((item, i) =>
                        item.href ? (
                            <Link
                                key={i}
                                href={item.href}
                                onClick={onNavigate}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '6px 10px',
                                    color: '#4b5563',
                                    fontSize: 14,
                                    textDecoration: 'none',
                                    borderRadius: 6,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {isTagWithColorCircle && item.color ? (
                                    <span
                                        style={{
                                            backgroundColor: item.color,
                                            color: '#fff',
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            lineHeight: '1.4',
                                            display: 'inline-block',
                                            maxWidth: '100%',
                                        }}
                                    >
                                        {item.text}
                                    </span>
                                ) : (
                                    <span>{item.text}</span>
                                )}
                            </Link>
                        ) : (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '6px 10px',
                                    color: '#4b5563',
                                    fontSize: 14,
                                    borderRadius: 6,
                                    whiteSpace: 'nowrap',
                                    cursor: 'default',
                                }}
                            >
                                {isTagWithColorCircle && item.color ? (
                                    <span
                                        style={{
                                            backgroundColor: item.color,
                                            color: '#fff',
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            lineHeight: '1.4',
                                            display: 'inline-block',
                                            maxWidth: '100%',
                                        }}
                                    >
                                        {item.text}
                                    </span>
                                ) : (
                                    <span>{item.text}</span>
                                )}
                            </div>
                        )
                    )}
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default MenuItem;
