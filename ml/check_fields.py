# ml/check_fields.py
from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://mohitjangir814:Hastalavista.0@promptbook.shmonje.mongodb.net/?retryWrites=true&w=majority&appName=Promptbook"
client = MongoClient(MONGODB_URI)

print("\n=== Databases ===")
for db_name in client.list_database_names():
    print("-", db_name)

print("\n=== Collections in each DB ===")
for db_name in client.list_database_names():
    db = client[db_name]
    print(f"\n{db_name}:")
    for coll_name in db.list_collection_names():
        print("  -", coll_name)
