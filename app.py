import os
import re
from datetime import datetime, timedelta
from typing import Dict

from flask import Flask, jsonify, request


app = Flask(__name__)

CHAT_PASSWORD = os.getenv("CHAT_PASSWORD", "change-me")
SESSION_TTL_MINUTES = int(os.getenv("SESSION_TTL_MINUTES", "30"))

# NOTE: in production use Redis/DB. In-memory dict is for demo only.
sessions: Dict[str, datetime] = {}


MENTION_RE = re.compile(r"<users/[^>]+>")


def _user_id(payload: dict) -> str:
    return payload.get("user", {}).get("name", "unknown-user")


def _extract_message_text(payload: dict) -> str:
    """
    Supports both regular Google Chat client messages (`message.text`) and
    slash-command payloads (`message.argumentText`).
    """
    message = payload.get("message", {})
    text = (message.get("argumentText") or message.get("text") or "").strip()

    # In direct messages/mentions Google Chat can prepend mention tokens, e.g.
    # "<users/123456789> hello". Strip them so command parsing is stable.
    text = MENTION_RE.sub("", text).strip()
    return text


def _is_authenticated(user_id: str) -> bool:
    expires_at = sessions.get(user_id)
    if not expires_at:
        return False

    if expires_at < datetime.utcnow():
        sessions.pop(user_id, None)
        return False

    return True


def _login(user_id: str) -> None:
    sessions[user_id] = datetime.utcnow() + timedelta(minutes=SESSION_TTL_MINUTES)


@app.route("/chat", methods=["POST"])
def chat_webhook():
    payload = request.get_json(silent=True) or {}
    user_id = _user_id(payload)

    text = _extract_message_text(payload)

    if text.startswith("/login "):
        provided = text.removeprefix("/login ").strip()
        if provided == CHAT_PASSWORD:
            _login(user_id)
            return jsonify({"text": "✅ התחברת בהצלחה. עכשיו אפשר לשלוח הודעות."})
        return jsonify({"text": "❌ סיסמה שגויה. נסה שוב עם /login <password>"})

    if not _is_authenticated(user_id):
        return jsonify(
            {
                "text": (
                    "🔒 לפני שימוש בבוט צריך להתחבר. "
                    "מהקליינט הרגיל של Google Chat שלח /login <password>"
                )
            }
        )

    # כאן אפשר לחבר לוגיקה אמיתית (LLM, DB, APIs וכו')
    return jsonify({"text": f"קיבלתי ממך: {text}"})


@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8080")))
