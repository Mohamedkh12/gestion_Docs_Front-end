"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HexColorPicker } from "react-colorful";
import { tagSchema } from "@/app/types/Tag.Schema";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { z } from "zod";

type TagFormData = z.infer<typeof tagSchema>;

export default function AddTagForm({
                                       onClose,
                                       onAdded,
                                       initialName = "",
                                   }: {
    onClose: () => void;
    onAdded: (tag: any) => void;
    initialName?: string;
}) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TagFormData>({
        resolver: zodResolver(tagSchema),
        defaultValues: {
            name: initialName,
            description: "",
            color: "#3b82f6",
        },
    });

    const color = watch("color");

    useEffect(() => {
        setValue("name", initialName);
    }, [initialName, setValue]);

    const onSubmit = async (data: TagFormData) => {
        try {
            const response = await api.post("/api/tag/createTags", data);
            onAdded(response.data);
            onClose();
        } catch (e: any) {
            if (e.response?.status === 409) {
                toast.warn("Ce tag existe déjà.");
            } else {
                toast.error("Erreur lors de la création du tag.");
            }
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3 className="mb-4 text-center fw-bold">Ajouter un Tag</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label className="form-label">
                            Nom<span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control rounded-3 shadow-sm"
                            {...register("name")}
                        />
                        {errors.name && (
                            <small className="text-danger">{errors.name.message}</small>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control rounded-3 shadow-sm"
                            rows={2}
                            {...register("description")}
                        />
                        {errors.description && (
                            <small className="text-danger">{errors.description.message}</small>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Couleur</label>
                        <HexColorPicker
                            color={color}
                            onChange={(val) => setValue("color", val)}
                        />
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
                        {errors.color && (
                            <small className="text-danger">{errors.color.message}</small>
                        )}
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Créer
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
