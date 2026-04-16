import os

from flask import Flask, request, jsonify
from flask_cors import CORS

from services.problemGenerator.qaService import (
    generate_qa_from_text,
    summarize_notes_from_text,
    analyse_exam_from_text,
)

app = Flask(__name__)
CORS(app)


@app.route("/generate-qa", methods=["POST"])
def generate_qa():
    try:
        data = request.get_json(silent=True) or {}
        text = data.get("text", "")
        difficulty = data.get("difficulty", "medium")

        if not text or not text.strip():
            return jsonify({"error": "'text' is required and cannot be empty"}), 400

        result = generate_qa_from_text(text=text, difficulty=difficulty)
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as exc:  # noqa: BLE001
        # Log the actual error to server logs and also surface a helpful message in dev
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
    except Exception as exc:  # noqa: BLE001
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
    except Exception as exc:  # noqa: BLE001
        print(f"Error in /analyse-exam: {exc}", flush=True)
        return jsonify({"error": f"Failed to analyse exam: {exc}"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PYTHON_QA_PORT", "8000"))
    app.run(host="0.0.0.0", port=port)
