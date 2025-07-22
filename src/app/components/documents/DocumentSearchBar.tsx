"use client";

import TagSearchSelect, { TagOption } from "@/app/components/tag/TagSearchSelect";
import { MultiValue } from "react-select";

interface Props {
    query: string;
    setQuery: (q: string) => void;
    selectedTags: MultiValue<TagOption>;
    setSelectedTags: (tags: MultiValue<TagOption>) => void;
}

export default function DocumentSearchBar({
                                              query,
                                              setQuery,
                                              selectedTags,
                                              setSelectedTags,
                                          }: Props) {
    return (
        <div className="d-flex justify-content-end mb-3">
            <div
                className="d-flex gap-3 flex-wrap"
                style={{
                    maxWidth: "500px",
                    width: "100%",
                }}
            >
                <input
                    type="text"
                    className="form-control"
                    style={{ minWidth: "180px", flex: 2 }}
                    placeholder="Rechercher par titre..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                <div style={{ minWidth: "200px", flex: 1 }}>
                    <TagSearchSelect
                        selectedTags={selectedTags}
                        setSelectedTags={setSelectedTags}
                    />
                </div>
            </div>
        </div>
    );
}

