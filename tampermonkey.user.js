// ==UserScript==
// @name         Hacker News (winterrx: sort + quotes only)
// @namespace    http://tampermonkey.net/
// @version      34
// @description  Sortable comments (newest/oldest/most replies) + inline quote styling. No layout/legibility changes.
// @author       winterrx
// @downloadURL  https://raw.githubusercontent.com/winterrx/hn-userscript/main/tampermonkey.user.js
// @updateURL    https://raw.githubusercontent.com/winterrx/hn-userscript/main/tampermonkey.user.js
// @supportURL   https://github.com/winterrx/hn-userscript
// @match        https://news.ycombinator.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ycombinator.com
// @license      MIT
// ==/UserScript==

// v34: dropped everything from the original mgladdish/website-customisations
// fork except comment sorting and quote styling — no font/layout resets, no
// homepage margin changes, no downvoted-comment greying, no comment-box
// collapsing. Stock HN rendering everywhere except those two features.

const tampermonkeyScript = function() {
    'use strict';

    document.head.insertAdjacentHTML("beforeend", `<style>
      .quote {
        border-left: 3px solid #ff6600;
        padding: 6px 6px 6px 9px;
        font-style: italic;
        background-color: rgba(255, 102, 0, 0.05);
        border-radius: 3px;
      }

      .commentSort {
        display: block;
        margin: 0.5rem 0 0.5rem 0.5rem;
        font-size: .75rem;
      }
      .commentSort select {
        font-size: .75rem;
        border: 1px solid #ff6600;
        border-radius: 3px;
        padding: 2px 4px;
      }
    </style>`);

    let nodes = [];

    function findElementContentsStartingWithQuoteChar(elementNames, nodes) {
        let node = null;
        elementNames.forEach(elementName => {
            const es = document.evaluate(`//${elementName}[starts-with(normalize-space(text()), '>')]`, document.body);
            while (node = es.iterateNext()) {
                nodes.push(node);
            }
        })
    }

    findElementContentsStartingWithQuoteChar(['i', 'p', 'span'], nodes);

    nodes.forEach((n) => {
        const textNode = Array.from(n.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
        if (textNode) {
            const p = document.createElement('p');
            p.classList.add('quote');
            if (textNode.data.trim() === ">") {
                const quotedContent = textNode.nextSibling;
                p.innerText = quotedContent.innerHTML.trim();
                quotedContent.remove();
            } else {
                p.innerText = textNode.data.replace(">", "").trim();
            }
            n.firstChild.replaceWith(p);
        } else {
            n.classList.add('quote');
            n.innerText = n.innerText.replace(">", "");
        }
    });

    addCommentSortControl();
}

function addCommentSortControl() {
    const commentTree = document.querySelector('.comment-tree');
    if (!commentTree) {
        return;
    }

    const rows = Array.from(commentTree.querySelectorAll(':scope > tbody > tr.athing.comtr'));
    if (rows.length === 0) {
        return;
    }

    // Build a tree from the flat, indent-ordered row list so sorting can
    // happen within each set of siblings without breaking the reply nesting.
    function buildTree() {
        const roots = [];
        const stack = [];
        rows.forEach((row, originalIndex) => {
            const indentEl = row.querySelector('.ind');
            const indent = indentEl ? parseInt(indentEl.getAttribute('indent'), 10) || 0 : 0;
            const ageEl = row.querySelector('.age');
            const togg = row.querySelector('a.togg');
            const node = {
                row,
                originalIndex,
                indent,
                date: ageEl ? Date.parse((ageEl.getAttribute('title') || '').split(' ')[0]) || 0 : 0,
                replies: togg ? parseInt(togg.getAttribute('n'), 10) || 0 : 0,
                children: [],
            };

            while (stack.length && stack[stack.length - 1].indent >= indent) {
                stack.pop();
            }

            if (stack.length === 0) {
                roots.push(node);
            } else {
                stack[stack.length - 1].children.push(node);
            }
            stack.push(node);
        });
        return roots;
    }

    const tree = buildTree();

    const comparators = {
        default: (a, b) => a.originalIndex - b.originalIndex,
        newest: (a, b) => b.date - a.date,
        oldest: (a, b) => a.date - b.date,
        replies: (a, b) => b.replies - a.replies,
    };

    function flatten(nodes, comparator, out) {
        nodes.slice().sort(comparator).forEach((node) => {
            out.push(node.row);
            flatten(node.children, comparator, out);
        });
        return out;
    }

    function applySort(sortKey) {
        const comparator = comparators[sortKey] || comparators.default;
        const ordered = flatten(tree, comparator, []);
        const parent = commentTree.querySelector(':scope > tbody') || commentTree;
        ordered.forEach((row) => parent.appendChild(row));
    }

    const container = document.createElement('span');
    container.classList.add('commentSort');
    container.innerHTML = `
      Sort by:
      <select>
        <option value="default">Default</option>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="replies">Most replies</option>
      </select>
    `;

    const select = container.querySelector('select');
    select.addEventListener('change', () => applySort(select.value));

    commentTree.parentNode.insertBefore(container, commentTree);
}

tampermonkeyScript();
