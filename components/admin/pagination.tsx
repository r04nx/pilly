import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function AdminPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className
}: AdminPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 print:hidden", className)}>
      <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
        Showing <span className="font-bold text-gray-900">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{' '}
        <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
        <span className="font-bold text-gray-900">{totalItems}</span> entries
      </div>
      
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-1 px-1">
          {getVisiblePages().map((page, i) => (
            <React.Fragment key={i}>
              {page === '...' ? (
                <div className="w-8 flex items-center justify-center text-gray-400">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "ghost"}
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    "h-8 w-8 p-0 rounded-lg text-sm font-bold transition-all",
                    currentPage === page 
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
