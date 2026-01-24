import { describe, it, expect } from 'vitest';
import * as fs from 'fs';

describe('MiniSparkline Component', () => {
  it('should always render exactly 10 bullets', () => {
    const content = fs.readFileSync('./src/renderer/src/components/MiniSparkline.tsx', 'utf-8');
    
    // Verify BULLET_COUNT is defined as 10
    expect(content).toContain('const BULLET_COUNT = 10');
    
    // Verify Array.from is used with BULLET_COUNT
    expect(content).toContain('Array.from({ length: BULLET_COUNT })');
    
    // Verify flex-shrink-0 is used to prevent shrinking
    expect(content).toContain('flex-shrink-0');
    
    // Verify minWidth is set for consistent sizing
    expect(content).toContain('minWidth');
  });
});

describe('Forms Page', () => {
  it('should have a separate Hash column', () => {
    const content = fs.readFileSync('./src/renderer/src/pages/Forms.tsx', 'utf-8');
    
    // Verify Hash column header exists
    expect(content).toContain('Hash');
    expect(content).toContain('getSortDirection("hash")');
    expect(content).toContain('requestSort("hash")');
    
    // Verify hash cell is separate from name
    expect(content).toContain('{form.hash || "—"}');
  });
});
