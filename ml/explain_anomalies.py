import os
import psycopg2
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
)

with conn.cursor() as cur:
    cur.execute("""
        SELECT a.id, e.category, e.amount, e.date, e.note
        FROM anomalies a
        JOIN expense e ON a.expense_id = e.id
        WHERE a.reason IS NULL
    """)
    rows = cur.fetchall()

print(f"Explaining {len(rows)} anomalies...")

for anomaly_id, category, amount, exp_date, note in rows:
    prompt = (
        f"A person spent ${amount:.2f} in the '{category}' category on {exp_date}. "
        f"This purchase was flagged as unusual compared to their normal spending pattern "
        f"in that category. In ONE short, plain, friendly sentence (max 20 words), "
        f"explain why this might stand out. Do not use the word 'anomaly'. "
        f"Just describe it naturally, like a person would."
    )

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
        )
        reason = response.text.strip()
    except Exception as e:
        print(f"  Failed for anomaly {anomaly_id}: {e}")
        continue

    with conn.cursor() as cur:
        cur.execute(
            "UPDATE anomalies SET reason = %s WHERE id = %s",
            (reason, anomaly_id),
        )
    conn.commit()
    print(f"  #{anomaly_id}: {reason}")

conn.close()
print("Done.")
