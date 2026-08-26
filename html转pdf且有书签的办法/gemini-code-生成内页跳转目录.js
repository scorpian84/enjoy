(function() {
  // 1. 动态注入样式：匹配 168mm x 228mm 尺寸，并将目录放置在最后
  const style = document.createElement('style');
  style.innerHTML = `
    @page { 
      size: 168mm 228mm; 
      /* 不写 margin，默认继承 Chrome 的默认打印边距 */
    }
    
    /* 保证首页和第二页依然保持无边距铺满 */
    @page :first { margin: 0; }
    @page sec_page { margin: 0; }

    .toc-container { 
      page-break-before: always; /* 目录前强制换页，使其置于最后一页 */
      break-before: page;
      font-family: system-ui, -apple-system, sans-serif;
      padding-top: 10px;
    }
    .toc-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 2px solid #333;
    }
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .toc-item {
      margin: 6px 0;
      line-height: 1.6;
    }
    /* 1到4级目录的层级缩进 */
    .toc-level-1 { padding-left: 0px;  font-weight: bold; }
    .toc-level-2 { padding-left: 18px; font-weight: normal; }
    .toc-level-3 { padding-left: 36px; font-weight: normal; font-size: 0.95em; opacity: 0.9; }
    .toc-level-4 { padding-left: 54px; font-weight: normal; font-size: 0.9em; opacity: 0.8; }

    /* CSS 自动计算与打印页码对齐 */
    .toc-item a {
      text-decoration: none;
      color: #111;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .toc-item a::after {
      content: leader('.') " " target-counter(attr(href), page);
      float: right;
      color: #555;
    }
  `;
  document.head.appendChild(style);

  // 2. 创建目录容器并追加到页面 body 最底部
  const tocDiv = document.createElement('div');
  tocDiv.className = 'toc-container';
  tocDiv.innerHTML = '<div class="toc-title">目 录</div><ul class="toc-list" id="auto-toc-list"></ul>';
  document.body.appendChild(tocDiv);

  const tocList = document.getElementById('auto-toc-list');
  let headingIndex = 0;

  // 3. 提取 1-4 级标题（匹配 headline-level-1~4 或 h1~h4）
  const selector = `
    .headline-level-1, .headline-level-2, .headline-level-3, .headline-level-4,
    h1, h2, h3, h4
  `;

  document.querySelectorAll(selector).forEach((el) => {
    const titleText = el.innerText.trim();
    if (!titleText) return;

    // 绑定锚点 ID
    headingIndex++;
    const anchorId = `toc-anchor-${headingIndex}`;
    el.setAttribute('id', anchorId);

    // 判断层级 (1, 2, 3, 4)
    let level = 1;
    const className = el.className || '';
    const tagName = el.tagName.toLowerCase();

    if (className.includes('headline-level-1') || tagName === 'h1') level = 1;
    else if (className.includes('headline-level-2') || tagName === 'h2') level = 2;
    else if (className.includes('headline-level-3') || tagName === 'h3') level = 3;
    else if (className.includes('headline-level-4') || tagName === 'h4') level = 4;

    // 生成带缩进和页码绑定的目录项
    const li = document.createElement('li');
    li.className = `toc-item toc-level-${level}`;
    li.innerHTML = `<a href="#${anchorId}"><span>${titleText}</span></a>`;
    tocList.appendChild(li);
  });

  console.log(`✅ 已提取并生成 ${headingIndex} 个目录项（位于最后一页，尺寸 168mm×228mm）！可以直接按 Ctrl+P 导出 PDF。`);
})();