import React from "react";
import { Checkbox } from "./ui/Checkbox";
import { Badge } from "./ui/Badge";
import type { TagDefinition } from "../store/useTagsStore";

interface TagSelectorProps {
  tags: TagDefinition[];
  selectedTagIds: number[];
  onSelectionChange: (tagIds: number[]) => void;
  className?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTagIds,
  onSelectionChange,
  className = "",
}) => {
  const handleTagToggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onSelectionChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onSelectionChange([...selectedTagIds, tagId]);
    }
  };

  if (tags.length === 0) {
    return (
      <div className={`text-sm text-neutral-500 dark:text-neutral-400 ${className}`}>
        Keine Tags verfügbar
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id);
        return (
          <label
            key={tag.id}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleTagToggle(tag.id)}
            />
            <Badge
              style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
              className="border">
              {tag.name}
            </Badge>
          </label>
        );
      })}
    </div>
  );
};

export default TagSelector;

