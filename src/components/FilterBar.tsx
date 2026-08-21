import React, { useState, useRef, useEffect } from 'react';
import {
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  User,
  Tag,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { FilterState, SwimlaneMode, TaskPriority, TaskStatus, TaskType, User as UserType, ViewMode } from '../types';
import { COMMON_LABELS, PRIORITIES, STATUSES, TYPES } from '../utils/constants';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  swimlaneMode: SwimlaneMode;
  onSwimlaneChange: (mode: SwimlaneMode) => void;
  viewMode: ViewMode;
  totalTasksCount: number;
  filteredTasksCount: number;
  allUsers?: UserType[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  swimlaneMode,
  onSwimlaneChange,
  viewMode,
  totalTasksCount,
  filteredTasksCount,
  allUsers = [],
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFiltersCount =
    filters.types.length +
    filters.priorities.length +
    filters.statuses.length +
    filters.assignees.length +
    filters.labels.length +
    (filters.search ? 1 : 0);

  const clearAllFilters = () => {
    onFilterChange({
      search: '',
      types: [],
      priorities: [],
      statuses: [],
      assignees: [],
      labels: [],
    });
  };

  const toggleType = (t: TaskType) => {
    const next = filters.types.includes(t)
      ? filters.types.filter((item) => item !== t)
      : [...filters.types, t];
    onFilterChange({ ...filters, types: next });
  };

  const togglePriority = (p: TaskPriority) => {
    const next = filters.priorities.includes(p)
      ? filters.priorities.filter((item) => item !== p)
      : [...filters.priorities, p];
    onFilterChange({ ...filters, priorities: next });
  };

  const toggleStatus = (s: TaskStatus) => {
    const next = filters.statuses.includes(s)
      ? filters.statuses.filter((item) => item !== s)
      : [...filters.statuses, s];
    onFilterChange({ ...filters, statuses: next });
  };

  const toggleAssignee = (id: string) => {
    const next = filters.assignees.includes(id)
      ? filters.assignees.filter((item) => item !== id)
      : [...filters.assignees, id];
    onFilterChange({ ...filters, assignees: next });
  };

  const toggleLabel = (l: string) => {
    const next = filters.labels.includes(l)
      ? filters.labels.filter((item) => item !== l)
      : [...filters.labels, l];
    onFilterChange({ ...filters, labels: next });
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap items-center justify-between gap-3 py-3 select-none"
    >
      {/* Left Filter Pill Buttons */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Type Filter Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              filters.types.length > 0
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300 font-semibold'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>Type</span>
            {filters.types.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-200 dark:bg-indigo-900 text-[10px]">
                {filters.types.length}
              </span>
            )}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {openDropdown === 'type' && (
            <div className="absolute left-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 z-40">
              {TYPES.map((t) => {
                const checked = filters.types.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleType(t.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-800 dark:text-slate-200">{t.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Priority Filter Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              filters.priorities.length > 0
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300 font-semibold'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>Priority</span>
            {filters.priorities.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-200 dark:bg-indigo-900 text-[10px]">
                {filters.priorities.length}
              </span>
            )}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {openDropdown === 'priority' && (
            <div className="absolute left-0 mt-1.5 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 z-40">
              {PRIORITIES.map((p) => {
                const checked = filters.priorities.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePriority(p.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-800 dark:text-slate-200">{p.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Assignee Filter Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'assignee' ? null : 'assignee')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              filters.assignees.length > 0
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300 font-semibold'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>Assignee</span>
            {filters.assignees.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-200 dark:bg-indigo-900 text-[10px]">
                {filters.assignees.length}
              </span>
            )}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {openDropdown === 'assignee' && (
            <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 z-40 max-h-60 overflow-y-auto">
              <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={filters.assignees.includes('unassigned')}
                  onChange={() => toggleAssignee('unassigned')}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-800 dark:text-slate-200">Unassigned</span>
              </label>

              {allUsers.map((u) => {
                const checked = filters.assignees.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAssignee(u.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full" />
                    <span className="text-slate-800 dark:text-slate-200 truncate">{u.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Labels Filter Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'label' ? null : 'label')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              filters.labels.length > 0
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300 font-semibold'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>Tag / Label</span>
            {filters.labels.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-200 dark:bg-indigo-900 text-[10px]">
                {filters.labels.length}
              </span>
            )}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {openDropdown === 'label' && (
            <div className="absolute left-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 z-40 max-h-60 overflow-y-auto">
              {COMMON_LABELS.map((l) => {
                const checked = filters.labels.includes(l);
                return (
                  <label
                    key={l}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleLabel(l)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-mono">#{l}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors font-medium"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset filters ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      {/* Right Tools: Swimlane selector & Ticket counter */}
      <div className="flex items-center gap-3 text-xs">
        {/* Total / Filtered Counts */}
        <span className="text-slate-400 text-[11px]">
          Showing <strong>{filteredTasksCount}</strong> of {totalTasksCount} tasks
        </span>

        {/* Swimlane Selector (shown only on Board view) */}
        {viewMode === 'board' && (
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-400 px-1.5 uppercase">Group:</span>
            <select
              value={swimlaneMode}
              onChange={(e) => onSwimlaneChange(e.target.value as SwimlaneMode)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              <option value="none">Default Board</option>
              <option value="assignee">By Assignee</option>
              <option value="type">By Type</option>
              <option value="label">By Label</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
