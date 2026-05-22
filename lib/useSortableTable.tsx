'use client';

import React, { useMemo, useState } from 'react';

export type SortDir = 'asc' | 'desc';

export interface SortState<K extends string> {
  key: K | null;
  dir: SortDir;
}

export function useSortableTable<T extends Record<string, unknown>>(
  data: T[],
  initialKey?: keyof T & string,
  initialDir: SortDir = 'desc',
) {
  const [sort, setSort] = useState<SortState<keyof T & string>>({
    key: initialKey ?? null,
    dir: initialDir,
  });

  const sorted = useMemo(() => {
    if (!sort.key) return data;
    return [...data].sort((a, b) => {
      const av = a[sort.key!];
      const bv = b[sort.key!];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const lt = av < bv ? -1 : 1;
      return sort.dir === 'asc' ? lt : -lt;
    });
  }, [data, sort]);

  function toggleSort(key: keyof T & string) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' },
    );
  }

  function SortIndicator({ col }: { col: keyof T & string }) {
    if (sort.key !== col) {
      return <span style={{ opacity: 0.3, marginLeft: '4px', fontSize: '10px' }}>↕</span>;
    }
    return (
      <span style={{ color: 'var(--color-accent)', marginLeft: '4px', fontSize: '10px' }}>
        {sort.dir === 'asc' ? '↑' : '↓'}
      </span>
    );
  }

  function thProps(col: keyof T & string): React.ThHTMLAttributes<HTMLTableCellElement> {
    return {
      onClick: () => toggleSort(col),
      style: { cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' },
    };
  }

  return { sorted, sort, toggleSort, SortIndicator, thProps };
}
