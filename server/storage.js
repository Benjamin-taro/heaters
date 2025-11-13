const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const filePath = path.join(dataDir, 'posts.json');

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    const initial = { nextId: 1, items: [] };
    fs.writeFileSync(filePath, JSON.stringify(initial, null, 2));
  }
}

function load() {
  ensureFile();
  const content = fs.readFileSync(filePath, 'utf-8');
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.items)) {
      throw new Error('Invalid data file');
    }
    return parsed;
  } catch (err) {
    throw new Error(`Failed to parse data file: ${err.message}`);
  }
}

function save(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const allowedSortFields = new Set(['created_at', 'updated_at', 'price', 'expires_at']);

function parseSort(sort) {
  if (!sort) return { field: 'created_at', direction: 'desc' };
  let direction = 'asc';
  let field = sort;
  if (sort.startsWith('-')) {
    direction = 'desc';
    field = sort.slice(1);
  } else if (sort.startsWith('+')) {
    field = sort.slice(1);
  }
  if (!allowedSortFields.has(field)) {
    field = 'created_at';
    direction = 'desc';
  }
  return { field, direction };
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    return [value];
  }
  return [];
}

function normalizeRecord(input, timestamp) {
  const data = { ...input };
  if (Object.prototype.hasOwnProperty.call(data, 'price')) {
    if (data.price === null || data.price === '' || typeof data.price === 'undefined') {
      data.price = null;
    } else {
      data.price = Number(data.price);
    }
  }
  if (Object.prototype.hasOwnProperty.call(data, 'images')) {
    data.images = normalizeArray(data.images);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'tags')) {
    data.tags = normalizeArray(data.tags);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'published')) {
    data.published = Boolean(data.published);
  }
  if (timestamp) {
    data.updated_at = timestamp;
  }
  return data;
}

function filterItems(items, { search, category, city, published }) {
  return items.filter((item) => {
    if (published !== undefined && Boolean(item.published) !== Boolean(published)) {
      return false;
    }
    if (category && item.category !== category) {
      return false;
    }
    if (city && item.city !== city) {
      return false;
    }
    if (search) {
      const haystack = [item.title, item.description, item.city, item.category]
        .map((v) => (v || '').toLowerCase())
        .join(' ');
      if (!haystack.includes(search.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}

function sortItems(items, { field, direction }) {
  const dir = direction === 'desc' ? -1 : 1;
  return items.slice().sort((a, b) => {
    const av = a[field] ?? 0;
    const bv = b[field] ?? 0;
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function getList(query) {
  const { page = 1, limit = 10, search, category, city, sort, published } = query;
  const data = load();
  const filtered = filterItems(data.items, {
    search,
    category,
    city,
    published: typeof published === 'undefined' ? undefined : published === true || published === 'true' || published === '1'
  });
  const { field, direction } = parseSort(sort);
  const sorted = sortItems(filtered, { field, direction });

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;

  return {
    total: sorted.length,
    page: pageNum,
    limit: limitNum,
    data: sorted.slice(start, end)
  };
}

function getById(id) {
  const data = load();
  return data.items.find((item) => item.id === Number(id));
}

function insert(payload) {
  const data = load();
  const now = Date.now();
  const record = {
    id: data.nextId++,
    title: '',
    description: '',
    published: true,
    created_at: now,
    updated_at: now,
    ...normalizeRecord(payload, now)
  };
  if (!record.title || String(record.title).trim() === '') {
    throw new Error('title is required');
  }
  data.items.push(record);
  save(data);
  return record;
}

function update(id, payload) {
  const data = load();
  const index = data.items.findIndex((item) => item.id === Number(id));
  if (index === -1) {
    return null;
  }
  const now = Date.now();
  const updated = {
    ...data.items[index],
    ...normalizeRecord(payload, now)
  };
  updated.updated_at = now;
  data.items[index] = updated;
  save(data);
  return updated;
}

module.exports = {
  getList,
  getById,
  insert,
  update
};
