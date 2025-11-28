import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, CreditCard, TestTube, Settings, BookOpen, Search, ChevronRight } from "lucide-react";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { StatusBadge } from "./ui/Badge";

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

  useEffect(() => {
    if (isOpen) {
      loadForms();
      loadPaymentMethods();
      loadTestRuns();
    }
  }, [isOpen, loadForms, loadPaymentMethods, loadTestRuns]);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setSearch("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-start justify-center pt-[20vh]">
      <Command
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        shouldFilter={true}>
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Suche nach Seiten, Formularen, Bezahlmethoden..."
            className="w-full py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
            autoFocus
          />
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Keine Ergebnisse gefunden.</Command.Empty>

          {/* Dashboard */}
          <Command.Group
            heading={<span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">Dashboard</span>}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2">
            <Command.Item
              onSelect={() => handleSelect("/")}
              className="flex items-center gap-3 px-3 py-2 mt-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
              <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Dashboard</span>
            </Command.Item>
          </Command.Group>

          {/* Formulare */}
          <Command.Group
            heading={<span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">Formulare</span>}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 mt-2">
            <Command.Item
              onSelect={() => handleSelect("/forms")}
              className="flex items-center gap-3 px-3 py-2 mt-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
              <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Alle Formulare</span>
            </Command.Item>
            {forms.slice(0, 5).map((form) => (
              <Command.Item
                key={form.id}
                value={`form-${form.name}`}
                onSelect={() => handleSelect(`/forms?id=${form.id}`)}
                className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 ml-7">
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs font-normal">{form.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{form.isActive ? "Aktiv" : "Inaktiv"}</span>
              </Command.Item>
            ))}
          </Command.Group>

          {/* Bezahlmethoden */}
          <Command.Group
            heading={<span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">Bezahlmethoden</span>}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 mt-2">
            <Command.Item
              onSelect={() => handleSelect("/payment-methods")}
              className="flex items-center gap-3 px-3 py-2 mt-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
              <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Alle Bezahlmethoden</span>
            </Command.Item>
            {paymentMethods.slice(0, 5).map((pm) => (
              <Command.Item
                key={pm.id}
                value={`payment-${pm.name}`}
                onSelect={() => handleSelect(`/payment-methods?id=${pm.id}`)}
                className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 ml-7">
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs font-normal">{pm.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{pm.type}</span>
              </Command.Item>
            ))}
          </Command.Group>

          {/* Test Resultate */}
          <Command.Group
            heading={<span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">Test Resultate</span>}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 mt-2">
            <Command.Item
              onSelect={() => handleSelect("/test-results")}
              className="flex items-center gap-3 px-3 py-2 mt-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
              <TestTube className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Alle Test Resultate</span>
            </Command.Item>
            {testRuns.slice(0, 5).map((testRun) => {
              const formName = forms.find((f) => f.id === testRun.formId)?.name || `Form #${testRun.formId}`;
              const pmName = paymentMethods.find((p) => p.id === testRun.paymentMethodId)?.name || `PM #${testRun.paymentMethodId}`;
              const uuid = testRun.uuid || "";
              return (
                <Command.Item
                  key={testRun.id}
                  value={`test-${formName}-${pmName}-${uuid}`}
                  onSelect={() => handleSelect(`/test-results?id=${testRun.id}`)}
                  className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 ml-7 group">
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-normal">
                      {formName} × {pmName}
                    </span>
                    {uuid && <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">ID: {uuid.substring(0, 8)}...</span>}
                  </div>
                  <StatusBadge status={testRun.status} size="sm" className="ml-auto" />
                </Command.Item>
              );
            })}
          </Command.Group>

          {/* Einstellungen */}
          <Command.Group
            heading={<span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">Einstellungen</span>}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 mt-2">
            <Command.Item
              onSelect={() => handleSelect("/settings")}
              className="flex items-center gap-3 px-3 py-2 mt-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span>Einstellungen</span>
            </Command.Item>
          </Command.Group>

          {/* Info & Doku */}
          <Command.Group
            heading={<span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">Info & Doku</span>}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-2 mt-2">
            <Command.Item
              onSelect={() => handleSelect("/info-doku")}
              className="flex items-center gap-3 px-3 py-2 mt-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Info & Doku</span>
            </Command.Item>
          </Command.Group>
        </Command.List>

        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>Drücke ESC zum Schließen</span>
          <span>⌘K zum Öffnen</span>
        </div>
      </Command>

      {/* Backdrop - close on click */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default GlobalSearch;
