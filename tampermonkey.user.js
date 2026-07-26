// ==UserScript==
// @name         Hacker News (winterrx fork)
// @namespace    http://tampermonkey.net/
// @version      33
// @description  Make Hacker News more legible, plus a comment sort control
// @author       Martin Gladdish; sort control by winterrx
// @downloadURL  https://raw.githubusercontent.com/winterrx/hn-userscript/main/tampermonkey.user.js
// @updateURL    https://raw.githubusercontent.com/winterrx/hn-userscript/main/tampermonkey.user.js
// @supportURL   https://github.com/winterrx/hn-userscript
// @match        https://news.ycombinator.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ycombinator.com
// @license      MIT
// ==/UserScript==

// Forked from https://github.com/mgladdish/website-customisations
// (news.ycombinator.com/tampermonkey.js, MIT licensed) as of its v31.
//
// v32: added a comment sort control (default / newest / oldest / most replies)
// on item pages, since HN doesn't expose comment scores to most users so
// "most upvotes" isn't reliably available — replies is the closest honest proxy.
//
// v33: force light background/text colours (color-scheme: light + !important)
// so the styling isn't fought by a dark-mode/auto-dark browser extension.

const tampermonkeyScript = function() {
    'use strict';

    document.head.insertAdjacentHTML("beforeend", `<style>
      :root {
        --colour-hn-orange: #ff6600;
        --colour-hn-orange-pale: rgba(255, 102, 0, 0.05);
        --gutter: 0.5rem;
        --border-radius: 3px;
      }

      /* Reset font everywhere */
      html, body, td, .title, .comment, .default {
        font-family: 'Verdana', 'Arial', sans-serif;
      }

      /* Force light rendering even if a dark-mode/auto-dark browser
         extension tries to recolour the page, so text/quote styling
         always looks the way this script intends. */
      html {
        color-scheme: light only;
      }

      html, body {
        margin-top: 0;
        background-color: white !important;
        color: black !important;
      }

      body {
        padding: 0;
        margin: 0;
      }

      body, td, .title, .pagetop, .comment {
        font-size: 1rem;
      }

      html[op='news'] .title,
      .votelinks, 
      .fatitem .title+.votelinks {
        vertical-align: inherit;
      }
      
      .comment-tree .votelinks,
      html[op='threads'] .votelinks,
      html[op='item'] .votelinks,
      xhtml[op='newcomments'] .votelinks{
        vertical-align: top;
      }

      span.titleline {
        font-size: 1rem;
        margin-top: var(--gutter);
        margin-bottom: var(--gutter);
        display: block;
      }
      
      html[op='item'] span.titleline {
        font-size: 1.2rem;
      }

      .rank {
        display: none
      }

      html[op='news']        #hnmain > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(1),
      html[op='newest']      #hnmain > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(1),
      html[op='ask']         #hnmain > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(1),
      html[op='newcomments'] #hnmain > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(1),
      html[op='shownew']     #hnmain > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(1), 
      html[op='submitted']   #hnmain > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(1),
      html[op='favorites']   #hnmain > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(2),
      html[op='front']       #hnmain > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(2),
      html[op='show']        #hnmain > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > table:nth-child(2) {
         margin-left: var(--gutter);
      }

      .sitebit.comhead {
        margin-left: var(--gutter);
      }

      .subtext, .subline {
        font-size: .75rem;
      }

      #hnmain {
        width: 100%;
        background-color: white;
      }

      /* Menu bar */

      #hnmain > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) {
        padding: var(--gutter);
      }
      #hnmain > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) {
        padding-right: var(--gutter) !important;
      }


      .comment, .toptext {
        max-width: 40em;
      }
      .toptext, a {
        color: black;
      }
      a:visited {
        color: #4c2c92;
      }
      a:hover {
        text-decoration: underline;
      }
      

      input {
        padding: var(--gutter);
      }
      input, textarea {
        background-color: white;
        border: 2px solid var(--colour-hn-orange);
        border-radius: var(--border-radius);
      }
      input[type='button'], input[type='submit'] {
        cursor: pointer;
      }   


      /* Custom styles added via javascript */

      .downvoted {
        background-color: rgb(245, 245, 245);
        border-radius: var(--border-radius);
        padding: 6px;
      }
      .downvoted .commtext {
        color: black;
        font-size: smaller;
      }
      
      .quote {
        border-left: 3px solid var(--colour-hn-orange);
        padding: 6px 6px 6px 9px;
        font-style: italic;
        background-color: var(--colour-hn-orange-pale);
        border-radius: var(--border-radius);
      }
      
      .hidden {
        display: none;
      }

      .showComment a, .hideComment, .hideComment:link, .hideComment:visited {
        color: var(--colour-hn-orange);
        text-decoration: underline;
      }
      .hideComment {
        margin-left: var(--gutter);
      }

      .commentSort {
        display: block;
        margin: var(--gutter) 0 var(--gutter) var(--gutter);
        font-size: .75rem;
      }
      .commentSort select {
        font-family: 'Verdana', 'Arial', sans-serif;
        font-size: .75rem;
        border: 1px solid var(--colour-hn-orange);
        border-radius: var(--border-radius);
        background-color: white;
        padding: 2px 4px;
      }

    </style>`);

    const comments = document.querySelectorAll('.commtext');
    comments.forEach(e => {
        if (!e.classList.contains('c00')) {
            e.parentElement.classList.add('downvoted');
        }
    });

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

    const addComment = document.querySelector("html[op='item'] .fatitem tr:last-of-type");
    if (addComment) {
        addComment.classList.add('hidden');
        const showComment = document.createElement('tr');
        showComment.innerHTML = `
           <td colspan='2'></td>
           <td>
             <a href='#'>show comment box</a>
           </td>
        `;
        showComment.classList.add('showComment');
        showComment.querySelector('a').addEventListener('click', (e) => {
            showComment.classList.toggle('hidden');
            addComment.classList.toggle('hidden');
        });
        addComment.parentNode.insertBefore(showComment, addComment);

        const hideComment = document.createElement('a');
        hideComment.setAttribute('href', '#');
        hideComment.innerText = 'hide comment box';
        hideComment.classList.add('hideComment');
        hideComment.addEventListener('click', (e) => {
            showComment.classList.toggle('hidden');
            addComment.classList.toggle('hidden');
        });

        const commentForm = document.querySelector("form[action='comment']");
        commentForm.append(hideComment);
    }

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
