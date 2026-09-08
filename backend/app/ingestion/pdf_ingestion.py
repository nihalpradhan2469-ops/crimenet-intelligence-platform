"""PDF ingestion foundation module.

Provides standard interfaces and base classes for future PDF text extraction
(e.g., FIR reports, intelligence summaries).
NOTE: No NLP/NER or external AI models (e.g. Hugging Face) are implemented in this phase.
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, List, Optional, Union


class PDFIngestionError(Exception):
    """Raised when PDF reading or parsing validation fails."""
    pass


class PDFIngestionBase(ABC):
    """Abstract interface defining future PDF document ingestion contracts."""

    @abstractmethod
    def validate(self, file_source: Union[str, Path, bytes]) -> bool:
        """Validate whether the file is an accessible and valid PDF binary."""
        pass

    @abstractmethod
    def extract_metadata(self, file_source: Union[str, Path, bytes]) -> Dict[str, Any]:
        """Extract basic PDF container metadata (page count, title, author)."""
        pass

    @abstractmethod
    def extract_raw_text(self, file_source: Union[str, Path, bytes]) -> Dict[str, Any]:
        """Extract unparsed, raw text content per page.
        
        Future pipeline stages will feed this raw text into normalization
        and entity extraction pipelines.
        """
        pass


class PDFDocumentPlaceholder(PDFIngestionBase):
    """Initial placeholder implementation providing contract verification before full extractor is wired."""

    def validate(self, file_source: Union[str, Path, bytes]) -> bool:
        if isinstance(file_source, (str, Path)):
            path = Path(file_source)
            if not path.exists():
                raise PDFIngestionError(f"PDF file does not exist: {path}")
            if not path.name.lower().endswith(".pdf"):
                raise PDFIngestionError(f"File does not have a .pdf extension: {path.name}")
            return True
        elif isinstance(file_source, bytes):
            # Check PDF file magic header (%PDF-)
            if not file_source.startswith(b"%PDF-"):
                raise PDFIngestionError("Data does not begin with standard PDF signature (%PDF-).")
            return True
        return False

    def extract_metadata(self, file_source: Union[str, Path, bytes]) -> Dict[str, Any]:
        self.validate(file_source)
        return {
            "status": "ready",
            "extractor": "placeholder",
            "message": "PDF extractor interface ready. PDF extraction libraries will be connected in future phase.",
        }

    def extract_raw_text(self, file_source: Union[str, Path, bytes]) -> Dict[str, Any]:
        self.validate(file_source)
        return {
            "status": "interface_ready",
            "pages": [],
            "raw_text": "",
            "message": "Future extraction pipeline will populate raw text.",
        }
