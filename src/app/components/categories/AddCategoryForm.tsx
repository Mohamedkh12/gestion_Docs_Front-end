"use client";

import api from "@/lib/api";
import { toast } from "react-toastify";
import { z } from "zod";
import {categorySchema} from "@/app/types/CategorySchema";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

type categoryFormData = z.infer<typeof categorySchema>;


export default function AddCategoryForm({onClose,onAdded}){


    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<categoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            nomCat: "",
            description: "",
        },
    });

    const onSubmit = async (data: categoryFormData)=>{
        try {
            const reponse = await api.post("api/category/createCategories",data);
            onAdded(reponse.data)
            onClose()
            reset();
        }catch (e: any) {
            if (e?.response?.status === 409) {
                toast.warn("Catégorie déjà existante");
            } else {
                toast.error("Erreur lors de l'ajout");
            }
        }
    }

    return(
        <div  style={overlayStyle}>
            <div style={modalStyle}>
                <h3 className="mb-3 text-center fw-bold">Ajouter une catégorie</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={"mb-3"}>
                        <label className="form-label">Nom de la catégorie
                            <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type={"text"}
                            autoFocus
                            className="form-control rounded-3 shadow-sm"
                            {...register("nomCat")}
                        />
                        {errors.nomCat && (
                            <small className="text-danger">{errors.nomCat.message}</small>
                        )}
                    </div>
                    <div className={"mb-3"}>
                        <label className="form-label">
                            Description
                        </label>
                        <textarea
                            className="form-control rounded-3 shadow-sm"
                            rows={2}
                            {...register("description")}
                        />
                        {errors.description && (
                            <small className="text-danger">{errors.description.message}</small>
                        )}
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn btn-primary">Créer</button>
                    </div>
                </form>
            </div>
        </div>
    )
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
