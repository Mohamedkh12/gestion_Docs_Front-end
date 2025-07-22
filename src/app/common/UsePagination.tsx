"use client";

import { useState, useMemo } from "react";
import ReactPaginate from "react-paginate";
import React from "react";

interface UsePaginationResult<T> {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    paginatedItems: T[];
    pageCount: number;
    resetPage: () => void;
}

export function usePagination<T>(items: T[], itemsPerPage: number): UsePaginationResult<T> {
    const [currentPage, setCurrentPage] = useState(0);

    const paginatedItems = useMemo(() => {
        const start = currentPage * itemsPerPage;
        return items.slice(start, start + itemsPerPage);
    }, [items, currentPage, itemsPerPage]);

    const pageCount = Math.ceil(items.length / itemsPerPage);

    const resetPage = () => setCurrentPage(0);

    return {
        currentPage,
        setCurrentPage,
        paginatedItems,
        pageCount,
        resetPage,
    };
}

interface PaginationProps {
    pageCount: number;
    onPageChange: (selectedItem: { selected: number }) => void;
}

export default function Pagination({ pageCount, onPageChange }: PaginationProps) {
    return (
        <ReactPaginate
            previousLabel={"← Précédent"}
            nextLabel={"Suivant →"}
            pageCount={pageCount}
            onPageChange={onPageChange}
            containerClassName="pagination m-0 justify-content-center"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            activeClassName="active"
            disabledClassName="disabled"
            breakLabel="..."
            breakClassName="page-item disabled"
            breakLinkClassName="page-link"
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
        />
    );
}
