(function() {
  console.log("⌛ 正在转换 H 标签（保持原字号与排版，严格锁定 378 页）...");

  // 1. 注入基础保护样式，消除 H 标签浏览器默认自带的额外 margin/padding 干扰
  const style = document.createElement('style');
  style.id = 'h-tag-fix-style';
  style.innerHTML = `
    h1, h2, h3, h4 {
      margin: 0;
      padding: 0;
      border: 0;
    }
    @page { size: 168mm 228mm; }
    @page :first { margin: 0; }
    @page sec_page { margin: 0; }
  `;
  document.head.appendChild(style);

  // 2. 遍历并替换标签，保留全部原有 CSS 类和所有行内/继承字号样式
  const selector = `.headline-level-1, .headline-level-2, .headline-level-3, .headline-level-4`;
  let convertedCount = 0;

  document.querySelectorAll(selector).forEach((el) => {
    let targetTag = 'h1';
    const className = el.className || '';
    if (className.includes('headline-level-1')) targetTag = 'h1';
    else if (className.includes('headline-level-2')) targetTag = 'h2';
    else if (className.includes('headline-level-3')) targetTag = 'h3';
    else if (className.includes('headline-level-4')) targetTag = 'h4';

    if (el.tagName.toLowerCase() !== targetTag) {
      const newEl = document.createElement(targetTag);
      // 完整复制原有节点的所有属性（包括 style、class 等，确保大字号完全保留）
      Array.from(el.attributes).forEach(attr => newEl.setAttribute(attr.name, attr.value));
      newEl.innerHTML = el.innerHTML;
      
      el.parentNode.replaceChild(newEl, el);
      convertedCount++;
    }
  });

  console.log(`✅ 已完成！共 ${convertedCount} 个标题转换为标准 H 标签（字号完全保持不变）。`);
  console.log(`👉 请按 Ctrl + P 导出 378 页 PDF，然后前往 Acrobat 设置【书签级别】。`);
})();