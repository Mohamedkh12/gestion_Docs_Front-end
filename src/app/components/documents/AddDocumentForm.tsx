"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import AddCategoryForm from "@/app/components/categories/AddCategoryForm";
import AddTagForm from "@/app/components/tag/AddTagForm";
import TagSearchSelect, { TagOption } from "@/app/components/tag/TagSearchSelect";
import { IconPlus } from "@tabler/icons-react";
import { MultiValue } from "react-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentSchema, DocumentSchemaType } from "@/app/types/document.Schema";

export default function AddDocumentForm({ onClose, onAdded }) {
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [selectedTags, setSelectedTags] = useState<MultiValue<TagOption>>([]);
    const [showAddTag, setShowAddTag] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<DocumentSchemaType>({
        resolver: zodResolver(documentSchema),
    });

    const watchedFile = watch("file");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/api/category/listeCategories");
                setCategories(res.data);
            } catch {
                toast.error("Erreur chargement catégories");
            }
        };
        fetchCategories();
    }, []);

    const onSubmit = async (data: DocumentSchemaType) => {
        const formData = new FormData();
        formData.append("file", data.file);
        formData.append("title", data.title);
        formData.append("description", data.description || "");
        formData.append("categoryId", categoryId);
        formData.append("tags", JSON.stringify(selectedTags.map((tag) => tag.value)));
        formData.append("type", data.file.type);

        try {
            const res = await api.post("/api/document/createDocument", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("fichier ajouté !");
            onAdded(res.data);
            onClose();
            reset();
        } catch {
            toast.error("Erreur lors de l'ajout");
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3 className="mb-4 text-center fw-bold">Ajouter un document</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">
                    <div>
                        <label className="form-label">
                            Titre <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control rounded-3 shadow-sm ${errors.title ? "is-invalid" : ""}`}
                            {...register("title")}
                        />
                        {errors.title && <div className="invalid-feedback d-block">{errors.title.message}</div>}
                    </div>

                    <div>
                        <label className="form-label">Description</label>
                        <textarea
                            className={`form-control rounded-3 shadow-sm ${errors.description ? "is-invalid" : ""}`}
                            rows={3}
                            {...register("description")}
                        />
                        {errors.description && <div className="invalid-feedback d-block">{errors.description.message}</div>}
                    </div>

                    <div>
                        <label className="form-label">Catégorie</label>
                        <select
                            className="form-control rounded-3 shadow-sm"
                            value={categoryId}
                            onChange={(e) => {
                                if (e.target.value === "create_new") setShowAddCategory(true);
                                else setCategoryId(e.target.value);
                            }}
                        >
                            <option value="">-- Choisir une catégorie --</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.nomCat}</option>
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
                        <label className="form-label">
                            Fichier <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="file"
                            className={`form-control rounded-3 shadow-sm ${errors.file ? "is-invalid" : ""}`}
                            onChange={(e) => {
                                const selectedFile = e.target.files?.[0] || null;
                                if (selectedFile) {
                                    setValue("file", selectedFile, { shouldValidate: true });
                                }
                            }}
                        />
                        {errors.file && <div className="invalid-feedback d-block">{errors.file.message}</div>}
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn btn-primary">Créer</button>
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
                            setSelectedTags((prev) => [...prev, newOption]);
                            setShowAddTag(false);
                        }}
                    />
                )}


                {showAddCategory && (
                    <AddCategoryForm
                        onClose={() => setShowAddCategory(false)}
                        onAdded={(newCat) => {
                            setCategories((prev) => [...prev, newCat]);
                            setCategoryId(newCat._id);
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
    zIndex: 1000,
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
