import {CATEGORIES, qs, apiList, buildTag, postCard} from './utils.js';

// Build category grid
const grid = qs('#category-grid');
if (grid) {
  CATEGORIES.slice(0,6).forEach(cat => {
    const link = buildTag('a', {href:`list.html?category=${encodeURIComponent(cat)}`, class:'block card hover:border-indigo-500 hover:shadow flex items-center gap-3'}, [
      buildTag('div', {class:'badge'}, cat),
      buildTag('i', {class:'fa fa-chevron-right ml-auto text-slate-400'})
    ]);
    grid.appendChild(link);
  });
}

// Load latest posts
const latest = document.getElementById('latest-list');
if (latest) {
  (async()=>{
    const {data} = await apiList('posts', {page:1, limit:6, sort:'-created_at'});
    latest.innerHTML = '';
    data.forEach(p=> latest.appendChild(postCard(p)) );
    if (data.length === 0) latest.innerHTML = '<div class="text-slate-500">まだ投稿がありません。最初の投稿者になりましょう！</div>';
  })();
}

// Search form passthrough is default via action=list.html
