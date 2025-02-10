// src/BookkeepingService.js

const STORAGE_KEY_TAGPOOL = "all_tags_pool";

const STORAGE_KEY = "bookkeeping_records";

export function getAllRecords() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAllRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addRecord(record) {
  const records = getAllRecords();
  records.push(record);
  saveAllRecords(records);
}

export function deleteRecord(id) {
  const records = getAllRecords().filter((r) => r.id !== id);
  saveAllRecords(records);
}

export function updateRecord(updated) {
  let records = getAllRecords();
  records = records.map((r) => (r.id === updated.id ? updated : r));
  saveAllRecords(records);
}

// ------------------ 标签池相关 ------------------

// 获取全局标签池
export function getAllTagsPool() {
  const data = localStorage.getItem(STORAGE_KEY_TAGPOOL);
  return data ? JSON.parse(data) : [];
}

// 写回标签池
function saveAllTagsPool(tags) {
  localStorage.setItem(STORAGE_KEY_TAGPOOL, JSON.stringify(tags));
}

// 向标签池添加多个标签(若没有则添加)
export function addTagsToPool(newTags) {
  const pool = getAllTagsPool();
  let updated = [...pool];
  newTags.forEach((tag) => {
    if (!updated.includes(tag)) {
      updated.push(tag);
    }
  });
  saveAllTagsPool(updated);
}

// 如果想删除或更新标签，也可写类似函数
