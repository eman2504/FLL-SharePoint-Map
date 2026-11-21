(function () {
  'use strict';
  var D = window.FLL_DATA, L = window.FLL_LINKS || {};
  var app = document.getElementById('app');

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  // Anchor whose target comes from links.js; falls back to an inert "#".
  function link(id, cls, label) {
    var a = el('a', cls);
    var url = L[id];
    a.dataset.linkId = id;
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
    else {
      a.href = '#'; a.title = 'رابط مؤقت – Placeholder';
      a.addEventListener('click', function (e) { e.preventDefault(); });
    }
    if (label) a.appendChild(label);
    return a;
  }
  function rowParts(n, sign) {
    var f = document.createDocumentFragment();
    f.appendChild(el('span', 'sign' + (sign ? '' : ' none'), sign || ''));
    f.appendChild(el('span', 'ico'));
    if (n.code) f.appendChild(el('span', 'code', n.code));
    var nm = el('span', 'nm', n.name);
    if (n.note) nm.appendChild(el('span', 'note', n.note));
    f.appendChild(nm);
    return f;
  }
  function setOpen(btn, open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.firstChild.textContent = open ? '−' : '+';
    btn.nextSibling.hidden = !open;
  }
  function renderList(nodes) {
    var ul = el('ul', 'children');
    if (nodes.length && nodes.every(function (n) { return n.type === 'card'; })) ul.className = 'children cardgrid';
    nodes.forEach(function (n) { ul.appendChild(renderNode(n)); });
    return ul;
  }
  function renderNode(n) {
    var li = el('li', 'node ' + n.type);
    if (n.type === 'card') {
      li.className = 'bk';
      li.appendChild(el('b', '', n.title));
      li.appendChild(el('span', '', n.desc));
      li.appendChild(link(n.id + '/img', '', document.createTextNode(n.imgText)));
      return li;
    }
    if (n.type === 'folder' && n.children.length) {
      var btn = el('button', 'row'); btn.type = 'button';
      btn.appendChild(rowParts(n, '+'));
      li.appendChild(btn);
      var kids = renderList(n.children); kids.hidden = true;
      li.appendChild(kids);
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () { setOpen(btn, btn.getAttribute('aria-expanded') !== 'true'); });
    } else {
      // files and empty folders are links (replaceable via links.js)
      li.appendChild(link(n.id, 'row', rowParts(n, '')));
    }
    return li;
  }

  function home() {
    document.title = 'خريطة وثائق مشروع تطوير مكتبة كلية الحقوق';
    app.textContent = '';
    var h = el('header', 'top');
    h.appendChild(el('h1', '', 'خريطة وثائق مشروع تطوير مكتبة كلية الحقوق'));
    h.appendChild(el('p', 'sub', 'Faculty of Law Library – Project Documentation Map'));
    app.appendChild(h);
    app.appendChild(el('p', 'hint', 'اضغط على اسم الإدارة للانتقال إلى خريطتها التفصيلية.'));
    var ul = el('ul', 'cards');
    D.main.forEach(function (m) {
      var li = el('li', 'card'), a = el('a'); a.href = '#/dept/' + m.num;
      a.appendChild(el('span', 'num', String(m.num)));
      a.appendChild(el('span', 't', m.title));
      li.appendChild(a); ul.appendChild(li);
    });
    app.appendChild(ul);
  }

  function dept(num) {
    var d = D.departments[num];
    if (!d) return home();
    document.title = d.num + ' | ' + d.title;
    app.textContent = '';
    var h = el('header', 'top');
    h.appendChild(el('h1', '', d.num + ' | ' + d.title));
    app.appendChild(h);
    var bar = el('div', 'bar');
    var back = el('a', 'btn', 'العودة للرئيسية'); back.href = '#/';
    var ex = el('button', 'btn', 'توسيع الكل – Expand All'); ex.type = 'button';
    var co = el('button', 'btn', 'طيّ الكل – Collapse All'); co.type = 'button';
    bar.appendChild(back); bar.appendChild(el('span', 'sp')); bar.appendChild(ex); bar.appendChild(co);
    app.appendChild(bar);
    var tree = renderList(d.children); tree.className = 'tree';
    app.appendChild(tree);
    function all(open) {
      // expand parents first so nested buttons exist in DOM (they always do), then set state
      tree.querySelectorAll('button.row').forEach(function (b) { setOpen(b, open); });
    }
    ex.addEventListener('click', function () { all(true); });
    co.addEventListener('click', function () { all(false); });
  }

  function route() {
    var m = /^#\/dept\/(\d+)$/.exec(location.hash);
    if (m) dept(parseInt(m[1], 10)); else home();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
