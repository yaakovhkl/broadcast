# Google Chat bot server with password authentication

שרת Flask לבוט Google Chat שדורש סיסמה לפני שימוש.

## איך זה עובד (עם הקליינט הרגיל של Google Chat)

1. המשתמש כותב לבוט מתוך הקליינט הרגיל של Google Chat.
2. המשתמש שולח הודעה `/login <password>`.
3. אם הסיסמה נכונה נוצרת לו session זמני בזיכרון.
4. כל הודעה אחרת נבדקת מול ה-session:
   - אם המשתמש לא מחובר → הבוט מחזיר בקשה להתחברות.
   - אם מחובר → הבוט מטפל בהודעה.

השרת תומך גם ב-`message.text` (הודעות רגילות מהקליינט) וגם ב-`message.argumentText` (slash commands), ומנקה mention tokens של Google Chat כדי שהפקודה `/login` תעבוד עקבי.

> ⚠️ בגרסה הזאת ה-session נשמר בזיכרון (RAM), ולכן מתאים לפיתוח/POC.
> לפרודקשן עדיף Redis או DB + אימות חתימה של Google Chat requests.

## Local development

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export CHAT_PASSWORD='my-secret-password'
export SESSION_TTL_MINUTES='30'
python app.py
```

השרת יאזין ב-`http://0.0.0.0:8080`.

## Deploy (Docker / Cloud Run)

### 1) Build image locally

```bash
docker build -t gchat-password-bot .
```

### 2) Run container locally

```bash
docker run --rm -p 8080:8080 \
  -e CHAT_PASSWORD='my-secret-password' \
  -e SESSION_TTL_MINUTES='30' \
  gchat-password-bot
```

### 3) Deploy to Google Cloud Run

```bash
PROJECT_ID="your-project-id"
REGION="us-central1"
SERVICE="gchat-password-bot"

# Build + push באמצעות Cloud Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE

# Deploy
gcloud run deploy $SERVICE \
  --image gcr.io/$PROJECT_ID/$SERVICE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars CHAT_PASSWORD='my-secret-password',SESSION_TTL_MINUTES='30'
```

לאחר ה-deploy קבל URL ציבורי והגדר אותו ב-Google Chat בתור HTTP endpoint ל-`/chat`.

## בדיקה מקומית עם curl (פורמט הודעה רגיל של Google Chat)

```bash
# 1) בלי login
curl -s -X POST http://localhost:8080/chat \
  -H 'content-type: application/json' \
  -d '{"user":{"name":"users/123"},"message":{"text":"hello"}}'

# 2) login עם סיסמה נכונה
curl -s -X POST http://localhost:8080/chat \
  -H 'content-type: application/json' \
  -d '{"user":{"name":"users/123"},"message":{"text":"/login my-secret-password"}}'

# 3) הודעה אחרי login
curl -s -X POST http://localhost:8080/chat \
  -H 'content-type: application/json' \
  -d '{"user":{"name":"users/123"},"message":{"text":"שלום"}}'
```

## חיבור ל-Google Chat

ב-Google Cloud Console:

1. צור Google Chat API app.
2. הגדר **Connection settings** כ-HTTP endpoint אל `/chat`.
3. ודא שהמשתמשים מתקשרים דרך הקליינט הרגיל של Google Chat (DM או הודעה במרחב שבו הבוט קיים).
4. מומלץ להוסיף אימות request authenticity (JWT / verification) לפני פרודקשן.
