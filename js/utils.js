// Shared constants and helpers for Scottish MixB (client-only)

export const CATEGORIES = [
  "賃貸・ルームシェア",
  "求人・アルバイト",
  "売買（Buy & Sell）",
  "レッスン",
  "イベント",
  "サービス",
  "口コミ・おすすめ",
  "相談HELP",
  "住居保証人マッチング",
  "乗り合い・タクシー",
];

export const CITIES = [
  "Glasgow",
  "Edinburgh",
  "Aberdeen",
  "Dundee",
  "St Andrews",
  "Stirling",
  "Inverness",
  "その他",
];

export const UNITS = ["GBP/月","GBP/週","GBP/日","GBP/時給","GBP","Free","応相談"];

export function qs(selector, el=document){ return el.querySelector(selector); }
export function qsa(selector, el=document){ return [...el.querySelectorAll(selector)]; }

// Basic fetch wrappers for RESTful Table API (relative URLs)
export async function apiList(table, {page=1, limit=10, search='', sort='-created_at'}={}){
  const res = await fetch(`tables/${table}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sort=${encodeURIComponent(sort)}`);
  return await res.json();
}

export async function apiGet(table, id){
  const res = await fetch(`tables/${table}/${id}`);
  return await res.json();
}

export async function apiCreate(table, data){
  const res = await fetch(`tables/${table}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
  return await res.json();
}

export async function apiPatch(table, id, data){
  const res = await fetch(`tables/${table}/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
  return await res.json();
}

export function parseQuery(){
  const params = new URLSearchParams(location.search);
  const obj = {}; for(const [k,v] of params.entries()) obj[k] = v; return obj;
}

export function buildTag(tag, attrs={}, children=[]) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.substring(2), v); else el.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach(c=>{
    if (c==null) return; if (typeof c === 'string') el.appendChild(document.createTextNode(c)); else el.appendChild(c);
  });
  return el;
}

export function formatPrice(price, unit){
  if(price==null || price==='') return '';
  const p = new Intl.NumberFormat('en-UK').format(Number(price));
  return unit ? `${p} ${unit}` : p;
}

export function relativeTime(ms){
  const diff = Date.now() - ms; const sec = Math.floor(diff/1000);
  if(sec<60) return `${sec}s前`;
  const min = Math.floor(sec/60); if(min<60) return `${min}分前`;
  const hr = Math.floor(min/60); if(hr<24) return `${hr}時間前`;
  const day = Math.floor(hr/24); if(day<30) return `${day}日前`;
  const mon = Math.floor(day/30); if(mon<12) return `${mon}ヶ月前`;
  const yr = Math.floor(mon/12); return `${yr}年前`;
}

export function postCard(p){
  const title = buildTag('a', {href:`view.html?id=${p.id}`, class:'font-semibold hover:underline'}, p.title || '(無題)');
  const meta = buildTag('div', {class:'text-xs text-slate-500'}, [
    p.category || '未分類', ' ・ ', p.city || 'スコットランド', ' ・ ', p.location || '',
  ]);
  const price = buildTag('div', {class:'text-sm text-indigo-700 font-semibold'}, formatPrice(p.price, p.price_unit));
  const desc = buildTag('p', {class:'text-sm text-slate-600 truncate-2'}, (p.description||'').replace(/<[^>]+>/g,'').slice(0,160));
  const footer = buildTag('div', {class:'text-xs text-slate-400'}, [relativeTime(p.updated_at||p.created_at||Date.now())]);
  const wrap = buildTag('div', {class:'card post-item'} , [title, meta, price, desc, footer]);
  return wrap;
}
