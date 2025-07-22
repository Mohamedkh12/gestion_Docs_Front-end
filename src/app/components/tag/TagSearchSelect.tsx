"use client";

import { useCallback, useState, useEffect } from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import { MultiValue, StylesConfig } from "react-select";
import api from "@/lib/api";
import { toast } from "react-toastify";
import AddTagForm from "@/app/components/tag/AddTagForm";

export interface TagOption {
    value: string;
    label: string;
    color: string;
}

export default function TagSearchSelect({
                                            selectedTags,
                                            setSelectedTags,
                                        }: {
    selectedTags: MultiValue<TagOption>;
    setSelectedTags: (value: MultiValue<TagOption>) => void;
}) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [cachedOptions, setCachedOptions] = useState<TagOption[]>([]);

    useEffect(() => {
        async function fetchInitialTags() {
            try {
                const res = await api.get("/api/tag/getAllTags");
                const options = res.data.map((tag: any) => ({
                    value: tag._id,
                    label: tag.name,
                    color: tag.color || "#ccc",
                }));
                setCachedOptions(options);
            } catch (err) {
                toast.error("Erreur lors du chargement initial des tags");
            }
        }
        fetchInitialTags();
    }, []);

    // Fonction appelée à chaque recherche
    const loadOptions = useCallback(
        async (inputValue: string): Promise<TagOption[]> => {
            try {
                const res = await api.get(`/api/tag/searchTag?q=${inputValue}`);
                const options = res.data.map((tag: any) => ({
                    value: tag._id,
                    label: tag.name,
                    color: tag.color || "#ccc",
                }));

                // Mettre à jour cache local sans doublons
                setCachedOptions((prev) => {
                    const map = new Map(prev.map((o) => [o.value, o]));
                    options.forEach((opt) => map.set(opt.value, opt));
                    return Array.from(map.values());
                });

                return options;
            } catch (err) {
                toast.error("Erreur lors de la recherche de tags");
                return [];
            }
        },
        []
    );

    // Lorsqu'on crée un tag, ouvrir la modale avec nom pré-rempli
    const handleCreate = (inputValue: string) => {
        setNewTagName(inputValue);
        setShowCreateModal(true);
    };

    // Quand un tag est ajouté via modal, on l'ajoute au cache ET à la sélection
    const handleTagAdded = (newTag: any) => {
        const newOption: TagOption = {
            value: newTag._id,
            label: newTag.name,
            color: newTag.color || "#ccc",
        };
        setCachedOptions((prev) => {
            if (prev.find((t) => t.value === newOption.value)) return prev;
            return [...prev, newOption];
        });

        if (!selectedTags.find((t) => t.value === newOption.value)) {
            setSelectedTags([...selectedTags, newOption]);
        }
    };

    const customStyles: StylesConfig<TagOption, true> = {
        multiValue: (styles, { data }) => ({
            ...styles,
            backgroundColor: data.color,
            color: "#fff",
        }),
        multiValueLabel: (styles) => ({ ...styles, color: "#fff" }),
        multiValueRemove: (styles) => ({
            ...styles,
            color: "#fff",
            ":hover": { backgroundColor: "#000", color: "#fff" },
        }),
        menuList: (styles) => ({
            ...styles,
            maxHeight: 200,
            overflowY: "auto",
        }),
    };

    return (
        <>
            <AsyncCreatableSelect
                isMulti
                cacheOptions
                defaultOptions={cachedOptions}
                value={selectedTags}
                onChange={setSelectedTags}
                loadOptions={loadOptions}
                onCreateOption={handleCreate}
                styles={customStyles}
                placeholder="Filtrer ou créer un tag"
                noOptionsMessage={() => "Aucun tag trouvé"}
                formatCreateLabel={(inputValue) => `Créer le tag "${inputValue}"`}
            />

            {showCreateModal && (
                <AddTagForm
                    initialName={newTagName}
                    onClose={() => setShowCreateModal(false)}
                    onAdded={(tag) => {
                        handleTagAdded(tag);
                        setShowCreateModal(false);
                    }}
                />
            )}
        </>
    );
}
