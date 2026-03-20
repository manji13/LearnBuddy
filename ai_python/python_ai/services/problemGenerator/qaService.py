import os
from typing import Any, Dict, List

from collections import Counter

from dotenv import load_dotenv

load_dotenv()


def _extract_keywords(text: str, max_len: int = 60) -> List[str]:
    """Very simple keyword extractor for mock questions.

    This is NOT real NLP, just enough to make the demo believable
    without any paid API.
    """

    # Take first chunk of the text and split into sentences
    clean = " ".join(text.replace("\n", " ").split())
    if len(clean) > 2000:
        clean = clean[:2000]

    parts = [p.strip() for p in clean.replace("?", ".").split(".") if p.strip()]
    topics: List[str] = []
    for p in parts:
        if len(topics) >= 5:
            break
        if 15 <= len(p) <= 180:
            topics.append(p[:max_len])

    if not topics:
        topics = [clean[:max_len] or "the main concepts in this module"]

    return topics


def summarize_notes_from_text(text: str, max_sentences: int = 5) -> Dict[str, Any]:
    """Create a clearer, structured summary from lecture notes.

    Uses simple keyword + frequency analysis (no paid APIs) to pick
    the most important sentences, then builds:
      - summary: list of key-point sentences
      - summaryParagraph: short, easy-to-read overview
      - keywords: top recurring important words
    """

    if not text or not text.strip():
        raise ValueError("Input text is empty")

    # Basic cleanup: remove odd bullet characters and keep simple punctuation
    filtered_chars: List[str] = []
    for ch in text:
        if ch.isalnum() or ch.isspace() or ch in ",.;:-()/%":
            filtered_chars.append(ch)
        else:
            # Replace unusual symbols (e.g. PDF bullets) with a space
            filtered_chars.append(" ")

    clean = " ".join("".join(filtered_chars).replace("\n", " ").split())
    if len(clean) > 6000:
        clean = clean[:6000]

    # Split into simple sentences
    raw_sentences = [p.strip() for p in clean.replace("?", ".").split(".") if p.strip()]
    if not raw_sentences:
        short = clean[:220]
        return {
            "summary": [short],
            "summaryParagraph": short,
            "summaryShort": short,
            "keywords": [],
        }

    # Tokenize and compute word frequencies to approximate importance
    stop_words = {
        "the",
        "a",
        "an",
        "and",
        "or",
        "of",
        "in",
        "to",
        "for",
        "on",
        "is",
        "are",
        "was",
        "were",
        "it",
        "this",
        "that",
        "with",
        "as",
        "by",
        "at",
        "from",
    }

    words: List[str] = []
    for token in clean.lower().split():
        token = "".join(ch for ch in token if ch.isalnum())
        if not token or token in stop_words or token.isdigit():
            continue
        words.append(token)

    freq = Counter(words)

    # Score sentences by the sum of important word frequencies
    scored: List[tuple[float, str]] = []
    for s in raw_sentences:
        s_clean = s.strip()
        if len(s_clean) < 25:
            continue
        score = 0.0
        for token in s_clean.lower().split():
            token = "".join(ch for ch in token if ch.isalnum())
            if not token:
                continue
            score += freq.get(token, 0)
        if score == 0:
            continue
        scored.append((score, s_clean))

    # Fallback if scoring removed everything
    if not scored:
        summary_sentences = raw_sentences[:max_sentences]
    else:
        scored.sort(reverse=True, key=lambda x: x[0])
        summary_sentences = [s for _score, s in scored[:max_sentences]]

    # Build a very clear overview paragraph
    if summary_sentences:
        if len(summary_sentences) == 1:
            summary_paragraph = f"In simple terms, this lecture mainly explains {summary_sentences[0].rstrip('.')}."
        else:
            first = summary_sentences[0].rstrip(".")
            rest = " ".join(summary_sentences[1:])
            summary_paragraph = (
                f"In simple terms, this lecture mainly focuses on {first}. "
                f"It also covers key ideas such as {rest}"
            )
    else:
        summary_paragraph = clean[:220]

    # Short, student-friendly version of the paragraph
    summary_short = summary_paragraph
    max_len = 260
    if len(summary_short) > max_len:
        # Cut at word boundary and add ellipsis
        cut = summary_short[:max_len]
        if " " in cut:
            cut = cut.rsplit(" ", 1)[0]
        summary_short = cut + "..."

    # Extract top keywords for display
    top_keywords = [w for w, _c in freq.most_common(6)]

    return {
        "summary": summary_sentences,
        "summaryParagraph": summary_paragraph,
        "summaryShort": summary_short,
        "keywords": top_keywords,
    }


def generate_qa_from_text(text: str, difficulty: str = "medium") -> Dict[str, Any]:
    """Generate 10 mock exam-style MCQs from text, without paid APIs.

    Each question has 4 options and a correct index so the
    frontend can run a quiz, show marks, and display answers.
    This stays high-level and avoids step-by-step assignment
    or take-home exam solutions.
    """

    if not text or not text.strip():
        raise ValueError("Input text is empty")

    difficulty = (difficulty or "medium").lower()
    topics = _extract_keywords(text)

    stems = {
        "easy": [
            "Briefly explain",
            "Define",
            "What is meant by",
            "List and describe",
            "State the purpose of",
        ],
        "medium": [
            "Explain the concept of",
            "Discuss the role of",
            "Compare and contrast",
            "Describe the key characteristics of",
            "Outline the main steps involved in",
        ],
        "hard": [
            "Critically evaluate",
            "Analyse how",
            "Discuss the advantages and limitations of",
            "Explain, with justification, how you would apply",
            "Assess the impact of",
        ],
    }

    chosen_stems = stems.get(difficulty, stems["medium"])

    questions: List[Dict[str, Any]] = []
    for i in range(10):
        stem = chosen_stems[i % len(chosen_stems)]
        topic = topics[i % len(topics)]
        q = f"{stem} {topic}."

        # High-level correct answer description
        correct_answer = (
            "A clear, structured explanation that summarises the core ideas "
            "from the course material about this topic, using correct "
            "terminology and reasonable justification, without step-by-step "
            "assignment or take-home exam solutions."
        )

        # Simple generic distractors so the frontend can run a quiz.
        # These are intentionally generic because we are not using a
        # real LLM here.
        options = [
            correct_answer,
            "A vague description that does not properly address the main ideas.",
            "An incorrect explanation that mixes unrelated concepts.",
            "A statement that contradicts standard university-level understanding.",
        ]

        questions.append(
            {
                "question": q,
                # Multiple choice structure for the quiz UI
                "options": options,
                "correctIndex": 0,
                # Keep a text answer for compatibility or future use
                "answer": correct_answer,
            }
        )

    return {"questions": questions}


def analyse_exam_from_text(text: str) -> Dict[str, Any]:
    """Lightweight exam difficulty analyser without paid APIs.

    It looks at question verbs (explain/define/list/discuss/evaluate...) and
    rough question length to estimate difficulty and mix of question types.
    The goal is to give students a simple, useful insight, not a perfect
    academic classification.
    """

    if not text or not text.strip():
        raise ValueError("Input text is empty")

    clean = " ".join(text.replace("\n", " ").split())
    if len(clean) > 8000:
        clean = clean[:8000]

    # Split on question marks and full stops to approximate questions
    raw_blocks = [p.strip() for p in clean.replace("?", ".").split(".") if p.strip()]

    if not raw_blocks:
        return {
            "difficulty": "Unknown",
            "estimatedDurationMinutes": 0,
            "questionTypeBreakdown": [],
            "topics": [],
        }

    verbs_low = {
        "define": "theory",
        "list": "short",
        "state": "short",
        "identify": "short",
        "what": "theory",
    }
    verbs_mid = {
        "explain": "short",
        "describe": "theory",
        "compare": "long",
        "contrast": "long",
        "outline": "short",
    }
    verbs_high = {
        "discuss": "long",
        "evaluate": "long",
        "analyse": "long",
        "analyze": "long",
        "justify": "long",
        "critically": "long",
    }

    type_counts = {"theory": 0, "short": 0, "long": 0}
    difficulty_score = 0

    topics_raw: List[str] = []

    for block in raw_blocks:
        text_block = block.strip()
        if len(text_block) < 20:
            continue

        lower = text_block.lower()
        length = len(text_block)

        q_type = "theory"
        matched = False
        for verb, t in verbs_low.items():
            if verb in lower:
                q_type = t
                difficulty_score += 1
                matched = True
                break
        if not matched:
            for verb, t in verbs_mid.items():
                if verb in lower:
                    q_type = t
                    difficulty_score += 2
                    matched = True
                    break
        if not matched:
            for verb, t in verbs_high.items():
                if verb in lower:
                    q_type = t
                    difficulty_score += 3
                    matched = True
                    break

        # Adjust by length: very long questions are likely more complex
        if length > 260:
            difficulty_score += 2
            q_type = "long"
        elif length > 140:
            difficulty_score += 1

        type_counts[q_type] += 1

        # Collect a short topic phrase from start of block
        topics_raw.append(text_block[:120])

    total_q = sum(type_counts.values()) or 1

    avg_score = difficulty_score / total_q
    if avg_score < 1.8:
        difficulty = "Easy"
    elif avg_score < 2.6:
        difficulty = "Medium"
    else:
        difficulty = "Hard"

    breakdown: List[Dict[str, Any]] = []
    labels = {
        "theory": "Theory / recall",
        "short": "Short answers",
        "long": "Long explanations / essays",
    }
    for key, count in type_counts.items():
        if count == 0:
            continue
        pct = round((count / total_q) * 100)
        breakdown.append({"label": labels[key], "percentage": pct})

    # Estimate exam duration by assuming rough minutes per question type
    minutes = type_counts["theory"] * 2 + type_counts["short"] * 4 + type_counts["long"] * 10

    # Topic keywords from earlier helper
    topic_keywords = _extract_keywords(clean, max_len=80)

    return {
        "difficulty": difficulty,
        "estimatedDurationMinutes": minutes,
        "questionTypeBreakdown": breakdown,
        "topics": topic_keywords,
        "totalQuestionsEstimated": total_q,
    }
