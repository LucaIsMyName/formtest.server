import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { getAllIconNames, renderIcon } from '../../utils/iconHelper';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  onClose: () => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, onClose }) => {
  const [search, setSearch] = useState('');
  const allIcons = useMemo(() => getAllIconNames(), []);
  
  // Generate random 50 icons on mount (stable for this session)
  const randomIcons = useMemo(() => {
    const shuffled = [...allIcons].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 50);
  }, [allIcons]);

  const filteredIcons = useMemo(() => {
    if (!search) return randomIcons; // Show random 50 icons by default
    const searchLower = search.toLowerCase();
    return allIcons.filter(icon => icon.toLowerCase().includes(searchLower));
  }, [search, allIcons, randomIcons]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <DialogTitle>Icon auswählen</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Icon suchen..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            {search ? `${filteredIcons.length} ${filteredIcons.length === 1 ? 'Icon' : 'Icons'} gefunden` : `${filteredIcons.length} Icons angezeigt (von ${allIcons.length} gesamt)`}
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-neutral-800">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => handleSelect(iconName)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  value === iconName
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-neutral-200 dark:border-neutral-600'
                }`}
                aria-label={`Icon ${iconName} auswählen`}
                aria-pressed={value === iconName}>
                <div className="text-neutral-700 dark:text-neutral-300" aria-hidden="true">
                  {renderIcon(iconName, 24)}
                </div>
                <div className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-1 truncate w-full text-center" aria-hidden="true">
                  {iconName}
                </div>
              </button>
            ))}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              <p>Keine Icons gefunden</p>
              <p className="text-sm mt-2">Versuche einen anderen Suchbegriff</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Klicke auf ein Icon zum Auswählen</span>
            <span>ESC zum Schließen</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IconPicker;
