import sqlite3

# Specify the database file
db_path = 'C:/Users/yuvra/Downloads/Flower-Billing-System-main/Flower-Billing-System-main/backend/flower_shop.db'  # replace with your database file path
table_name = 'customers'     # replace with the name of the table you want to delete

# Connect to the SQLite database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Drop the table if it exists
try:
    cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
    conn.commit()
    print(f"Table '{table_name}' deleted successfully.")
except sqlite3.Error as e:
    print(f"An error occurred: {e}")
finally:
    conn.close()
