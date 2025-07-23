"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import EditTagForm from "@/app/components/tag/EditTagForm";
import AddTagForm from "@/app/components/tag/AddTagForm";
import { IconInbox, IconPencil, IconPlus, IconTrash, IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import { showConfirmDialog } from "@/app/common/ConfirmDialog";
import Pagination, { usePagination } from "@/app/common/UsePagination";
import {useSearchParams} from "next/navigation";

interface Tag {
    _id: string;
    name: string;
    color: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export default function TagPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const allSelected = selectedTags.length === tags.length && tags.length > 0;
    const searchParams = useSearchParams();
    const externalUserId = searchParams.get("userId");

    const sortedTags = [...tags].sort((a, b) => {
        if (!sortConfig) return 0;

        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        }

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
            return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        if (typeof aVal === "string" && typeof bVal === "string") {
            return sortConfig.direction === "asc"
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        return 0;
    });


    const {
        currentPage,
        setCurrentPage,
        paginatedItems: paginatedTags,
        pageCount,
        resetPage,
    } = usePagination(sortedTags, 10);

    const fetchTags = async () => {
        try {
            const params = new URLSearchParams();
            if (externalUserId) {
                params.append("userId", externalUserId);
            }
            const response = await api.get("/api/tag/getAllTags");
            setTags(response.data);
        } catch (e) {
            toast.error("Erreur lors du chargement des tags");
        }
    };

    useEffect(() => {
        fetchTags();
        resetPage();
    }, []);

    const confirmDelete = (id?: string) => {
        if (id) {
            showConfirmDialog({
                message: "Voulez-vous vraiment supprimer ce tag ?",
                onConfirm: () => handleDelete(id),
            });
        } else {
            showConfirmDialog({
                message: `Supprimer ${selectedTags.length} tags sélectionnés ?`,
                onConfirm: handleBulkDelete,
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/api/tag/deleteTag/${id}`);
            setTags((prev) => prev.filter((t) => t._id !== id));
            toast.success("Tag supprimé");
        } catch (e) {
            toast.error("Erreur suppression");
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(
                selectedTags.map((id) => api.delete(`/api/tag/deleteTag/${id}`))
            );
            setTags((prev) => prev.filter((t) => !selectedTags.includes(t._id)));
            setSelectedTags([]);
            toast.success(`${selectedTags.length} tags supprimés`);
        } catch (e) {
            toast.error("Erreur lors de la suppression multiple");
        }
    };

    const handleEdit = (tag: Tag) => {
        setSelectedTag(tag);
        setShowEdit(true);
    };

    const handleUpdate = (updated: Tag) => {
        setTags((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    };

    const toggleSelectAll = () => {
        setSelectedTags(allSelected ? [] : tags.map((tag) => tag._id));
    };

    const toggleSelectTag = (id: string) => {
        setSelectedTags((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const requestSort = (key: string) => {
        setSortConfig((prev) => {
            if (!prev || prev.key !== key) return { key, direction: "asc" };
            return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
        });
        setCurrentPage(0);
    };

    const getSortIcon = (key: string) => (
        <>
            <IconArrowUp
                size={14}
                className={`ms-1 ${sortConfig?.key === key && sortConfig.direction === 'asc' ? 'text-primary' : 'text-muted opacity-50'}`}
            />
            <IconArrowDown
                size={14}
                className={`ms-1 ${sortConfig?.key === key && sortConfig.direction === 'desc' ? 'text-primary' : 'text-muted opacity-50'}`}
            />
        </>
    );

    const truncate = (text: string, maxLength = 30) =>
        text.length > maxLength ? text.slice(0, maxLength) + "..." : text;


    return (
        <div className="p-4">
            {showAdd && (
                <AddTagForm
                    onClose={() => setShowAdd(false)}
                    onAdded={(tag) => setTags((prev) => [...prev, tag])}
                />
            )}

            {showEdit && selectedTag && (
                <EditTagForm
                    tag={selectedTag}
                    onClose={() => setShowEdit(false)}
                    onUpdate={handleUpdate}
                />
            )}

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h2 className="card-title">Liste des Tags</h2>
                    <div className="d-flex gap-2 align-items-center">
                        {selectedTags.length > 1 && (
                            <button
                                className="btn btn-danger"
                                onClick={() => confirmDelete()}
                            >
                                <IconTrash size={16} className="me-1" />
                                Supprimer sélection ({selectedTags.length})
                            </button>
                        )}
                        <button className="btn btn-outline-primary" onClick={() => setShowAdd(true)}>
                            <IconPlus size={16} /> Ajouter un Tag
                        </button>
                    </div>
                </div>

                <div className="card-body p-0">
                    {tags.length === 0 ? (
                        <div className="text-center py-5">
                            <IconInbox size={48} className="text-muted mb-2" />
                            <p className="text-muted">Aucun tag trouvé.</p>
                        </div>
                    ) : (
                        <table className="table table-vcenter card-table">
                            <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        title="Tout sélectionner"
                                    />
                                </th>
                                <th style={{ cursor: "pointer" }} onClick={() => requestSort("name")}>
                                    Nom {getSortIcon("name")}
                                </th>
                                <th style={{ cursor: "pointer" }} onClick={() => requestSort("color")}>
                                    Couleur {getSortIcon("color")}
                                </th>
                                <th style={{ cursor: "pointer" }} onClick={() => requestSort("description")}>
                                    Description{getSortIcon("description")}
                                </th>
                                <th style={{ cursor: "pointer" }} onClick={() => requestSort("createdAt")}>
                                    Créé {getSortIcon("createdAt")}
                                </th>
                                <th style={{ cursor: "pointer" }} onClick={() => requestSort("updatedAt")}>
                                    Mis à jour {getSortIcon("updatedAt")}
                                </th>
                                <th className="text-end">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedTags.map((tag) => (
                                <tr key={tag._id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedTags.includes(tag._id)}
                                            onChange={() => toggleSelectTag(tag._id)}
                                        />
                                    </td>
                                    <td>{tag.name}</td>
                                    <td>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor: tag.color,
                                                    color: "#fff",
                                                    padding: "6px 12px",
                                                    borderRadius: "12px",
                                                }}
                                            >
                                                {tag.color}
                                            </span>
                                    </td>
                                    <td title={tag.description || ""}>
                                        {tag.description ? truncate(tag.description, 30) : "-"}
                                    </td>
                                    <td>{new Date(tag.createdAt).toLocaleDateString()}</td>
                                    <td>{new Date(tag.updatedAt).toLocaleDateString()}</td>
                                    <td className="text-end d-flex gap-2 justify-content-end">
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => handleEdit(tag)}
                                        >
                                            <IconPencil size={16} />
                                        </button>
                                        <button
                                            className="btn btn-icon btn-sm btn-outline-danger"
                                            onClick={() =>
                                                selectedTags.length > 1
                                                    ? toast.warn(
                                                        "Vous avez plusieurs tags sélectionnés. Utilisez le bouton de suppression multiple."
                                                    )
                                                    : confirmDelete(tag._id)
                                            }
                                            title="Supprimer"
                                            aria-label="Supprimer"
                                        >
                                            <IconTrash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {tags.length > 0 && (
                    <div className="card-footer">
                        <Pagination
                            pageCount={pageCount}
                            onPageChange={({ selected }) => setCurrentPage(selected)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
