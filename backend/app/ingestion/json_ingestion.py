"""JSON ingestion module for validating and reading structured datasets."""

import json
import io
from pathlib import Path
from typing import Any, Dict, List, Optional, Union


class JSONIngestionError(Exception):
    """Raised when JSON validation or reading fails."""
    pass


def read_and_validate_json(
    file_source: Union[str, Path, bytes, io.StringIO, io.BytesIO],
    expected_root_type: Optional[type] = None,
    required_keys: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Read and validate a JSON dataset.

    Args:
        file_source: Filepath, bytes, or file-like buffer.
        expected_root_type: Expected Python type for JSON root (e.g. list or dict).
        required_keys: If root is a dict or list of dicts, required top-level keys.

    Returns:
        Dict containing validation metadata and parsed data payload.

    Raises:
        JSONIngestionError: If the JSON is empty, malformed, or fails structure validation.
    """
    content_str: str

    if isinstance(file_source, (str, Path)):
        path = Path(file_source)
        if isinstance(file_source, Path) or (isinstance(file_source, str) and path.exists() and not file_source.strip().startswith(("{", "["))):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content_str = f.read()
            except Exception as e:
                raise JSONIngestionError(f"Failed to read JSON file: {str(e)}")
        else:
            content_str = str(file_source)
    elif isinstance(file_source, bytes):
        try:
            content_str = file_source.decode("utf-8")
        except UnicodeDecodeError:
            content_str = file_source.decode("latin-1")
    elif hasattr(file_source, "read"):
        raw = file_source.read()
        content_str = raw.decode("utf-8") if isinstance(raw, bytes) else raw
    else:
        raise JSONIngestionError(f"Unsupported file source type: {type(file_source)}")

    if not content_str.strip():
        raise JSONIngestionError("JSON content is empty.")

    try:
        data = json.loads(content_str)
    except json.JSONDecodeError as err:
        raise JSONIngestionError(f"Invalid JSON syntax: {str(err)}")

    if expected_root_type is not None and not isinstance(data, expected_root_type):
        raise JSONIngestionError(
            f"Expected root structure of type {expected_root_type.__name__}, got {type(data).__name__}"
        )

    if required_keys:
        if isinstance(data, dict):
            missing = [k for k in required_keys if k not in data]
            if missing:
                raise JSONIngestionError(f"Missing required JSON keys: {', '.join(missing)}")
        elif isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
            first_item = data[0]
            missing = [k for k in required_keys if k not in first_item]
            if missing:
                raise JSONIngestionError(
                    f"Array item missing required keys: {', '.join(missing)}"
                )

    item_count = len(data) if isinstance(data, list) else 1
    return {
        "status": "valid",
        "root_type": type(data).__name__,
        "item_count": item_count,
        "data": data,
    }
