"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import {
    IconPlus,
    IconPencil,
    IconTrash,
    IconInbox,
    IconArrowUp,
    IconArrowDown,
} from "@tabler/icons-react";
import AddCategoryForm from "@/app/components/categories/AddCategoryForm";
import EditCategoryForm from "@/app/components/categories/EditCategoryForm";
import { showConfirmDialog } from "@/app/common/ConfirmDialog";
import Pagination, { usePagination } from "@/app/common/UsePagination";
import {useSearchParams} from "next/navigation";

interface Category {
    _id: string;
    nomCat: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export default function CategoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const allSelected = selectedCategories.length === categories.length && categories.length > 0;
    const searchParams = useSearchParams();
    const externalUserId = searchParams.get("userId");

    const sortedCategories = [...categories].sort((a, b) => {
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
        paginatedItems: paginatedCategories,
        pageCount,
        resetPage,
    } = usePagination(sortedCategories, 10);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        resetPage(); // Reset page to 0 on sort change
    }, [sortConfig]);

    const fetchCategories = async () => {
        try {
            const params = new URLSearchParams();
            if (externalUserId) {
                params.append("userId", externalUserId);
            }
            const result = await api.get("/api/category/listeCategories");
            setCategories(result.data);
            setCurrentPage(0);
        } catch (e) {
            console.error("Erreur lors du chargement des catégories", e);
            toast.error("Erreur lors du chargement des catégories");
        }
    };

    const requestSort = (key: keyof Category) => {
        setSortConfig((prev) => {
            if (!prev || prev.key !== key) return { key, direction: "asc" };
            return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
        });
    };

    const getSortIcon = (key: keyof Category) => (
        <>
            <IconArrowUp
                size={14}
                className={`ms-1 ${sortConfig?.key === key && sortConfig.direction === "asc"
                    ? "text-primary"
                    : "text-muted opacity-50"
                }`}
            />
            <IconArrowDown
                size={14}
                className={`ms-1 ${sortConfig?.key === key && sortConfig.direction === "desc"
                    ? "text-primary"
                    : "text-muted opacity-50"
                }`}
            />
        </>
    );

    const confirmDelete = (id?: string) => {
        showConfirmDialog({
            message: id
                ? "Voulez-vous vraiment supprimer cette catégorie ?"
                : `Supprimer ${selectedCategories.length} catégories sélectionnées ?`,
            onConfirm: () => (id ? handleDelete(id) : handleBulkDelete()),
        });
    };

    const toggleSelectAll = () => {
        setSelectedCategories(allSelected ? [] : categories.map((cat) => cat._id));
    };

    const toggleSelectCategory = (id: string) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
        );
    };

    const handleDelete = async (id: string) => {
        setLoadingId(id);
        try {
            await api.delete(`/api/category/deleteCategory/${id}`);
            toast.success("Catégorie supprimée !");
            fetchCategories();
        } catch (e) {
            toast.error("Erreur lors de la suppression");
        } finally {
            setLoadingId(null);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(
                selectedCategories.map((id) =>
                    api.delete(`/api/category/deleteCategory/${id}`)
                )
            );
            toast.success(`${selectedCategories.length} catégories supprimées !`);
            setSelectedCategories([]);
            fetchCategories();
        } catch (e) {
            toast.error("Erreur lors de la suppression multiple");
        }
    };

    const handleUpdate = (cat: Category) => {
        setSelectedCategory(cat);
        setShowEditModal(true);
    };

    const handleUpdateSuccess = (updatedCat: Category) => {
        setCategories((prev) =>
            prev.map((cat) => (cat._id === updatedCat._id ? updatedCat : cat))
        );
    };

    return (
        <div className="p-4">
            {showAddCategory && (
                <AddCategoryForm
                    onClose={() => setShowAddCategory(false)}
                    onAdded={(newCat) => {
                        toast.success(`Catégorie ${newCat.nomCat} ajoutée`);
                        setCategories((prev) => [...prev, newCat]);
                    }}
                />
            )}

            {showEditModal && selectedCategory && (
                <EditCategoryForm
                    category={selectedCategory}
                    onClose={() => setShowEditModal(false)}
                    onUpdated={handleUpdateSuccess}
                />
            )}

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h2 className="card-title m-0">Liste des Catégories</h2>
                    <div className="d-flex gap-2 align-items-center">
                        {selectedCategories.length > 1 && (
                            <button className="btn btn-danger" onClick={() => confirmDelete()}>
                                <IconTrash size={16} className="me-1" />
                                Supprimer sélection ({selectedCategories.length})
                            </button>
                        )}
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => setShowAddCategory(true)}
                        >
                            <IconPlus size={16} className="me-1" />
                            Ajouter une Catégorie
                        </button>
                    </div>
                </div>

                <div className="card-body p-0">
                    {categories.length === 0 ? (
                        <div className="text-center py-5">
                            <IconInbox size={48} className="text-muted mb-2" />
                            <p className="text-muted">Aucune catégorie trouvée.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
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
                                    <th style={{ cursor: "pointer" }} onClick={() => requestSort("nomCat")}>
                                        Nom {getSortIcon("nomCat")}
                                    </th>
                                    <th style={{ cursor: "pointer" }} onClick={() => requestSort("description")}>
                                        Description {getSortIcon("description")}
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
                                {paginatedCategories.map((cat) => (
                                    <tr key={cat._id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat._id)}
                                                onChange={() => toggleSelectCategory(cat._id)}
                                            />
                                        </td>
                                        <td>{cat.nomCat}</td>
                                        <td>{cat.description || "N/A"}</td>
                                        <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                                        <td>{new Date(cat.updatedAt).toLocaleDateString()}</td>
                                        <td className="text-end d-flex gap-2 justify-content-end">
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => handleUpdate(cat)}
                                            >
                                                <IconPencil size={16} />
                                            </button>
                                            <button
                                                className="btn btn-icon btn-sm btn-outline-danger"
                                                onClick={() =>
                                                    selectedCategories.length > 1
                                                        ? toast.warn(
                                                            "Plusieurs Category sélectionnés. Utilisez la suppression multiple."
                                                        )
                                                        : confirmDelete(cat._id)
                                                }
                                            >
                                                <IconTrash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {categories.length > 0 && (
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
