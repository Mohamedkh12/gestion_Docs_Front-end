"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {IconInbox, IconDownload, IconPencil, IconTrash, IconEye, IconRefresh, IconArrowUp, IconArrowDown,} from "@tabler/icons-react";
import DocumentEditForm from "@/app/components/documents/DocumentsEditForm";
import AddDocumentForm from "@/app/components/documents/AddDocumentForm";
import CategorySummary from "@/app/components/categories/CategorySummary";
import DocumentSearchBar from "@/app/components/documents/DocumentSearchBar";
import { MultiValue } from "react-select";
import { TagOption } from "@/app/components/tag/TagSearchSelect";
import { toast } from "react-toastify";
import { showConfirmDialog } from "@/app/common/ConfirmDialog";
import Pagination ,{usePagination} from "@/app/common/UsePagination";
import { useSearchParams } from 'next/navigation';


export default function Documents() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [editDoc, setEditDoc] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<MultiValue<TagOption>>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [refreshSummary, setRefreshSummary] = useState(0);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const allSelected = selectedDocs.length === documents.length && documents.length > 0;

    const searchParams = useSearchParams();
    const externalUserId = searchParams.get("userId");

    useEffect(() => {
        fetchDocuments();
        resetPage();
    }, [query, selectedTags, selectedCategoryId]);

    useEffect(() => {
        fetchDocuments();
        resetPage();
    }, [sortConfig]);

    const {
        currentPage,
        setCurrentPage,
        paginatedItems: paginatedDocs,
        pageCount,
        resetPage,
    } = usePagination(documents, 10);
    const fetchDocuments = async () => {
        try {
            const params = new URLSearchParams();
            if (query.trim()) params.append("title", query.trim());
            if (selectedCategoryId) params.append("categoryId", selectedCategoryId);
            selectedTags.forEach(tag => params.append("tags", tag.value));

            if (externalUserId) {
                params.append("userId", externalUserId);
            }

            const res = await api.get(`/api/document/searchDocuments?${params.toString()}`);

            let fetchedDocs = res.data;

            if (sortConfig) {
                fetchedDocs = [...fetchedDocs].sort((a, b) => {
                    let aVal = a[sortConfig.key];
                    let bVal = b[sortConfig.key];

                    // Gestion spécial des dates
                    if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
                        aVal = new Date(aVal).getTime();
                        bVal = new Date(bVal).getTime();
                    }

                    // Gestion spécial catégorie (objet)
                    if (sortConfig.key === 'categoryId') {
                        aVal = aVal?.nomCat || "";
                        bVal = bVal?.nomCat || "";
                    }

                    // Gestion spécial tags (tableau) : tri par nombre de tags
                    if (sortConfig.key === 'tags') {
                        aVal = aVal?.length || 0;
                        bVal = bVal?.length || 0;
                    }

                    // Gestion null / undefined
                    if (aVal == null) return 1;
                    if (bVal == null) return -1;

                    // Tri chaînes de caractères
                    if (typeof aVal === "string" && typeof bVal === "string") {
                        return sortConfig.direction === "asc"
                            ? aVal.localeCompare(bVal)
                            : bVal.localeCompare(aVal);
                    }

                    // Tri numérique (timestamps, nombres)
                    return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
                });
            }

            setDocuments(fetchedDocs);
            setCurrentPage(0);
        } catch (e) {
            console.error("Erreur recherche dynamique:", e);
        }
    };

    const confirmDelete = async (id?: string) => {
        if (id) {
            showConfirmDialog({
                message: "Voulez-vous vraiment supprimer ce fichier ?",
                onConfirm: () => handleDelete(id),
            });
        } else {
            showConfirmDialog({
                message: `Voulez-vous vraiment Supprimer ${selectedDocs.length} fichiers sélectionnés ?`,
                onConfirm: () => handleBulkDelete(),
            });
        }
    };


    const handleDelete = async (id: string) => {
        setLoadingId(id);
        try {
            await api.delete(`/api/document/deleteDocuments/${id}`);
            toast.success("fichier supprimée !");
            setDocuments((prev) => prev.filter((doc) => doc._id !== id));
            setRefreshSummary((prev) => prev + 1);
        } catch (e) {
            toast.error("Erreur lors de la suppression multiple");
        }finally {
            setLoadingId(null);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedDocs.map(id => api.delete(`/api/document/deleteDocuments/${id}`)));
            toast.success(`${selectedDocs.length} fichiers supprimés !`);
            setDocuments((prev) => prev.filter((doc) => !selectedDocs.includes(doc._id)));
            setSelectedDocs([]);
            setRefreshSummary((prev) => prev + 1);
        } catch (e) {
            toast.error("Erreur lors de la suppression multiple");
        }
    };

    const toggleSelectAll = () => {
        setSelectedDocs(allSelected ? [] : documents.map(doc => doc._id));
    };

    const toggleSelectDoc = (id: string) => {
        setSelectedDocs((prev) =>
            prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
        );
    };

    const handleResetFilters = () => {
        setQuery("");
        setSelectedTags([]);
        setSelectedCategoryId(null);
        setSortConfig(null);
    };

    const requestSort = (key: string) => {
        setSortConfig((prev) => {
            if (!prev || prev.key !== key) return { key, direction: "asc" };
            return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
        });
        setCurrentPage(0);
    };

    const getSortIcon = (key: string) => {
        return (
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
    };


    useEffect(() => {
        setRefreshSummary((prev) => prev + 1);
    }, []);

    return (
        <div className="page-wrapper">
            <div className="container-xl">
                <div className="row row-cards mt-4">
                    {/* Ajout / Édition de documents */}
                    {editDoc && (
                        <DocumentEditForm
                            document={editDoc}
                            onClose={() => setEditDoc(null)}
                            onUpdated={(doc) => {
                                setDocuments((prev) => prev.map((d) => (d._id === doc._id ? doc : d)));
                                setRefreshSummary((prev) => prev + 1);
                            }}
                        />
                    )}

                    {showAddForm && (
                        <AddDocumentForm
                            onClose={() => setShowAddForm(false)}
                            onAdded={(doc) => {
                                setDocuments((prev) => [doc, ...prev]);
                                setRefreshSummary((prev) => prev + 1);
                            }}
                        />
                    )}

                    {/* Catégories */}
                    <div className="col-12 mb-3">
                        <CategorySummary
                            selectedCategoryId={selectedCategoryId}
                            onSelectCategory={(id) => setSelectedCategoryId(id)}
                            refreshTrigger={refreshSummary}
                        />
                    </div>

                    {/* Barre de recherche & actions */}
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h3 className="card-title mb-0">
                                    {selectedCategoryId ? "Documents filtrés par catégorie" : "Tous les documents"}
                                </h3>
                                <div className="btn-list">
                                    <button className="btn btn-outline-secondary" onClick={handleResetFilters}>
                                        <IconRefresh size={16} className="me-1" /> Réinitialiser
                                    </button>
                                    <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                                        <IconDownload size={16} className="me-1" /> Importer
                                    </button>
                                </div>
                            </div>

                            <div className="card-body border-bottom pb-2">
                                <div className="d-flex justify-between align-items-center gap-2">
                                    {selectedDocs.length > 1 && (
                                        <button className="btn btn-danger" onClick={() => confirmDelete()}>
                                            <IconTrash size={16} className="me-1" />
                                            Supprimer sélection ({selectedDocs.length})
                                        </button>
                                    )}
                                    <div className="flex-fill text-end">
                                        <DocumentSearchBar
                                            query={query}
                                            setQuery={setQuery}
                                            selectedTags={selectedTags}
                                            setSelectedTags={setSelectedTags}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tableau de documents */}
                            <div className="table-responsive">
                                {documents.length === 0 ? (
                                    <div className="text-center py-5">
                                        <IconInbox size={48} className="text-muted mb-2" />
                                        <p className="text-muted">Aucun document trouvé</p>
                                    </div>
                                ) : (
                                    <table className="table table-sm table-hover card-table table-vcenter align-middle">
                                        <thead className="bg-light text-muted small">
                                        <tr>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={toggleSelectAll}
                                                    title="Tout sélectionner"
                                                />
                                            </th>
                                            <th
                                                style={{ width: "14%", cursor: "pointer" }}
                                                onClick={() => requestSort("title")}
                                            >
                                                Titre {getSortIcon("title")}
                                            </th>
                                            <th
                                                style={{ width: "23%", cursor: "pointer" }}
                                                onClick={() => requestSort("description")}
                                            >
                                                Description {getSortIcon("description")}
                                            </th>
                                            <th
                                                style={{ width: "8%", cursor: "pointer" }}
                                                onClick={() => requestSort("type")}
                                            >
                                                Type {getSortIcon("type")}
                                            </th>
                                            <th
                                                style={{ width: "12%", cursor: "pointer" }}
                                                onClick={() => requestSort("createdAt")}
                                            >
                                                Créé {getSortIcon("createdAt")}
                                            </th>
                                            <th
                                                style={{ width: "12%", cursor: "pointer" }}
                                                onClick={() => requestSort("updatedAt")}
                                            >
                                                Mis à jour {getSortIcon("updatedAt")}
                                            </th>
                                            <th
                                                style={{ width: "20%", cursor: "pointer" }}
                                                onClick={() => requestSort("tags")}
                                            >
                                                Tags {getSortIcon("tags")}
                                            </th>
                                            <th
                                                style={{ width: "10%", cursor: "pointer" }}
                                                onClick={() => requestSort("categoryId")}
                                            >
                                                Catégorie {getSortIcon("categoryId")}
                                            </th>
                                            <th style={{ width: "10%" }} className="text-end">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {paginatedDocs.map((doc, index) => (
                                            <tr
                                                key={doc._id ?? doc.id ?? `row-${index}`}
                                                style={{ height: "60px" }}
                                                className="align-middle"
                                            >
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDocs.includes(doc._id)}
                                                        onChange={() => toggleSelectDoc(doc._id)}
                                                        title="Sélectionner"
                                                    />
                                                </td>
                                                <td className="fw-semibold text-primary">{doc.title}</td>
                                                <td className="text-muted" style={{ maxWidth: "200px" }}>
                                                    <div className="text-truncate" title={doc.description || "N/A"}>
                                                        {doc.description || "N/A"}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-blue-lt text-blue">{doc.type}</span>
                                                </td>
                                                <td className="text-muted small">
                                                    {new Date(doc.createdAt).toLocaleDateString("fr-FR", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="text-muted small">
                                                    {new Date(doc.updatedAt).toLocaleDateString("fr-FR", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {doc.tags?.length > 0 ? (
                                                            doc.tags.map((tag, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="badge rounded-pill"
                                                                    style={{
                                                                        backgroundColor: tag.color || "#e0e0e0",
                                                                        color: "#fff",
                                                                        fontSize: "0.7rem",
                                                                        padding: "0.3em 0.6em",
                                                                    }}
                                                                    title={tag.name}
                                                                >
                                                                     {tag.name}
                                                                 </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted small">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="small">{doc.categoryId?.nomCat || "N/A"}</td>
                                                <td className="text-end">
                                                    <div className="d-flex gap-1 justify-content-end">
                                                        <button
                                                            className="btn btn-icon btn-sm btn-outline-primary"
                                                            onClick={() => setEditDoc(doc)}
                                                            title="Modifier"
                                                            aria-label="Modifier"
                                                        >
                                                            <IconPencil size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-icon btn-sm btn-outline-danger"
                                                            onClick={() => {
                                                                if (selectedDocs.length > 1) {
                                                                    toast.warn("Vous avez plusieurs fichiers sélectionnés. Utilisez le bouton de suppression multiple.");
                                                                } else {
                                                                    confirmDelete(doc._id);
                                                                }
                                                            }}
                                                            title="Supprimer"
                                                            aria-label="Supprimer"
                                                        >
                                                            <IconTrash size={16} />
                                                        </button>

                                                        <a
                                                            className="btn btn-icon btn-sm btn-outline-success"
                                                            href={`http://localhost:4000/${doc.fileUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Afficher"
                                                            aria-label="Afficher"
                                                        >
                                                            <IconEye size={16} />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Pagination */}
                            {documents.length > 0 && (
                                <div className="card-footer">
                                    <Pagination
                                        pageCount={pageCount}
                                        onPageChange={({ selected }) => setCurrentPage(selected)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
