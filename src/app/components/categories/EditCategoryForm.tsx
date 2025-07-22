"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryUpdateSchema } from "@/app/types/CategoryUpdateSchema";
import { z } from "zod";
import { toast } from "react-toastify";
import api from "@/lib/api";

type CategoryUpdateType = z.infer<typeof categoryUpdateSchema>;

export default function EditCategoryForm({ category, onClose, onUpdated }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<CategoryUpdateType>({
        resolver: zodResolver(categoryUpdateSchema),
        defaultValues: {
            name: category.nomCat || "",
            description: category.description || "",
        },
    });

    const onSubmit = async (data: CategoryUpdateType) => {
        try {
            const response = await api.put(`/api/category/updateCategory/${category._id}`, {
                nomCat: data.name?.trim(),
                description: data.description?.trim(),
            });

            toast.success("Catégorie mise à jour !");
            onUpdated(response.data);
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                toast.warn(err.response.data?.error || "Catégorie déjà existante");
                setError("name", {
                    type: "manual",
                    message: err.response.data?.error || "Ce nom est déjà pris",
                });
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h4 className="mb-3 text-center fw-bold ">Modifier la catégorie</h4>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label className="form-label">Nom de la catégorie</label>
                        <input
                            type="text"
                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                            {...register("name")}
                        />
                        {errors.name && (
                            <div className="invalid-feedback">{errors.name.message}</div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className={`form-control ${errors.description ? "is-invalid" : ""}`}
                            rows={3}
                            {...register("description")}
                        />
                        {errors.description && (
                            <div className="invalid-feedback">{errors.description.message}</div>
                        )}
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Enregistrer
                        </button>
                    </div>
                </form>
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
    borderRadius: "10px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
} as const;
