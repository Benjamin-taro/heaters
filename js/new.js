import {CATEGORIES, CITIES, UNITS, qs, apiCreate} from './utils.js';

const form = qs('#post-form');

// hydrate selects
qs('#sel-category').innerHTML = CATEGORIES.map(c=>`<option>${c}</option>`).join('');
qs('#sel-city').innerHTML = ['','',...CITIES].map(c=> c?`<option>${c}</option>`:'<option value="">指定なし</option>').join('');
qs('#sel-unit').innerHTML = UNITS.map(u=>`<option>${u}</option>`).join('');

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.price = data.price ? Number(data.price) : null;
  data.tags = (data.tags||'').split(',').map(s=>s.trim()).filter(Boolean);
  data.images = (data.images||'').split(',').map(s=>s.trim()).filter(Boolean);
  if (data.expires_at) data.expires_at = new Date(data.expires_at).toISOString();
  data.published = form.querySelector('input[name="published"]').checked;

  const btn = form.querySelector('button');
  btn.disabled = true; btn.textContent = '保存中...';
  try {
    const created = await apiCreate('posts', data);
    qs('#form-msg').textContent = '保存しました。投稿ページに移動します...';
    location.href = `view.html?id=${created.id}`;
  } catch (err) {
    console.error(err);
    qs('#form-msg').textContent = '保存に失敗しました。時間をおいて再度お試しください。';
  } finally {
    btn.disabled = false; btn.textContent = '投稿を保存';
  }
});
