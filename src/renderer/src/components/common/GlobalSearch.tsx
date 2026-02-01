import React, { useState, useEffect, useMemo, useRef } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, CreditCard, TestTube, Settings, BookOpen, Search, ChevronRight, Clock, Code, Scale } from "lucide-react";
import { useFormsStore } from "../../store/useFormsStore";
import { usePaymentMethodsStore } from "../../store/usePaymentMethodsStore";
import { useTestRunsStore } from "../../store/useTestRunsStore";
import { useSchedulesStore } from "../../store/useSchedulesStore";
import { StatusBadge } from "../ui/Badge";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { forms, loadForms } = useFormsStore();
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore();
  const { testRuns, loadTestRuns } = useTestRunsStore();
  const { schedules, loadSchedules } = useSchedulesStore();

  const previousActiveElement = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      loadForms();
      loadPaymentMethods();
      loadTestRuns();
      loadSchedules();
      
      // Focus the input after a short delay to ensure it's rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      // Restore focus when closing
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isOpen, loadForms, loadPaymentMethods, loadTestRuns, loadSchedules]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  // When user types, search across ALL items - not just first 10
  const isSearching = search.trim().length > 0;

  // Filter forms based on search
  const filteredForms = useMemo(() => {
    if (!isSearching) return forms.slice(0, 10);
    const searchLower = search.toLowerCase();
    return forms.filter((f) => f.name.toLowerCase().includes(searchLower) || f.url.toLowerCase().includes(searchLower));
  }, [forms, search, isSearching]);

  // Filter payment methods based on search
  const filteredPaymentMethods = useMemo(() => {
    if (!isSearching) return paymentMethods.slice(0, 10);
    const searchLower = search.toLowerCase();
    return paymentMethods.filter((pm) => pm.name.toLowerCase().includes(searchLower) || pm.type.toLowerCase().includes(searchLower));
  }, [paymentMethods, search, isSearching]);

  // Filter schedules based on search
  const filteredSchedules = useMemo(() => {
    if (!isSearching) return schedules.slice(0, 10);
    const searchLower = search.toLowerCase();
    return schedules.filter((s) => {
      const formName = forms.find((f) => f.id === s.formId)?.name || "";
      const pmName = paymentMethods.find((p) => p.id === s.paymentMethodId)?.name || "";
      return s.name.toLowerCase().includes(searchLower) || formName.toLowerCase().includes(searchLower) || pmName.toLowerCase().includes(searchLower) || s.cronExpression.toLowerCase().includes(searchLower);
    });
  }, [schedules, forms, paymentMethods, search, isSearching]);

  // Filter test runs based on search - search across ALL test runs
  const filteredTestRuns = useMemo(() => {
    if (!isSearching) return testRuns.slice(0, 10);
    const searchLower = search.toLowerCase();
    return testRuns.filter((tr) => {
      const formName = forms.find((f) => f.id === tr.formId)?.name || "";
      const pmName = paymentMethods.find((p) => p.id === tr.paymentMethodId)?.name || "";
      const uuid = tr.uuid || "";
      return formName.toLowerCase().includes(searchLower) || pmName.toLowerCase().includes(searchLower) || uuid.toLowerCase().includes(searchLower) || tr.status.toLowerCase().includes(searchLower);
    });
  }, [testRuns, forms, paymentMethods, search, isSearching]);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setSearch("");
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 flex items-start justify-center pt-[20vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Globale Suche"
    >
      <Command
        className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-lg shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
        shouldFilter={true}
        label="Suche">
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-700 px-4">
          <Search className="w-5 h-5 text-neutral-400 mr-2" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Suche nach Seiten, Formularen, Bezahlmethoden..."
            className="w-full py-4 bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 outline-none text-base"
            autoFocus
          />
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2" aria-label="Suchergebnisse">
          <Command.Empty className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400" role="status">Keine Ergebnisse gefunden.</Command.Empty>

          {/* Dashboard */}
          <Command.Group
            heading={<span className="text-[10px] text-neutral-500 dark:text-neutral-400">Dashboard</span>}
            className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-2">
            <Command.Item
              onSelect={() => handleSelect("/")}
              className="flex items-center gap-3 py-2 mt-2 rounded cursor-pointer text-neutral-900 dark:text-white">
              <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Dashboard</span>
            </Command.Item>
          </Command.Group>

          {/* Formulare */}
          {filteredForms.length > 0 && (
            <Command.Group
              heading={<span className="text-[10px] text-neutral-500 dark:text-neutral-400">Formulare {isSearching && `(${filteredForms.length} Treffer)`}</span>}
              className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-2 mt-2">
              {!isSearching && (
                <Command.Item
                  onSelect={() => handleSelect("/forms")}
                  className="flex items-center gap-3 py-2 mt-2 rounded cursor-pointer text-neutral-900 dark:text-white">
                  <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>Alle Formulare</span>
                </Command.Item>
              )}
              {filteredForms.map((form) => (
                <Command.Item
                  key={form.id}
                  value={`form-${form.name}-${form.url}`}
                  onSelect={() => handleSelect(`/forms?id=${form.id}`)}
                  className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-neutral-600 dark:text-neutral-400 ml-4">
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs font-normal">{form.name}</span>
                  <StatusBadge
                    status={form.isActive ? "active" : "inactive"}
                    className="ml-auto">
                    {form.isActive ? "Aktiv" : "Inaktiv"}
                  </StatusBadge>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Bezahlmethoden */}
          {filteredPaymentMethods.length > 0 && (
            <Command.Group
              heading={<span className="text-[10px] text-neutral-500 dark:text-neutral-400">Bezahlmethoden {isSearching && `(${filteredPaymentMethods.length} Treffer)`}</span>}
              className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-2 mt-2">
              {!isSearching && (
                <Command.Item
                  onSelect={() => handleSelect("/payment-methods")}
                  className="flex items-center gap-3 py-2 mt-2 rounded cursor-pointer text-neutral-900 dark:text-white">
                  <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Alle Bezahlmethoden</span>
                </Command.Item>
              )}
              {filteredPaymentMethods.map((pm) => (
                <Command.Item
                  key={pm.id}
                  value={`payment-${pm.name}-${pm.type}`}
                  onSelect={() => handleSelect(`/payment-methods?id=${pm.id}`)}
                  className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-neutral-600 dark:text-neutral-400 ml-4">
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs font-normal">{pm.name}</span>
                  <StatusBadge
                    status={pm.isActive ? "active" : "inactive"}
                    className="ml-auto">
                    {pm.type}
                  </StatusBadge>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Autopilot / Schedules */}
          {filteredSchedules.length > 0 && (
            <Command.Group
              heading={<span className="text-[10px] text-neutral-500 dark:text-neutral-400">Autopilot {isSearching && `(${filteredSchedules.length} Treffer)`}</span>}
              className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-2 mt-2">
              {!isSearching && (
                <Command.Item
                  onSelect={() => handleSelect("/schedules")}
                  className="flex items-center gap-3 py-2 mt-2 rounded cursor-pointer text-neutral-900 dark:text-white">
                  <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Alle Autopiloten</span>
                </Command.Item>
              )}
              {filteredSchedules.map((schedule) => {
                const formName = forms.find((f) => f.id === schedule.formId)?.name || `Form #${schedule.formId}`;
                const pmName = paymentMethods.find((p) => p.id === schedule.paymentMethodId)?.name || `PM #${schedule.paymentMethodId}`;
                return (
                  <Command.Item
                    key={schedule.id}
                    value={`schedule-${schedule.name}-${formName}-${pmName}`}
                    onSelect={() => handleSelect(`/schedules`)}
                    className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-neutral-600 dark:text-neutral-400 ml-4">
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-normal">{schedule.name}</span>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                        {formName} × {pmName}
                      </span>
                    </div>
                    <StatusBadge
                      status={schedule.isActive ? "active" : "inactive"}
                      className="ml-auto">
                      {schedule.isActive ? "Aktiv" : "Inaktiv"}
                    </StatusBadge>
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {/* Test Resultate */}
          {filteredTestRuns.length > 0 && (
            <Command.Group
              heading={<span className="text-[10px] text-neutral-500 dark:text-neutral-400">Test Resultate {isSearching && `(${filteredTestRuns.length} Treffer)`}</span>}
              className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-2 mt-2">
              {!isSearching && (
                <Command.Item
                  onSelect={() => handleSelect("/test-results")}
                  className="flex items-center gap-3 py-2 mt-2 rounded cursor-pointer text-neutral-900 dark:text-white">
                  <TestTube className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span>Alle Test Resultate</span>
                </Command.Item>
              )}
              {filteredTestRuns.map((testRun) => {
                const formName = forms.find((f) => f.id === testRun.formId)?.name || `Form #${testRun.formId}`;
                const pmName = paymentMethods.find((p) => p.id === testRun.paymentMethodId)?.name || `PM #${testRun.paymentMethodId}`;
                const uuid = testRun.uuid || "";
                return (
                  <Command.Item
                    key={testRun.id}
                    value={`test-${formName}-${pmName}-${uuid}-${testRun.status}`}
                    onSelect={() => handleSelect(`/test-results?id=${testRun.id}`)}
                    className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-neutral-600 dark:text-neutral-400 ml-4 group">
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-normal">
                        {formName} × {pmName}
                      </span>
                      {uuid && <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">ID: {uuid.substring(0, 8)}...</span>}
                    </div>
                    <StatusBadge
                      status={testRun.status}
                      size="sm"
                      className="ml-auto"
                    />
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {/* Scripts */}
          <Command.Group
            heading={<span className="text-[10px] text-neutral-500 dark:text-neutral-400">Scripts</span>}
            className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-2 mt-2">
            <Command.Item
              onSelect={() => handleSelect("/scripts")}
              className="flex items-center gap-3 py-2 mt-2 rounded cursor-pointer text-neutral-900 dark:text-white">
              <Code className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Scripts</span>
            </Command.Item>
          </Command.Group>

          {/* Einstellungen */}
          <Command.Group
            heading={<span className="text-[10px] text-neutral-500 dark:text-neutral-400">Einstellungen</span>}
            className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-2 mt-2">
            <Command.Item
              onSelect={() => handleSelect("/settings")}
              className="flex items-center gap-3 py-2 mt-2 rounded cursor-pointer text-neutral-900 dark:text-white">
              <Settings className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <span>Einstellungen</span>
            </Command.Item>
          </Command.Group>

          {/* Rechtliches */}
          <Command.Group
            heading={<span className="text-[10px] text-neutral-500 dark:text-neutral-400">Rechtliches</span>}
            className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-2 mt-2">
            <Command.Item
              onSelect={() => handleSelect("/legal")}
              className="flex items-center gap-3 py-2 mt-2 rounded cursor-pointer text-neutral-900 dark:text-white">
              <Scale className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Rechtliches</span>
            </Command.Item>
          </Command.Group>

          {/* Doku */}
          <Command.Group
            heading={<span className="text-[10px] text-neutral-500 dark:text-neutral-400">Dokumentation</span>}
            className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-2 mt-2">
            <Command.Item
              onSelect={() => handleSelect("/docs")}
              className="flex items-center gap-3 py-2 mt-2 rounded cursor-pointer text-neutral-900 dark:text-white">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Doku</span>
            </Command.Item>
          </Command.Group>
        </Command.List>

        <div className="border-t border-neutral-200 dark:border-neutral-700 px-4 py-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
          <span>Drücke ESC zum Schließen</span>
          <span>⌘K zum Öffnen</span>
        </div>
      </Command>

      {/* Backdrop - close on click */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
};

export default GlobalSearch;
