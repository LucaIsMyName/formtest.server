import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { getAllIconNames, renderIcon } from '../utils/iconHelper';

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  onClose: () => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, onClose }) => {
  const [search, setSearch] = useState('');
  const allIcons = useMemo(() => getAllIconNames(), []);

  const filteredIcons = useMemo(() => {
    if (!search) return allIcons.slice(0, 50); // Show first 50 icons by default
    const searchLower = search.toLowerCase();
    return allIcons.filter(icon => icon.toLowerCase().includes(searchLower));
  }, [search, allIcons]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Icon auswählen</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Icon suchen..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {search ? `${filteredIcons.length} ${filteredIcons.length === 1 ? 'Icon' : 'Icons'} gefunden` : `${filteredIcons.length} Icons angezeigt (von ${allIcons.length} gesamt)`}
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {filteredIcons.map((iconName) => (
              <button
                key={iconName}
                onClick={() => handleSelect(iconName)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  value === iconName
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
                title={iconName}>
                <div className="text-gray-700 dark:text-gray-300">
                  {renderIcon(iconName, 24)}
                </div>
                <div className="text-[9px] text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center">
                  {iconName}
                </div>
              </button>
            ))}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>Keine Icons gefunden</p>
              <p className="text-sm mt-2">Versuche einen anderen Suchbegriff</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Klicke auf ein Icon zum Auswählen</span>
            <span>ESC zum Schließen</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
