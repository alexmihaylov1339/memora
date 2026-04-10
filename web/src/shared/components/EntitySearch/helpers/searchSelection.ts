import type { SearchResultItem } from '@features/search';

export function isSelectedItem(
  item: SearchResultItem,
  selectedItems: SearchResultItem[],
) {
  return selectedItems.some((selectedItem) => isSameSearchItem(selectedItem, item));
}

export function isSameSearchItem(left: SearchResultItem, right: SearchResultItem) {
  return left.id === right.id && left.type === right.type;
}
