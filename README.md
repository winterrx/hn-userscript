# hn-userscript

Personal Tampermonkey userscript for news.ycombinator.com.

Forked from [mgladdish/website-customisations](https://github.com/mgladdish/website-customisations)
(MIT licensed) as of its v31, with an added comment sort control.

## Features (from upstream)

- Legibility/layout cleanup (fonts, spacing, menu bar)
- Greys out downvoted comments
- Renders `>`-quoted text as styled blockquotes
- Collapsible "add comment" box on item pages

## Added in this fork

- A "Sort by" dropdown on item pages: Default / Newest / Oldest / Most replies.
  HN doesn't expose comment point scores to most users, so "most upvotes"
  isn't reliably available — reply count is used as the closest honest proxy.
  Sorting only reorders siblings within each parent, so reply nesting/threading
  is preserved.

## Install

Add via Tampermonkey using the raw URL:

```
https://raw.githubusercontent.com/winterrx/hn-userscript/main/tampermonkey.js
```
