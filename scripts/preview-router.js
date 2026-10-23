/* 仅用于预览副本（make-preview.mjs 注入，正式站不包含）。
 * 预览窗口可能拦截“跳到另一个 HTML 文件”的导航和新标签页弹窗，
 * 这里改为：站内链接用 fetch 取回目标页并在当前框架内替换显示；
 * 站外链接先尝试新标签页，被拦截时再尝试整页打开，最后给出可复制的链接。 */
(function () {
  // document.open() 会清空监听器但保留 document 对象，所以标记放在每次新建的根元素上
  var root = document.documentElement;
  if (root.__pvRouter) return;
  root.__pvRouter = true;

  function scrollToHash(hash) {
    if (!hash) { window.scrollTo(0, 0); return; }
    var el = document.getElementById(decodeURIComponent(hash));
    if (el) el.scrollIntoView();
  }

  function samePage(u) {
    var b = new URL(document.baseURI);
    return u.origin === b.origin && u.pathname === b.pathname && u.search === b.search;
  }

  async function go(url, push) {
    var parts = url.split('#');
    try {
      var r = await fetch(parts[0], { credentials: 'same-origin' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var html = await r.text();
      var base = '<base href="' + parts[0] + '">';
      html = /<head[^>]*>/i.test(html) ? html.replace(/<head([^>]*)>/i, '<head$1>' + base) : base + html;
      // 同一个 document 里已执行过的模块不会再执行：给入口模块加版本参数，让菜单、搜索等脚本在新页面重新绑定
      var v = (window.__pvN = (window.__pvN || 0) + 1);
      html = html.replace(/(<script\b[^>]*type="module"[^>]*\ssrc=")([^"?]+)(")/gi, '$1$2?pv=' + v + '$3');
      if (push) { try { history.pushState({ pv: url }, ''); } catch (e) {} }
      document.open();
      document.write(html);
      document.close();
      setTimeout(function () { scrollToHash(parts[1]); }, 60);
    } catch (e) {
      location.href = url;
    }
  }

  function toast(url) {
    var d = document.createElement('div');
    d.setAttribute('role', 'alert');
    d.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;max-width:min(92vw,520px);background:#fff;border:1px solid #f3b3c5;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:12px 14px;font-size:14px;line-height:1.6;color:#3a3236';
    d.innerHTML = '预览窗口拦截了新标签页，请复制链接到浏览器打开：<br><input readonly style="width:100%;margin-top:6px;padding:6px 8px;border:1px solid #eadfe3;border-radius:8px;font-size:13px"> <button type="button" style="margin-top:8px;padding:4px 12px;border:0;border-radius:999px;background:#c94a72;color:#fff;cursor:pointer">关闭</button>';
    var input = d.querySelector('input');
    input.value = url;
    d.querySelector('button').onclick = function () { d.remove(); };
    document.body.appendChild(d);
    input.select();
    try { navigator.clipboard && navigator.clipboard.writeText(url); } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('download')) return;
    var raw = a.getAttribute('href');
    if (!raw || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
    var u = new URL(a.href, document.baseURI);

    // 站外链接（Telegram、各家官网注册）
    if (u.origin !== location.origin) {
      e.preventDefault();
      var w = null;
      try { w = window.open(u.href, '_blank'); } catch (err) {}
      if (w) { try { w.opener = null; } catch (err) {} return; }
      try { window.top.location.href = u.href; return; } catch (err) {}
      toast(u.href);
      return;
    }

    // 同一页内的锚点
    if (samePage(u)) {
      e.preventDefault();
      if (u.hash) scrollToHash(u.hash.slice(1)); else window.scrollTo(0, 0);
      return;
    }

    // 站内其他页面
    if (/\.html$|\/$/.test(u.pathname)) {
      e.preventDefault();
      go(u.href, true);
    }
  }, true);

  // document.open() 同时清空 window 上的监听器，所以每个新页面都重新绑定返回键处理
  if (!window.__pvInit) {
    window.__pvInit = true;
    try { history.replaceState({ pv: document.baseURI }, ''); } catch (e) {}
  }
  if (window.__pvPopFn) window.removeEventListener('popstate', window.__pvPopFn);
  window.__pvPopFn = function (e) { if (e.state && e.state.pv) go(e.state.pv, false); };
  window.addEventListener('popstate', window.__pvPopFn);
})();
