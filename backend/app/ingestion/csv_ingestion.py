"""CSV ingestion module for validating and reading CSV datasets (e.g., CDR, transactions)."""

import csv
import io
from pathlib import Path
from typing import Any, Dict, List, Optional, Union


class CSVIngestionError(Exception):
    """Raised when CSV validation or reading fails."""
    pass


def read_and_validate_csv(
    file_source: Union[str, Path, bytes, io.StringIO, io.BytesIO],
    expected_headers: Optional[List[str]] = None,
    delimiter: str = ",",
    max_rows: Optional[int] = None,
) -> Dict[str, Any]:
    """Read and validate a CSV dataset.

    Args:
        file_source: Filepath, bytes, or file-like buffer.
        expected_headers: Optional list of required column header names.
        delimiter: CSV delimiter character (default: ',').
        max_rows: Optional limit on the number of data rows to parse.

    Returns:
        Dict containing metadata (row_count, headers) and data rows.

    Raises:
        CSVIngestionError: If the CSV is empty, malformed, or missing required headers.
    """
    content_str: str

    if isinstance(file_source, (str, Path)):
        path = Path(file_source)
        if isinstance(file_source, Path) or (isinstance(file_source, str) and path.exists() and "\n" not in file_source):
            try:
                with open(path, "r", encoding="utf-8-sig") as f:
                    content_str = f.read()
            except Exception as e:
                raise CSVIngestionError(f"Failed to read CSV file: {str(e)}")
        else:
            content_str = str(file_source)
    elif isinstance(file_source, bytes):
        try:
            content_str = file_source.decode("utf-8-sig")
        except UnicodeDecodeError:
            content_str = file_source.decode("latin-1")
    elif hasattr(file_source, "read"):
        raw = file_source.read()
        content_str = raw.decode("utf-8-sig") if isinstance(raw, bytes) else raw
    else:
        raise CSVIngestionError(f"Unsupported file source type: {type(file_source)}")

    if not content_str.strip():
        raise CSVIngestionError("CSV content is empty.")

    buffer = io.StringIO(content_str)
    reader = csv.DictReader(buffer, delimiter=delimiter)

    if not reader.fieldnames:
        raise CSVIngestionError("CSV contains no valid headers.")

    headers = [h.strip() for h in reader.fieldnames if h]

    if expected_headers:
        missing_headers = [req for req in expected_headers if req not in headers]
        if missing_headers:
            raise CSVIngestionError(
                f"CSV validation failed. Missing required columns: {', '.join(missing_headers)}"
            )

    rows: List[Dict[str, str]] = []
    for idx, row in enumerate(reader, start=1):
        if max_rows and idx > max_rows:
            break
        # Strip string values
        cleaned_row = {k: (v.strip() if isinstance(v, str) else v) for k, v in row.items() if k}
        rows.append(cleaned_row)

    return {
        "status": "valid",
        "row_count": len(rows),
        "headers": headers,
        "rows": rows,
    }
