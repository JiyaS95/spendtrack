import os
import random
from datetime import date, timedelta
import psycopg2
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
)

USER_ID = "test@test.com"
today = date.today()

# "normal" pattern: small, frequent, spread across categories
normal_expenses = []
categories = ["Food", "Transport", "Entertainment", "Bills"]
for i in range(40):
    d = today - timedelta(days=random.randint(1, 90))
    cat = random.choice(categories)
    amount = round(random.uniform(8, 45), 2)  # normal small purchases
    normal_expenses.append((USER_ID, d, cat, amount, "seed data"))

# a few deliberately weird ones, so the model has something to catch
weird_expenses = [
    (USER_ID, today - timedelta(days=5), "Shopping", 480.00, "seed data - big shopping spree"),
    (USER_ID, today - timedelta(days=12), "Entertainment", 300.00, "seed data - concert tickets"),
    (USER_ID, today - timedelta(days=30), "Food", 210.00, "seed data - expensive dinner"),
]

all_expenses = normal_expenses + weird_expenses

with conn.cursor() as cur:
    for userId, d, cat, amount, note in all_expenses:
        cur.execute(
            'INSERT INTO expense (user_id, date, category, amount, note) VALUES (%s, %s, %s, %s, %s)',
            (userId, d, cat, amount, note),
        )
    conn.commit()

print(f"Inserted {len(all_expenses)} test expenses for {USER_ID}")
conn.close()
