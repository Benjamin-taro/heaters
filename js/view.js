import {qs, apiGet, apiList, buildTag, postCard, formatPrice} from './utils.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');

async function load(){
  if(!id){
    qs('#post').innerHTML = '<div class="text-slate-500">IDが指定されていません。</div>';
    return;
  }
  const p = await apiGet('posts', id);
  renderPost(p);
  loadRelated(p);
}

function renderPost(p){
  const title = buildTag('h1', {class:'text-2xl font-semibold mb-1'}, p.title||'(無題)');
  const meta = buildTag('div', {class:'text-sm text-slate-500 mb-2'}, [p.category||'未分類',' ・ ',p.city||'スコットランド',' ・ ',p.location||'']);
  const price = buildTag('div', {class:'text-lg text-indigo-700 font-semibold mb-4'}, formatPrice(p.price, p.price_unit));
  const body = buildTag('div', {class:'prose prose-slate max-w-none'}, p.description ? p.description : '(本文なし)');

  const contact = buildTag('div', {class:'mt-4 text-sm text-slate-600'}, [
    p.contact_name?`連絡先: ${p.contact_name} `:'',
    p.contact_email?`/ ${p.contact_email} `:'',
    p.contact_phone?`/ ${p.contact_phone} `:''
  ]);

  const wrap = qs('#post');
  wrap.innerHTML = '';
  wrap.append(title, meta, price, body, contact);
}

async function loadRelated(p){
  const {data} = await apiList('posts', {page:1, limit:6, search:p.city||''});
  const rel = data.filter(x=> x.id!==p.id).slice(0,4);
  const box = qs('#related'); box.innerHTML = '';
  rel.forEach(x=> box.appendChild(postCard(x)));
}

load();
