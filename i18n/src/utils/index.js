export function validateRowItem(rowItem) {
  const { key, IContent } = rowItem;
  if (!key || !IContent) {
    console.warn(`行数据不完整，跳过: ${JSON.stringify(row)}`);
    return false;
  }

  return true;
}
