import {CATEGORIES, CITIES, qs, apiList, parseQuery, buildTag, postCard} from './utils.js';

const q = parseQuery();
const inputQ = qs('#f-q');
const selCat = qs('#f-category');
const selCity = qs('#f-city');
const btnApply = qs('#f-apply');
const btnClear = qs('#f-clear');

// hydrate filters
inputQ.value = q.search || '';
selCat.innerHTML = '<option value="">すべて</option>' + CATEGORIES.map(c=>`<option${q.category===c?' selected':''}>${c}</option>`).join('');
selCity.innerHTML = '<option value="">すべて</option>' + CITIES.map(c=>`<option${q.city===c?' selected':''}>${c}</option>`).join('');

btnApply.addEventListener('click', ()=>{
  const params = new URLSearchParams();
  if (inputQ.value) params.set('search', inputQ.value);
  if (selCat.value) params.set('category', selCat.value);
  if (selCity.value) params.set('city', selCity.value);
  location.search = params.toString();
});
btnClear.addEventListener('click', ()=>{ location.search = ''; });

const listEl = qs('#post-list');
const pager = qs('#pager');
const countEl = qs('#result-count');
const titleEl = qs('#page-title');

async function load(page=1){
  titleEl.textContent = q.category ? `${q.category} の投稿` : '投稿一覧';
  const search = q.search || '';
  const {data,total,limit,page:cur} = await apiList('posts', {page, limit:10, search});

  // Client-side filter for category/city to keep MVP simple (server supports search only)
  let filtered = data;
  if (q.category) filtered = filtered.filter(p=> p.category===q.category);
  if (q.city) filtered = filtered.filter(p=> p.city===q.city);

  countEl.textContent = `${total}件中 ${filtered.length}件表示（このページ）`;
  listEl.innerHTML = '';
  filtered.forEach(p => listEl.appendChild(postCard(p)));
  if(filtered.length===0) listEl.innerHTML = '<div class="text-slate-500">該当する投稿が見つかりませんでした。</div>';

  // Simple pager (prev/next)
  pager.innerHTML = '';
  const prev = buildTag('button', {class:'border rounded px-3 py-1 disabled:opacity-50', onclick:()=>{ if(cur>1){ q.page = cur-1; location.search = new URLSearchParams(q).toString(); }}}, '前へ');
  const next = buildTag('button', {class:'border rounded px-3 py-1', onclick:()=>{ q.page = (cur||1)+1; location.search = new URLSearchParams(q).toString(); }}, '次へ');
  pager.append(prev, next);
}

load(Number(q.page||1));
