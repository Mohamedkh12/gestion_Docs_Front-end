import { useEffect, useState } from "react";
import api from "@/lib/api";
import { IconFolder } from "@tabler/icons-react";

export default function CategorySummary({
                                            selectedCategoryId,
                                            onSelectCategory,
                                            refreshTrigger,
                                        }) {
    const [summary, setSummary] = useState([]);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get("/api/category/summary");
                setSummary(res.data);
            } catch (err) {
                console.error("Erreur lors du chargement du résumé des catégories :", err);
            }
        };
        fetchSummary();
    }, [refreshTrigger]);

    const handleClick = (catId) => {
        onSelectCategory(selectedCategoryId === catId ? null : catId);
    };

    return (
        <div className="mb-3 d-flex flex-wrap gap-3">
            {summary.length === 0 && <p className="text-muted">Aucune catégorie trouvée.</p>}

            {summary.map((cat) => {
                const isSelected = selectedCategoryId === cat._id;
                return (
                    <button
                        key={cat._id || "no-category"}
                        onClick={() => handleClick(cat._id || "no-category")}
                        className={`rounded-3 btn ${isSelected ? "btn-blue " : ""}`}
                        style={{
                            minWidth: "180px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1rem",
                        }}
                    >
                        <div className="d-flex align-items-center gap-1 mb-1">
                            <IconFolder size={18} />
                            <span className="fw-bold">{cat.name}</span>
                        </div>
                        <div className="lh-base">
                            {cat.count} fichier{cat.count > 1 ? "s" : ""}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
