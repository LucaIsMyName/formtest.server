import { i as dist, r as reactExports } from "./index-ChHsagZL.js";
function useTableSelection() {
  const $ = dist.c(17);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ new Set();
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const [selectedIds, setSelectedIds] = reactExports.useState(t0);
  let t1;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = (id) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const toggleItem = t1;
  let t2;
  if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = (id_0) => {
      setSelectedIds((prev_0) => {
        if (prev_0.has(id_0)) {
          return prev_0;
        }
        const next_0 = new Set(prev_0);
        next_0.add(id_0);
        return next_0;
      });
    };
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const selectItem = t2;
  let t3;
  if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = (id_1) => {
      setSelectedIds((prev_1) => {
        if (!prev_1.has(id_1)) {
          return prev_1;
        }
        const next_1 = new Set(prev_1);
        next_1.delete(id_1);
        return next_1;
      });
    };
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const deselectItem = t3;
  let t4;
  if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = (pageItems) => {
      setSelectedIds((prev_2) => {
        const pageIds = pageItems.map(_temp);
        const allSelected = pageIds.every((id_2) => prev_2.has(id_2));
        if (allSelected) {
          const next_2 = new Set(prev_2);
          pageIds.forEach((id_3) => next_2.delete(id_3));
          return next_2;
        } else {
          const next_3 = new Set(prev_2);
          pageIds.forEach((id_4) => next_3.add(id_4));
          return next_3;
        }
      });
    };
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  const toggleAll = t4;
  let t5;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = (pageItems_0) => {
      setSelectedIds((prev_3) => {
        const next_4 = new Set(prev_3);
        pageItems_0.forEach((item_0) => next_4.add(item_0.id));
        return next_4;
      });
    };
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  const selectAll = t5;
  let t6;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t6 = () => {
      setSelectedIds(/* @__PURE__ */ new Set());
    };
    $[6] = t6;
  } else {
    t6 = $[6];
  }
  const clearSelection = t6;
  let t7;
  if ($[7] !== selectedIds) {
    t7 = (id_5) => selectedIds.has(id_5);
    $[7] = selectedIds;
    $[8] = t7;
  } else {
    t7 = $[8];
  }
  const isSelected = t7;
  let t8;
  if ($[9] !== selectedIds) {
    t8 = () => Array.from(selectedIds);
    $[9] = selectedIds;
    $[10] = t8;
  } else {
    t8 = $[10];
  }
  const getSelectedIds = t8;
  const selectedCount = selectedIds.size;
  const isPartialSelected = selectedCount > 0;
  let t9;
  if ($[11] !== getSelectedIds || $[12] !== isPartialSelected || $[13] !== isSelected || $[14] !== selectedCount || $[15] !== selectedIds) {
    t9 = {
      selectedIds,
      isAllSelected: false,
      isPartialSelected,
      toggleItem,
      selectItem,
      deselectItem,
      toggleAll,
      selectAll,
      clearSelection,
      selectedCount,
      isSelected,
      getSelectedIds
    };
    $[11] = getSelectedIds;
    $[12] = isPartialSelected;
    $[13] = isSelected;
    $[14] = selectedCount;
    $[15] = selectedIds;
    $[16] = t9;
  } else {
    t9 = $[16];
  }
  return t9;
}
function _temp(item) {
  return item.id;
}
function computeIsAllSelected(pageItems, selectedIds) {
  if (pageItems.length === 0) return false;
  return pageItems.every((item) => selectedIds.has(item.id));
}
function computeIsPartialSelected(pageItems, selectedIds) {
  if (pageItems.length === 0) return false;
  const selectedOnPage = pageItems.filter((item) => selectedIds.has(item.id));
  return selectedOnPage.length > 0 && selectedOnPage.length < pageItems.length;
}
export {
  computeIsAllSelected as a,
  computeIsPartialSelected as c,
  useTableSelection as u
};
