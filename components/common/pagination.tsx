import React, { JSX } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
    totalDataCount: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

const PaginationCompo = ({
    totalDataCount,
    currentPage,
    itemsPerPage,
    onPageChange,
}: PaginationProps) => {
    const totalPages = Math.ceil(totalDataCount / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const renderPaginationItems = (): JSX.Element[] => {
        const items: JSX.Element[] = [];
        for (let page = 1; page <= totalPages; page++) {
            if (
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
            ) {
                items.push(
                    <PaginationItem key={page}>
                        <PaginationLink
                            className="font-semibold rounded-full border-primary/40"
                            href="#"
                            isActive={page === currentPage}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
                items.push(
                    <PaginationItem key={`ellipsis-${page}`}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
        }
        return items;
    };

    if (totalDataCount <= 10) {
        return null;
    }

    return (
        <Pagination>
            <PaginationContent>
                {currentPage > 1 && (
                    <PaginationItem>
                        <PaginationPrevious
                            className="font-semibold"
                            href="#"
                            onClick={() => handlePageChange(currentPage - 1)}
                        />
                    </PaginationItem>
                )}
                {renderPaginationItems()}
                {currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationNext
                            className="font-semibold"
                            href="#"
                            onClick={() => handlePageChange(currentPage + 1)}
                        />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationCompo;