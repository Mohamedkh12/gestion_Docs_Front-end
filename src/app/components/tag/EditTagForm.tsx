"use client";

import { useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { HexColorPicker } from "react-colorful";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tagUpdateSchema } from "@/app/types/tagUpdateSchema";

interface EditTagFormProps {
    tag: {
        _id: string;
        name: string;
        color: string;
        description?: string;
    };
    onClose: () => void;
    onUpdate: (tag: any) => void;
}

type FormData = {
    name?: string;
    description?: string;
};

export default function EditTagForm({ tag, onClose, onUpdate }: EditTagFormProps) {
    const [color, setColor] = useState(tag.color);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(tagUpdateSchema),
        defaultValues: {
            name: tag.name || "",
            description: tag.description || "",
        },
    });

    const onSubmit = async (data: FormData) => {
        try {
            const payload: any = { color };

            if (data.name !== undefined && data.name !== tag.name) {
                payload.name = data.name;
            }
            if (data.description !== undefined && data.description !== tag.description) {
                payload.description = data.description;
            }

            if (Object.keys(payload).length === 0) {
                toast.info("Aucun changement détecté.");
                return;
            }

            const response = await api.put(`/api/tag/updateTag/${tag._id}`, payload);
            onUpdate(response.data);
            toast.success("Tag mis à jour");
            onClose();
        } catch (error: any) {
            if (error?.response?.status === 409) {
                toast.warn("Ce nom de tag existe déjà");
            } else {
                toast.error("Erreur lors de la mise à jour");
            }
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3 className="mb-4 text-center fw-bold">Modifier le Tag</h3>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="mb-3">
                        <label className="form-label">Nom</label>
                        <input
                            type="text"
                            className={`form-control rounded-3 shadow-sm ${errors.name ? "is-invalid" : ""}`}
                            {...register("name")}
                            disabled={isSubmitting}
                        />
                        {errors.name && <small className="text-danger">{errors.name.message}</small>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className={`form-control rounded-3 shadow-sm ${errors.description ? "is-invalid" : ""}`}
                            rows={2}
                            {...register("description")}
                            disabled={isSubmitting}
                        />
                        {errors.description && <small className="text-danger">{errors.description.message}</small>}
                    </div>

                    <div className="mb-3 mt-2">
                        <label>Couleur</label>
                        <HexColorPicker color={color} onChange={setColor} />
                        <div className="d-flex align-items-center gap-2 mt-3">
                            <div
                                style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%",
                                    backgroundColor: color,
                                    border: "1px solid #ccc",
                                }}
                            />
                            <span>{color}</span>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            Sauvegarder
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
