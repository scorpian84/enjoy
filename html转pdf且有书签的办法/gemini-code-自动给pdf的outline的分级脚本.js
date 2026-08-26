(function autoNestBookmarksInOrder() {
    // 1. 获取 PDF 的根书签对象
    var root = this.bookmarkRoot;
    
    // 安全检查：如果没有任何书签，直接退出
    if (!root.children || root.children.length === 0) return;

    // 2. 将原始平铺书签提取为一个固定的静态数组 (避免边循环边修改 DOM 导致索引错乱)
    var bms = [];
    for (var i = 0; i < root.children.length; i++) {
        bms.push(root.children[i]);
    }

    // 3. 定义层级判定函数：根据标题文本特征返回对应的数字层级 (1~4 级)
    function getLevel(name) {
        if (!name) return 1;
        name = name.trim(); // 去除首尾多余空格

        // 4 级：以 "数字." 开头 (例如: "1.临床实用价值")
        if (/^\d+\./.test(name)) return 4;

        // 3 级：以 "第X节" 或 "附表" 开头 (例如: "第一节...", "附表1")
        if (/^第[一二三四五六七八九十0-9]+节|^附表/.test(name)) return 3;

        // 2 级：以 "第X章" 或 "附录X" 开头 (例如: "第一章...", "附录1")
        if (/^第[一二三四五六七八九十0-9]+章|^附录\d+/.test(name)) return 2;

        // 1 级：前言、序、上篇、附录(主标题) 等所有其他项。1级标题规则 (默认剩余的所有项，如 "第一章"、"前言")
        return 1;
    }

    // 4. 状态追踪器：用于实时记录“当前遍历路径中”最新的 1, 2, 3, 4 级节点是谁
    var parents = {
        1: null,
        2: null,
        3: null,
        4: null
    };

    // 5. 正序遍历所有书签（严格保证从 1 页到最后一页的顺序）
    for (var i = 0; i < bms.length; i++) {
        var bm = bms[i];
        var level = getLevel(bm.name);

        // A. 更新状态：记录当前层级最新的节点
        parents[level] = bm;

        // B. 重置断层：如果遇到了较浅的层级（比如遇到了新的 H2），
        //    那么之前旧的 H3、H4 就失效了，必须清空，防止跨章节错挂
        for (var p = level + 1; p <= 4; p++) {
            parents[p] = null;
        }

        // C. 查找最近的上级父节点并进行归属挂载
        if (level > 1) {
            var targetParent = null;

            // 向上寻找距离它最近的有效父节点 (例如 3 级优先找 2 级，找不到再找 1 级)
            for (var p = level - 1; p >= 1; p--) {
                if (parents[p]) {
                    targetParent = parents[p];
                    break; // 找到了最近的直系父节点，跳出查找循环
                }
            }

            // D. 挂载到父节点末尾 (关键点：使用 targetParent.children.length 保证正序追加)
            if (targetParent) {
                var currentIndex = targetParent.children ? targetParent.children.length : 0;
                targetParent.insertChild(bm, currentIndex);
            }
        }
    }

    console.println("🎉 所有书签正序多级分级重构完成！");
})();