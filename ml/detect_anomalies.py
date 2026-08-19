import os
import psycopg2
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
)

query = 'SELECT id, user_id AS "userId", date, category, amount FROM expense ORDER BY user_id, date'
expenses_df = pd.read_sql(query, conn)

if expenses_df.empty:
    print("No expenses found. Nothing to analyze.")
    conn.close()
    exit()

results = []

for user_id, user_df in expenses_df.groupby("userId"):
    if len(user_df) < 10:
        continue

    user_df = user_df.copy()
    user_df["date"] = pd.to_datetime(user_df["date"])
    user_df["day_of_week"] = user_df["date"].dt.dayofweek
    user_df["category_code"] = user_df["category"].astype("category").cat.codes

    # the key signal: how far is this amount from THIS user's normal amount
    # for THIS SAME category (not their overall average across everything)
    cat_mean = user_df.groupby("category")["amount"].transform("mean")
    cat_std = user_df.groupby("category")["amount"].transform("std").fillna(1).replace(0, 1)
    user_df["amount_zscore_in_category"] = (user_df["amount"] - cat_mean) / cat_std

    raw_features = user_df[["amount", "amount_zscore_in_category", "day_of_week", "category_code"]]

    scaler = StandardScaler()
    features = scaler.fit_transform(raw_features)

    model = IsolationForest(contamination=0.05, random_state=42)
    user_df["anomaly_flag"] = model.fit_predict(features)
    user_df["anomaly_score"] = model.decision_function(features)

    anomalies = user_df[user_df["anomaly_flag"] == -1]

    for _, row in anomalies.iterrows():
        results.append({
            "user_id": user_id,
            "expense_id": int(row["id"]),
            "anomaly_score": float(row["anomaly_score"]),
        })

print(f"Found {len(results)} anomalies across all users.")

with conn.cursor() as cur:
    for r in results:
        cur.execute(
            """
            INSERT INTO anomalies (user_id, expense_id, anomaly_score)
            VALUES (%s, %s, %s)
            ON CONFLICT (expense_id) DO NOTHING
            """,
            (r["user_id"], r["expense_id"], r["anomaly_score"]),
        )
    conn.commit()

conn.close()
print("Done.")
