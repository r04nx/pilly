'use client';

import React from 'react';
import { 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Download, 
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete?: () => void;
  onToggleStatus?: (status: boolean) => void;
  onExport?: () => void;
  actions?: React.ReactNode;
}

export function BulkActionToolbar({
  selectedCount,
  onClearSelection,
  onDelete,
  onToggleStatus,
  onExport,
  actions
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-4 min-w-[320px] md:min-w-[450px]">
        {/* Selection Count Badge */}
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
          {selectedCount}
          <span className="hidden md:inline">Selected</span>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        {/* Actions Group */}
        <div className="flex items-center gap-1 md:gap-2 flex-1">
          <TooltipProvider>
            {onToggleStatus && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onToggleStatus(true)}
                      className="h-9 w-9 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Activate Selected</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onToggleStatus(false)}
                      className="h-9 w-9 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                    >
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Deactivate Selected</TooltipContent>
                </Tooltip>
              </>
            )}

            {onExport && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onExport}
                    className="h-9 w-9 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export Selection</TooltipContent>
              </Tooltip>
            )}

            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onDelete}
                    className="h-9 w-9 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Permanently</TooltipContent>
              </Tooltip>
            )}

            {actions}
          </TooltipProvider>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        {/* Clear Selection */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearSelection}
          className="text-gray-400 hover:text-white hover:bg-white/10 h-9 px-3"
        >
          <span className="hidden md:inline mr-2">Clear Selection</span>
          <X className="w-4 h-4 md:hidden" />
          <div className="hidden md:block">
             <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-gray-700 bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100">
                ESC
             </kbd>
          </div>
        </Button>
      </div>
    </div>
  );
}
