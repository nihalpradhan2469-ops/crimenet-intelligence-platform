"""CrimeGraph AI - Synthetic Dataset Importer for Supabase.

Validates and imports CSV records from data/ into Supabase:
- persons.csv       -> persons
- vehicles.csv      -> vehicles
- locations.csv     -> locations
- cdr.csv           -> cdr
- firs.csv          -> firs
- movements.csv     -> movements
- relationships.csv -> relationships
- transactions.csv  -> transactions
- alerts.csv        -> alerts
"""

import csv
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple
import uuid

# Ensure root directory is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv

# Load backend environment variables
env_path = PROJECT_ROOT / "backend" / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

DATA_DIR = PROJECT_ROOT / "data"

REQUIRED_TABLES = [
    "locations",
    "persons",
    "vehicles",
    "firs",
    "movements",
    "cdr",
    "transactions",
    "relationships",
    "alerts",
]

CSV_SPECS = {
    "locations": {
        "filename": "locations.csv",
        "id_col": "location_id",
        "expected_columns": ["location_id", "location_name", "city", "area"],
    },
    "persons": {
        "filename": "persons.csv",
        "id_col": "person_id",
        "expected_columns": ["person_id", "name", "alias", "city", "record_date"],
    },
    "vehicles": {
        "filename": "vehicles.csv",
        "id_col": "vehicle_id",
        "expected_columns": ["vehicle_id", "owner_id", "registration", "vehicle_type"],
    },
    "firs": {
        "filename": "firs.csv",
        "id_col": "fir_id",
        "expected_columns": ["fir_id", "date", "text", "person_ids", "location_id"],
    },
    "movements": {
        "filename": "movements.csv",
        "id_col": "movement_id",
        "expected_columns": ["movement_id", "vehicle_id", "location_id", "timestamp"],
    },
    "cdr": {
        "filename": "cdr.csv",
        "id_col": "cdr_id",
        "expected_columns": ["cdr_id", "caller_id", "receiver_id", "timestamp", "duration_seconds"],
    },
    "transactions": {
        "filename": "transactions.csv",
        "id_col": "transaction_id",
        "expected_columns": ["transaction_id", "sender_id", "receiver_id", "amount_inr", "date", "method"],
    },
    "relationships": {
        "filename": "relationships.csv",
        "id_col": "relationship_id",
        "expected_columns": ["relationship_id", "source_entity", "target_entity", "relationship_type", "evidence_id"],
    },
    "alerts": {
        "filename": "alerts.csv",
        "id_col": "alert_id",
        "expected_columns": ["alert_id", "entity_id", "alert_type", "evidence_id", "confidence", "explanation"],
    },
}


def normalize_timestamp(val: Optional[str]) -> Optional[str]:
    """Parse and normalize date/datetime strings to ISO-8601 UTC timestamp string."""
    if not val or not val.strip():
        return None
    val = val.strip()
    formats = [
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        "%d-%m-%Y %H:%M",
        "%d-%m-%Y",
        "%Y/%m/%d %H:%M",
        "%Y/%m/%d",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(val, fmt)
            return dt.isoformat()
        except ValueError:
            continue
    return val


def check_tables_exist(client) -> Tuple[List[str], List[str]]:
    """Verify whether all required tables exist in Supabase."""
    existing = []
    missing = []
    for table_name in REQUIRED_TABLES:
        try:
            # Query 1 record to test if table exists in schema cache
            client.table(table_name).select("*", count="exact").limit(1).execute()
            existing.append(table_name)
        except Exception as e:
            missing.append(table_name)
    return existing, missing


def read_and_validate_csv(file_path: Path, spec: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Read CSV file, validate headers, detect duplicate IDs, and parse rows."""
    valid_rows = []
    errors = []
    id_col = spec["id_col"]
    expected_cols = spec["expected_columns"]
    seen_ids: Set[str] = set()

    if not file_path.exists():
        errors.append(f"File not found: {file_path}")
        return valid_rows, errors

    with open(file_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            errors.append(f"{file_path.name}: Empty file or missing header row.")
            return valid_rows, errors

        actual_cols = [c.strip() for c in reader.fieldnames if c]
        missing_cols = [c for c in expected_cols if c not in actual_cols]
        if missing_cols:
            errors.append(f"{file_path.name}: Missing required columns: {missing_cols}")
            return valid_rows, errors

        for line_num, raw_row in enumerate(reader, start=2):
            row = {k.strip(): (v.strip() if isinstance(v, str) else v) for k, v in raw_row.items() if k}
            record_id = row.get(id_col)

            # Validate ID
            if not record_id:
                errors.append(f"{file_path.name} [Line {line_num}]: Missing ID in column '{id_col}'")
                continue

            # Check duplicate ID within CSV
            if record_id in seen_ids:
                errors.append(f"{file_path.name} [Line {line_num}]: Duplicate ID detected '{record_id}' - skipped")
                continue
            seen_ids.add(record_id)

            # Normalize dates/timestamps
            if "timestamp" in row:
                row["timestamp"] = normalize_timestamp(row["timestamp"])
            if "date" in row:
                row["date"] = normalize_timestamp(row["date"])
            if "record_date" in row:
                row["record_date"] = normalize_timestamp(row["record_date"])

            # Numeric fields parsing
            if "duration_seconds" in row and row["duration_seconds"]:
                try:
                    row["duration_seconds"] = int(row["duration_seconds"])
                except ValueError:
                    pass
            if "amount_inr" in row and row["amount_inr"]:
                try:
                    row["amount_inr"] = float(row["amount_inr"])
                except ValueError:
                    pass
            if "confidence" in row and row["confidence"]:
                try:
                    conf_val = float(row["confidence"])
                    if conf_val <= 1.0:
                        row["confidence"] = int(round(conf_val * 100))
                    else:
                        row["confidence"] = int(round(conf_val))
                except ValueError:
                    pass

            # Populate compatibility aliases if present
            if "person_id" in row and "id" not in row:
                row["id"] = row["person_id"]
            if "relationship_id" in row:
                # Generate deterministic UUID so Postgres UUID type doesn't error
                row["id"] = str(uuid.uuid5(uuid.NAMESPACE_DNS, row["relationship_id"]))
            if "source_entity" in row and "source_id" not in row:
                row["source_id"] = row["source_entity"]
            if "target_entity" in row and "target_id" not in row:
                row["target_id"] = row["target_entity"]
            if "alert_id" in row:
                if "id" not in row:
                    row["id"] = row["alert_id"]
                if "type" not in row and "alert_type" in row:
                    row["type"] = row["alert_type"]
                if "entity" not in row and "entity_id" in row:
                    row["entity"] = row["entity_id"]
                if "reason" not in row and "explanation" in row:
                    row["reason"] = row["explanation"]
                if "severity" not in row:
                    conf = row.get("confidence", 75)
                    row["severity"] = "critical" if (isinstance(conf, (int, float)) and conf >= 85) else "high"

            valid_rows.append(row)

    return valid_rows, errors


def chunk_list(lst: List[Any], chunk_size: int = 500):
    """Yield successive chunks from lst."""
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]


def main():
    print("=" * 70)
    print(" CrimeGraph AI - Synthetic Dataset Importer for Supabase")
    print("=" * 70)

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[ERROR] Supabase credentials not found!")
        print("Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env")
        sys.exit(1)

    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"Connected to Supabase endpoint: {SUPABASE_URL}")
    except Exception as e:
        print(f"[ERROR] Failed to initialize Supabase client: {e}")
        sys.exit(1)

    # 1. Check whether required tables exist
    print("\n[STEP 1/4] Checking database table availability in Supabase...")
    existing_tables, missing_tables = check_tables_exist(supabase)

    print(f"Existing tables ({len(existing_tables)}): {', '.join(existing_tables)}")

    if missing_tables:
        print("\n" + "!" * 70)
        print(f"[IMPORT STOPPED] Missing {len(missing_tables)} required Supabase table(s):")
        for mt in missing_tables:
            print(f"  [X] {mt}")
        print("!" * 70)
        print("\nPlease execute the migration script in your Supabase SQL Editor:")
        print("File: supabase/migrations/20260907000001_synthetic_dataset_schema.sql")
        print("=" * 70)
        sys.exit(2)

    print("All required tables are present in Supabase. Proceeding to validation.")

    # 2. Read and validate CSV files
    print("\n[STEP 2/4] Reading and validating CSV datasets from data/...")
    dataset_records: Dict[str, List[Dict[str, Any]]] = {}
    all_import_errors: List[str] = []

    for table_name in REQUIRED_TABLES:
        spec = CSV_SPECS[table_name]
        csv_file = DATA_DIR / spec["filename"]
        records, errors = read_and_validate_csv(csv_file, spec)
        dataset_records[table_name] = records
        all_import_errors.extend(errors)
        print(f"  [+] {spec['filename']:<18} -> {len(records):>5} valid rows ({len(errors)} issues)")

    # 3. Import valid records into Supabase
    print("\n[STEP 3/4] Importing records into Supabase in relational dependency order...")
    imported_counts: Dict[str, int] = {t: 0 for t in REQUIRED_TABLES}

    for table_name in REQUIRED_TABLES:
        records = dataset_records[table_name]
        if not records:
            continue

        print(f"  Importing {len(records)} records into table '{table_name}'...")
        count = 0
        for chunk in chunk_list(records, chunk_size=500):
            try:
                res = supabase.table(table_name).upsert(chunk).execute()
                count += len(chunk)
            except Exception as e:
                err_msg = f"Failed inserting chunk into '{table_name}': {str(e)}"
                all_import_errors.append(err_msg)
                print(f"    [WARN] {err_msg}")
        imported_counts[table_name] = count
        print(f"    [+] {table_name}: {count} imported.")

    # 4. Final summary output
    print("\n" + "=" * 70)
    print(" IMPORT SUMMARY")
    print("=" * 70)
    print(f"Persons imported: {imported_counts['persons']}")
    print(f"Vehicles imported: {imported_counts['vehicles']}")
    print(f"Locations imported: {imported_counts['locations']}")
    print(f"CDR records imported: {imported_counts['cdr']}")
    print(f"FIRs imported: {imported_counts['firs']}")
    print(f"Movements imported: {imported_counts['movements']}")
    print(f"Relationships imported: {imported_counts['relationships']}")
    print(f"Transactions imported: {imported_counts['transactions']}")
    print(f"Alerts imported: {imported_counts['alerts']}")
    print("-" * 70)

    total_entities = imported_counts["persons"] + imported_counts["vehicles"] + imported_counts["locations"]
    total_relationships = imported_counts["relationships"]
    total_records = sum(imported_counts.values())

    print(f"Total entities: {total_entities}")
    print(f"Total relationships: {total_relationships}")
    print(f"Total records: {total_records}")
    print(f"Import errors: {len(all_import_errors)}")

    if all_import_errors:
        print("\nErrors detail (first 10):")
        for err in all_import_errors[:10]:
            print(f"  - {err}")
    print("=" * 70)


if __name__ == "__main__":
    main()
