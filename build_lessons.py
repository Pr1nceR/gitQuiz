"""Convert the study-guide markdown into lessons.js + highlight.css for the course app.

Each markdown file becomes one lesson with pre-rendered HTML, a heading outline
and an estimated reading time, so the course page needs no runtime dependencies.
"""

import json
import re
from datetime import date
from html import unescape
from pathlib import Path

import markdown
from markdown.extensions.codehilite import CodeHiliteExtension
from markdown.extensions.toc import TocExtension
from pygments.formatters import HtmlFormatter

BASE = Path(__file__).resolve().parent
REPO = BASE.parent / "github-copilot-certification-study-guide"
OUT_JS = BASE / "src" / "data" / "lessons.js"
OUT_CSS = BASE / "src" / "styles" / "highlight.css"

WORDS_PER_MINUTE = 220

# The source guides decorate headings with emoji. This paper marks with drawn
# strokes only, so pictographs are removed before the markdown is converted.
EMOJI = re.compile(
    "[\U0001F000-\U0001FAFF\U00002190-\U000021FF\U00002300-\U000027BF"
    "\U00002B00-\U00002BFF\U0000FE0F\U000024C2\U0000200D]+"
)


def deglyph(text):
    return re.sub(r"[ \t]{2,}", " ", EMOJI.sub("", text)).strip()


def deglyph_lines(text):
    """Remove pictographs line by line, keeping markdown indentation intact."""
    lines = []
    for line in text.splitlines():
        stripped = EMOJI.sub("", line)
        if stripped != line:
            indent = re.match(r"[ \t]*", stripped).group(0)
            stripped = indent + re.sub(r"[ \t]{2,}", " ", stripped[len(indent) :]).strip()
        lines.append(stripped)
    return "\n".join(lines)

SECTIONS = [
    {
        "id": "plan",
        "title": "Start here",
        "subtitle": "Your roadmap before the first lesson",
        "files": ["study-schedule.md"],
    },
    {
        "id": "materials",
        "title": "Study materials",
        "subtitle": "The 13 core guides - work through these in order",
        "files": [
            "study-materials/01-fundamentals.md",
            "study-materials/02-prompt-engineering.md",
            "study-materials/03-advanced-features.md",
            "study-materials/04-responsible-ai.md",
            "study-materials/05-plans-and-features.md",
            "study-materials/06-data-handling.md",
            "study-materials/07-testing-with-copilot.md",
            "study-materials/08-privacy-fundamentals.md",
            "study-materials/09-developer-use-cases.md",
            "study-materials/10-emerging-features-2025.md",
            "study-materials/quick-reference-cheat-sheet.md",
            "study-materials/troubleshooting-guide.md",
            "study-materials/11-percipio-course-review.md",
        ],
    },
    {
        "id": "practice",
        "title": "Practice exercises",
        "subtitle": "Hands-on work - do these in a real editor with Copilot on",
        "files": [
            "practice-exercises/beginner-exercises.md",
            "practice-exercises/intermediate-exercises.md",
            "practice-exercises/advanced-exercises.md",
            "practice-exercises/coding-challenges.md",
            "practice-exercises/emerging-features-exercises.md",
        ],
    },
    {
        "id": "patterns",
        "title": "Reference",
        "subtitle": "Patterns to keep open while you work",
        "files": ["code-examples/prompt-patterns.md"],
    },
]

H1 = re.compile(r"^#\s+(.+?)\s*$", re.MULTILINE)
TASK_ITEM = re.compile(r"<li>\s*\[([ xX])\]\s*")
MERMAID_FENCE = re.compile(r"^```mermaid[ \t]*\n(.*?)\n```[ \t]*$", re.DOTALL | re.MULTILINE)


def extract_mermaid(raw):
    """Pull mermaid fences out before markdown so they survive as raw diagram source."""
    blocks = []

    def repl(match):
        blocks.append(match.group(1))
        return f"\n\nMERMAIDPLACEHOLDER{len(blocks) - 1}\n\n"

    return MERMAID_FENCE.sub(repl, raw), blocks


def restore_mermaid(html, blocks):
    for index, code in enumerate(blocks):
        escaped = code.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        html = html.replace(
            f"<p>MERMAIDPLACEHOLDER{index}</p>",
            f'<pre class="mermaid">{escaped}</pre>',
        )
    return html


def taskify(html):
    """Turn `- [ ]` list items into real checkboxes the course page can persist."""
    index = [0]

    def repl(match):
        checked = " data-default=\"1\"" if match.group(1).lower() == "x" else ""
        item = (f'<li class="task"><input type="checkbox" class="task-box" '
                f'data-task="{index[0]}"{checked} />')
        index[0] += 1
        return item

    return TASK_ITEM.sub(repl, html)


def slug(path):
    return re.sub(r"[^a-z0-9]+", "-", Path(path).stem.lower()).strip("-")


def flatten_toc(tokens, depth=0, out=None):
    out = [] if out is None else out
    for token in tokens:
        out.append({"id": token["id"], "text": deglyph(unescape(token["name"])), "level": depth})
        if depth < 1:
            flatten_toc(token["children"], depth + 1, out)
    return out


def build_lesson(rel_path):
    raw = deglyph_lines((REPO / rel_path).read_text(encoding="utf-8"))

    title = rel_path
    heading = H1.search(raw)
    if heading and raw.lstrip().startswith("#"):
        title = heading.group(1)
        raw = raw.replace(heading.group(0), "", 1).lstrip("\n")

    words = len(re.findall(r"[\w'-]+", raw))
    raw, mermaid_blocks = extract_mermaid(raw)

    md = markdown.Markdown(
        extensions=[
            "extra",
            "sane_lists",
            CodeHiliteExtension(guess_lang=False),
            TocExtension(permalink=False, toc_depth="2-3"),
        ]
    )
    html = md.convert(raw)
    html = restore_mermaid(html, mermaid_blocks)
    html = taskify(html)

    return {
        "id": slug(rel_path),
        "title": title,
        "source": rel_path,
        "words": words,
        "minutes": max(1, round(words / WORDS_PER_MINUTE)),
        "toc": flatten_toc(getattr(md, "toc_tokens", [])),
        "html": html,
    }


def build():
    sections = []
    for meta in SECTIONS:
        lessons = [build_lesson(f) for f in meta["files"]]
        sections.append(
            {
                "id": meta["id"],
                "title": meta["title"],
                "subtitle": meta["subtitle"],
                "lessons": lessons,
            }
        )
        print(f"{meta['id']}: {len(lessons)} lessons, "
              f"{sum(l['minutes'] for l in lessons)} min reading")

    payload = {"generated": date.today().isoformat(), "sections": sections}
    OUT_JS.write_text(
        "export default " + json.dumps(payload, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )

    try:
        formatter = HtmlFormatter(style="github-dark")
    except Exception:
        formatter = HtmlFormatter(style="monokai")
    OUT_CSS.write_text(formatter.get_style_defs(".codehilite"), encoding="utf-8")

    total = sum(len(s["lessons"]) for s in sections)
    print(f"wrote {OUT_JS} ({total} lessons, {OUT_JS.stat().st_size // 1024} KB)")
    print(f"wrote {OUT_CSS}")


if __name__ == "__main__":
    build()
