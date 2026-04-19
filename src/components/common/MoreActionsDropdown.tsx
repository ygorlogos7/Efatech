"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, MoreHorizontal, ChevronRight } from "lucide-react";

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  subItems?: ActionItem[];
  variant?: "danger" | "default";
}

interface MoreActionsDropdownProps {
  actions: ActionItem[];
  label?: string;
  variant?: "button" | "icon" | "row";
}

export function MoreActionsDropdown({ actions, label = "Mais ações", variant = "button" }: MoreActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {variant === "button" && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 transition-colors text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm"
        >
          {label}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {variant === "icon" && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      )}

      {variant === "row" && (
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-[30px] h-[30px] bg-[#00a65a] hover:bg-[#008d4c] text-white rounded-[3px] transition-colors shadow-sm"
            title="Mais ações"
        >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[100] focus:outline-none animate-in fade-in zoom-in-95 duration-100 origin-top-right border border-gray-100">
          <div className="py-1" role="menu shadow-2xl">
            {actions.map((action, index) => (
              <DropdownItem key={index} action={action} closeParent={() => setIsOpen(false)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({ action, closeParent }: { action: ActionItem; closeParent: () => void }) {
  const [isSubOpen, setIsSubOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const hasSubItems = action.subItems && action.subItems.length > 0;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsSubOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsSubOpen(false);
    }, 100);
  };

  const content = (
    <div 
        className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors w-full text-left font-medium
            ${action.variant === "danger" ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
        `}
    >
      <div className="flex items-center">
        {action.icon && <span className={`mr-3 ${action.variant === "danger" ? "text-red-400" : "text-gray-400 group-hover:text-gray-600"}`}>{action.icon}</span>}
        {action.label}
      </div>
      {hasSubItems && <ChevronRight className="w-4 h-4 text-gray-400" />}
    </div>
  );

  return (
    <div 
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
    >
      {action.href && !hasSubItems ? (
        <a href={action.href} onClick={closeParent} className="block" role="menuitem">
          {content}
        </a>
      ) : (
        <button
          onClick={() => {
            if (!hasSubItems && action.onClick) {
                action.onClick();
                closeParent();
            }
          }}
          className="block w-full"
          role="menuitem"
        >
          {content}
        </button>
      )}

      {hasSubItems && isSubOpen && (
        <div className="absolute top-0 right-full mr-0.5 w-48 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-[110] animate-in fade-in slide-in-from-right-1 duration-150 border border-gray-100">
          <div className="py-1">
            {action.subItems!.map((sub, idx) => (
              <DropdownItem key={idx} action={sub} closeParent={closeParent} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
