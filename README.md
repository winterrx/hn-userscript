# hn-userscript

Personal userscript for news.ycombinator.com (Violentmonkey / Tampermonkey).

Started as a fork of [mgladdish/website-customisations](https://github.com/mgladdish/website-customisations)
(MIT licensed), but as of v34 it's been stripped down to just two features —
everything else (font resets, layout/margin changes, downvoted-comment
greying, homepage restyling, comment-box collapsing) was removed on purpose.
Stock HN rendering everywhere else.

## Features

- **Comment sorting** — a "Sort by" dropdown on item pages: Default / Newest /
  Oldest / Most replies. HN doesn't expose comment point scores to most users,
  so "most upvotes" isn't reliably available — reply count is used as the
  closest honest proxy. Sorting only reorders siblings within each parent, so
  reply nesting/threading is preserved.
- **Inline quote styling** — `>`-quoted text in comments renders as a styled
  blockquote (left border, italic, light background) instead of a bare `>`.

## Install

With Violentmonkey (or Tampermonkey) installed, navigate to the raw URL — it's
recognized as a userscript and prompts to install automatically:

```
https://raw.githubusercontent.com/winterrx/hn-userscript/main/tampermonkey.user.js
```
