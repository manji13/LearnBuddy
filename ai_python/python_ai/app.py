import os
import io
import httpx

from flask import Flask, request, jsonify
from flask_cors import CORS

import PyPDF2
import docx

from services.problemGenerator.qaService import (
    generate_qa_from_text,
    summarize_notes_from_text,
    analyse_exam_from_text,
)

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────────────────────────────────────
#  Ollama config
# ─────────────────────────────────────────────────────────────────────────────
OLLAMA_URL    = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:latest")

STYLE_PROMPTS = {
    "concise":  "Summarize the following text in 2-4 concise sentences. Be clear and direct.",
    "detailed": "Provide a detailed summary covering all key points and main ideas.",
    "bullet":   "Summarize as a bullet-point list of the most important points. Use • as bullet character.",
}

# ─────────────────────────────────────────────────────────────────────────────
#  Ollama helpers  (sync httpx — no asyncio needed for Flask)
# ─────────────────────────────────────────────────────────────────────────────
def ollama_is_running() -> bool:
    try:
        r = httpx.get(OLLAMA_URL, timeout=3.0)
        return r.status_code == 200
    except Exception:
        return False

def get_ollama_models() -> list:
    try:
        r = httpx.get(f"{OLLAMA_URL}/api/tags", timeout=5.0)
        if r.status_code == 200:
            return [m["name"] for m in r.json().get("models", [])]
    except Exception:
        pass
    return []

def summarize_with_ollama(text: str, model: str, style: str) -> str:
    prompt_prefix = STYLE_PROMPTS.get(style, STYLE_PROMPTS["concise"])
    prompt = f"{prompt_prefix}\n\nText to summarize:\n\n{text}\n\nSummary:"
    r = httpx.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model":   model,
            "prompt":  prompt,
            "stream":  False,
            "options": {"temperature": 0.3, "top_p": 0.9},
        },
        timeout=120.0,
    )
    if r.status_code != 200:
        raise ValueError(f"Ollama error {r.status_code}: {r.text}")
    return r.json().get("response", "").strip()

def extract_text_from_file(file) -> str:
    filename = file.filename or ""
    content  = file.read()

    if filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    elif filename.endswith(".docx"):
        d = docx.Document(io.BytesIO(content))
        return "\n".join(p.text for p in d.paragraphs if p.text.strip())

    elif filename.endswith(".txt"):
        try:
            return content.decode("utf-8")
        except Exception:
            return content.decode("latin-1")

    else:
        raise ValueError("Unsupported file type. Use .pdf, .docx, or .txt")

# ─────────────────────────────────────────────────────────────────────────────
#  Existing routes  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/generate-qa", methods=["POST"])
def generate_qa():
    try:
        data       = request.get_json(silent=True) or {}
        text       = data.get("text", "")
        difficulty = data.get("difficulty", "medium")
        if not text or not text.strip():
            return jsonify({"error": "'text' is required and cannot be empty"}), 400
        result = generate_qa_from_text(text=text, difficulty=difficulty)
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as exc:
        print(f"Error in /generate-qa: {exc}", flush=True)
        return jsonify({"error": f"Failed to generate questions: {exc}"}), 500


@app.route("/summarize-notes", methods=["POST"])
def summarize_notes():
    try:
        data = request.get_json(silent=True) or {}
        text = data.get("text", "")
        if not text or not text.strip():
            return jsonify({"error": "'text' is required and cannot be empty"}), 400
        result = summarize_notes_from_text(text=text)
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as exc:
        print(f"Error in /summarize-notes: {exc}", flush=True)
        return jsonify({"error": f"Failed to summarize notes: {exc}"}), 500


@app.route("/analyse-exam", methods=["POST"])
def analyse_exam():
    try:
        data = request.get_json(silent=True) or {}
        text = data.get("text", "")
        if not text or not text.strip():
            return jsonify({"error": "'text' is required and cannot be empty"}), 400
        result = analyse_exam_from_text(text=text)
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as exc:
        print(f"Error in /analyse-exam: {exc}", flush=True)
        return jsonify({"error": f"Failed to analyse exam: {exc}"}), 500


# ─────────────────────────────────────────────────────────────────────────────
#  NEW — Ollama summariser routes
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/summarize/health", methods=["GET"])
def summarize_health():
    running = ollama_is_running()
    models  = get_ollama_models() if running else []
    return jsonify({
        "status":           "ok",
        "ollama_connected": running,
        "ollama_url":       OLLAMA_URL,
        "models":           models,
    }), 200


@app.route("/summarize/models", methods=["GET"])
def summarize_models():
    models = get_ollama_models()
    if not models:
        return jsonify({"error": "Ollama not reachable or no models installed. Run: ollama pull llama3.2"}), 503
    return jsonify({"models": models}), 200


@app.route("/summarize/text", methods=["POST"])
def summarize_text():
    try:
        data  = request.get_json(silent=True) or {}
        text  = data.get("text", "")
        model = data.get("model", DEFAULT_MODEL)
        style = data.get("style", "concise")

        if not text or not text.strip():
            return jsonify({"error": "'text' is required and cannot be empty"}), 400
        if len(text) > 50000:
            return jsonify({"error": "Text too long (max 50,000 characters)"}), 400

        summary = summarize_with_ollama(text, model, style)
        return jsonify({
            "summary":         summary,
            "original_length": len(text),
            "summary_length":  len(summary),
            "model":           model,
            "style":           style,
        }), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 502
    except httpx.ConnectError:
        return jsonify({"error": "Cannot connect to Ollama. Make sure it is running."}), 503
    except httpx.TimeoutException:
        return jsonify({"error": "Ollama timed out. The model may still be loading."}), 504
    except Exception as exc:
        print(f"Error in /summarize/text: {exc}", flush=True)
        return jsonify({"error": f"Summarisation failed: {exc}"}), 500


@app.route("/summarize/file", methods=["POST"])
def summarize_file():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded. Send a multipart/form-data request with a 'file' field."}), 400

        file  = request.files["file"]
        model = request.form.get("model", DEFAULT_MODEL)
        style = request.form.get("style", "concise")

        text = extract_text_from_file(file)

        if not text.strip():
            return jsonify({"error": "Could not extract text from file"}), 400

        summary = summarize_with_ollama(text[:50000], model, style)
        return jsonify({
            "summary":         summary,
            "original_length": len(text),
            "summary_length":  len(summary),
            "filename":        file.filename,
            "model":           model,
            "style":           style,
        }), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except httpx.ConnectError:
        return jsonify({"error": "Cannot connect to Ollama. Make sure it is running."}), 503
    except httpx.TimeoutException:
        return jsonify({"error": "Ollama timed out. The model may still be loading."}), 504
    except Exception as exc:
        print(f"Error in /summarize/file: {exc}", flush=True)
        return jsonify({"error": f"Summarisation failed: {exc}"}), 500


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PYTHON_QA_PORT", "8000"))
    app.run(host="0.0.0.0", port=port)