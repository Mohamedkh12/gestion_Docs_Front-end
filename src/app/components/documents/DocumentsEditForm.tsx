"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import AddCategoryForm from "@/app/components/categories/AddCategoryForm";
import AddTagForm from "@/app/components/tag/AddTagForm";
import TagSearchSelect, { TagOption } from "@/app/components/tag/TagSearchSelect";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { MultiValue } from "react-select";

export default function DocumentEditForm({ document, onClose, onUpdated }) {
    const [categories, setCategories] = useState([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddTag, setShowAddTag] = useState(false);
    const [selectedTags, setSelectedTags] = useState<MultiValue<TagOption>>([]);
    const [fileChanged, setFileChanged] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: document.title || "",
            description: document.description || "",
            categoryId: document.category?._id || "",
            file: null,
        },
    });

    const watchedFile = watch("file");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, tagRes] = await Promise.all([
                    api.get("/api/category/listeCategories"),
                    api.get("/api/tag/getAllTags"),
                ]);
                setCategories(catRes.data);

                const selected = document.tags?.map((tag) => ({
                    value: tag._id,
                    label: tag.name,
                    color: tag.color || "#999",
                })) || [];
                setSelectedTags(selected);
            } catch {
                toast.error("Erreur lors du chargement des catégories ou tags");
            }
        };
        fetchData();
    }, [document]);

    useEffect(() => {
        if (watchedFile && watchedFile.length > 0) {
            setFileChanged(true);
        }
    }, [watchedFile]);

    const onSubmit = async (data) => {
        if (fileChanged) {
            const formData = new FormData();
            formData.append("file", data.file[0]);
            formData.append("title", data.title);
            formData.append("description", data.description || "");
            formData.append("categoryId", data.categoryId);
            formData.append("tags", JSON.stringify(selectedTags.map((t) => t.value)));
            formData.append("type", data.file[0].type);

            try {
                const res = await api.put(`/api/document/updateDocuments/${document._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("fichier mis à jour !");
                onUpdated(res.data);
                onClose();
            } catch {
                toast.error("Erreur lors de la mise à jour avec fichier");
            }
            return;
        }

        const payload: any = {};
        if (data.title && data.title !== document.title) payload.title = data.title;
        if (data.description !== document.description) payload.description = data.description;
        if (data.categoryId && data.categoryId !== document.category?._id) payload.categoryId = data.categoryId;

        const selectedTagIds = selectedTags.map((t) => t.value).sort();
        const originalTagIds = (document.tags?.map((t) => t._id) || []).sort();

        if (JSON.stringify(selectedTagIds) !== JSON.stringify(originalTagIds)) {
            payload.tags = JSON.stringify(selectedTagIds);
        }

        if (Object.keys(payload).length === 0) {
            toast.info("Aucun changement détecté.");
            return;
        }

        try {
            const res = await api.put(`/api/document/updateDocuments/${document._id}`, payload);
            toast.success("Document mis à jour !");
            onUpdated(res.data);
            onClose();
        } catch {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3 className="mb-4 text-center fw-bold">Modifier un document</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">
                    <div>
                        <label className="form-label">
                            Titre <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control rounded-3 shadow-sm ${errors.title ? "is-invalid" : ""}`}
                            {...register("title", { required: "Le titre est requis" })}
                        />
                        {errors.title?.message && <div className="invalid-feedback d-block">{String(errors.title.message)}</div>}
                    </div>

                    <div>
                        <label className="form-label">Description</label>
                        <textarea
                            className={`form-control rounded-3 shadow-sm ${errors.description ? "is-invalid" : ""}`}
                            rows={3}
                            {...register("description")}
                        />
                        {errors.description?.message && <div className="invalid-feedback d-block">{String(errors.description.message)}</div>}
                    </div>

                    <div>
                        <label className="form-label">Catégorie</label>
                        <select
                            className="form-control rounded-3 shadow-sm"
                            {...register("categoryId")}
                            onChange={(e) => {
                                if (e.target.value === "create_new") {
                                    setShowAddCategory(true);
                                } else {
                                    setValue("categoryId", e.target.value);
                                }
                            }}
                        >
                            <option value="">-- Choisir une catégorie --</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.nomCat}
                                </option>
                            ))}
                            <option value="create_new">➕ Ajouter une nouvelle catégorie</option>
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Tags</label>
                        <TagSearchSelect selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm mt-2 d-flex align-items-center gap-1"
                            onClick={() => setShowAddTag(true)}
                        >
                            <IconPlus size={16} /> Ajouter un nouveau tag
                        </button>
                    </div>

                    <div>
                        <label className="form-label">Fichier</label>
                        <input
                            type="file"
                            className={`form-control rounded-3 shadow-sm ${errors.file ? "is-invalid" : ""}`}
                            {...register("file")}
                        />
                        {errors.file?.message && <div className="invalid-feedback d-block">{String(errors.file.message)}</div>}
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Mettre à jour
                        </button>
                    </div>
                </form>

                {showAddTag && (
                    <AddTagForm
                        onClose={() => setShowAddTag(false)}
                        onAdded={(newTag) => {
                            const newOption: TagOption = {
                                value: newTag._id,
                                label: newTag.name,
                                color: newTag.color || "#999",
                            };
                            setSelectedTags([...selectedTags, newOption]);
                            setShowAddTag(false);
                        }}
                    />
                )}

                {showAddCategory && (
                    <AddCategoryForm
                        onClose={() => setShowAddCategory(false)}
                        onAdded={(newCat) => {
                            setCategories((prev) => [...prev, newCat]);
                            setValue("categoryId", newCat._id);
                            setShowAddCategory(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
} as const;

const modalStyle = {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "650px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    overflow: "auto",
    maxHeight: "90vh",
} as const;
