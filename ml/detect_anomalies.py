import os
import psycopg2
from psycopg2.extras import RealDictCursor
from sklearn.ensemble import IsolationForest
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

# Step 1: pull every user's expenses into a table pandas can work with
query = 'SELECT id, user_id AS "userId", date, category, amount FROM expense ORDER BY user_id, date'
expenses_df = pd.read_sql(query, conn)

if expenses_df.empty:
    print("No expenses found. Nothing to analyze.")
    conn.close()
    exit()

results = []

# Step 2: run anomaly detection separately for each user
# (spending patterns are personal, so we don't mix users together)
for user_id, user_df in expenses_df.groupby("userId"):
    if len(user_df) < 10:
        # not enough data yet for this user's patterns to mean anything
        continue

    user_df = user_df.copy()
    user_df["date"] = pd.to_datetime(user_df["date"])
    user_df["day_of_week"] = user_df["date"].dt.dayofweek  # 0=Monday ... 6=Sunday

    # turn category text into a number the model can use
    user_df["category_code"] = user_df["category"].astype("category").cat.codes

    # how many days since the last expense in the same category
    user_df = user_df.sort_values("date")
    user_df["days_since_last_same_category"] = (
        user_df.groupby("category")["date"].diff().dt.days.fillna(999)
    )

    features = user_df[["amount", "day_of_week", "category_code", "days_since_last_same_category"]]

    # contamination=0.05 means: assume roughly 5% of this user's expenses are unusual
    model = IsolationForest(contamination=0.05, random_state=42)
    user_df["anomaly_flag"] = model.fit_predict(features)   # -1 = anomaly, 1 = normal
    user_df["anomaly_score"] = model.decision_function(features)  # lower = more unusual

    anomalies = user_df[user_df["anomaly_flag"] == -1]

    for _, row in anomalies.iterrows():
        results.append({
            "user_id": user_id,
            "expense_id": int(row["id"]),
            "anomaly_score": float(row["anomaly_score"]),
        })

print(f"Found {len(results)} anomalies across all users.")

# Step 3: save results into the anomalies table (skip ones already flagged)
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
