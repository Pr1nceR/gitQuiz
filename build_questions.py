"""Parse the study-guide mock-question markdown into questions.js for the quiz app.

The four practice tests use four slightly different markdown layouts, so the
parser is deliberately tolerant: it splits on numbered headings and picks up
options, answers and explanations wherever they appear in the block.
"""

import json
import re
from datetime import date
from pathlib import Path

BASE = Path(__file__).resolve().parent
SRC = BASE.parent / "github-copilot-certification-study-guide" / "mock-questions"
OUT = BASE / "src" / "data" / "questions.js"

HEADING = re.compile(r"^#{2,4}\s+(?:Question\s+)?(\d+)[.:]?\s*(.*)$")
OPTION = re.compile(r"^\s*([A-Da-d])\)\s+(.+?)\s*$")
ANSWER = re.compile(r"\*\*Answer:\s*([A-Da-d]|True|False)\*\*", re.IGNORECASE)
EXPL_BOLD = re.compile(r"\*\*Explanation:\*\*\s*(.+?)\s*$")
EXPL_ITALIC = re.compile(r"^\*(?!\*)(.+?)\*$")
STOP = re.compile(
    r"^#{1,3}\s*(Answer Key|Answer Summary|Scoring|Review Areas|Study Recommendations)",
    re.IGNORECASE,
)
KEY4 = re.compile(r"^\*\*(\d+)\.\s*([A-D])\s*[-\u2013\u2014]\s*(.*?)\*\*")

TESTS = [
    {
        "id": "test1",
        "file": "practice-test-1.md",
        "title": "Test 1 - Fundamentals",
        "minutes": 90,
        "pass": 75,
    },
    {
        "id": "test2",
        "file": "practice-test-2.md",
        "title": "Test 2 - Advanced & Enterprise",
        "minutes": 45,
        "pass": 80,
    },
    {
        "id": "test3",
        "file": "practice-test-3.md",
        "title": "Test 3 - Comprehensive Review",
        "minutes": 45,
        "pass": 80,
    },
    {
        "id": "test4",
        "file": "practice-test-4-emerging-features.md",
        "title": "Test 4 - Emerging Features (2024-2025)",
        "minutes": 45,
        "pass": 80,
    },
    {
        "id": "test5",
        "file": "practice-test-5-percipio.md",
        "title": "Test 5 - Percipio Course Review",
        "minutes": 60,
        "pass": 80,
    },
]


def split_blocks(lines):
    """Yield (number, heading_remainder, body_lines) for each numbered question."""
    blocks = []
    current = None
    fence = False
    for line in lines:
        if line.lstrip().startswith("```"):
            fence = not fence
        elif not fence:
            if STOP.match(line):
                break
            heading = HEADING.match(line)
            if heading:
                if current:
                    blocks.append(current)
                current = (int(heading.group(1)), heading.group(2).strip(), [])
                continue
        if current:
            current[2].append(line)
    if current:
        blocks.append(current)
    return blocks


def parse_block(number, heading_rest, body):
    text_lines = []
    options = []
    answer = None
    explanation = None
    fence = False

    for line in body:
        if line.lstrip().startswith("```"):
            fence = not fence
            text_lines.append(line)
            continue
        if not fence:
            stripped = line.strip()
            if stripped == "---":
                continue
            option = OPTION.match(line)
            if option and answer is None:
                options.append({"key": option.group(1).upper(), "text": option.group(2).strip()})
                continue
            found = ANSWER.search(line)
            if found:
                answer = found.group(1)
                continue
            found = EXPL_BOLD.search(line)
            if found:
                explanation = found.group(1).strip()
                continue
            found = EXPL_ITALIC.match(stripped)
            if found and answer is not None:
                explanation = found.group(1).strip()
                continue
        if not options:
            text_lines.append(line)

    text = "\n".join(text_lines).strip("\n").strip()
    topic = heading_rest
    if not text:
        text, topic = heading_rest, ""

    if not text:
        return None

    if answer and answer.lower() in ("true", "false"):
        options = [{"key": "A", "text": "True"}, {"key": "B", "text": "False"}]
        answer = "A" if answer.lower() == "true" else "B"
    elif answer:
        answer = answer.upper()

    if not options:
        return None

    return {
        "n": number,
        "topic": topic,
        "text": text,
        "options": options,
        "answer": answer,
        "explanation": explanation,
    }


def parse_answer_key_4(lines):
    """Test 4 keeps its answers in a trailing 'Answer Key' section."""
    key = {}
    pending = None
    for line in lines:
        match = KEY4.match(line.strip())
        if match:
            pending = int(match.group(1))
            key[pending] = {"answer": match.group(2), "explanation": None}
            continue
        if pending is not None:
            italic = EXPL_ITALIC.match(line.strip())
            if italic:
                key[pending]["explanation"] = italic.group(1).strip()
                pending = None
    return key


def build():
    supplement = json.loads((BASE / "explanations-test-1.json").read_text(encoding="utf-8"))
    tests = []

    for meta in TESTS:
        lines = (SRC / meta["file"]).read_text(encoding="utf-8").splitlines()
        questions = [q for q in (parse_block(*b) for b in split_blocks(lines)) if q]

        if meta["id"] == "test4":
            key = parse_answer_key_4(lines)
            for question in questions:
                entry = key.get(question["n"])
                if entry:
                    question["answer"] = entry["answer"]
                    question["explanation"] = entry["explanation"]

        if meta["id"] == "test1":
            for question in questions:
                question["explanation"] = supplement.get(str(question["n"]))

        questions = [q for q in questions if q["answer"]]
        for question in questions:
            keys = {o["key"] for o in question["options"]}
            if question["answer"] not in keys:
                raise ValueError(f"{meta['id']} Q{question['n']}: answer not among options")

        tests.append(
            {
                "id": meta["id"],
                "title": meta["title"],
                "minutes": meta["minutes"],
                "pass": meta["pass"],
                "questions": questions,
            }
        )
        print(f"{meta['id']}: {len(questions)} questions, "
              f"{sum(1 for q in questions if q['explanation'])} with explanations")

    payload = {"generated": date.today().isoformat(), "tests": tests}
    OUT.write_text(
        "export default " + json.dumps(payload, indent=1, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT} ({sum(len(t['questions']) for t in tests)} questions total)")


if __name__ == "__main__":
    build()
