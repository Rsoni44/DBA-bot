"""PDF processing utilities."""

import os
from typing import List, Dict
import pdfplumber
from PyPDF2 import PdfReader


class PDFProcessor:
    """Process PDF files and extract text."""

    @staticmethod
    def extract_text_pypdf(file_path: str) -> str:
        """
        Extract text from PDF using PyPDF2.

        Args:
            file_path: Path to PDF file

        Returns:
            Extracted text
        """
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise Exception(f"Error extracting text with PyPDF2: {str(e)}")

    @staticmethod
    def extract_text_pdfplumber(file_path: str) -> str:
        """
        Extract text from PDF using pdfplumber (better for tables and complex layouts).

        Args:
            file_path: Path to PDF file

        Returns:
            Extracted text
        """
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text
        except Exception as e:
            raise Exception(f"Error extracting text with pdfplumber: {str(e)}")

    @staticmethod
    def extract_text_with_pages(file_path: str) -> List[Dict[str, any]]:
        """
        Extract text from PDF with page numbers.

        Args:
            file_path: Path to PDF file

        Returns:
            List of dictionaries with page_number and text
        """
        try:
            pages = []
            with pdfplumber.open(file_path) as pdf:
                for i, page in enumerate(pdf.pages, start=1):
                    page_text = page.extract_text()
                    if page_text:
                        pages.append({
                            "page_number": i,
                            "text": page_text
                        })
            return pages
        except Exception as e:
            raise Exception(f"Error extracting text with pages: {str(e)}")

    @staticmethod
    def get_page_count(file_path: str) -> int:
        """
        Get the number of pages in a PDF.

        Args:
            file_path: Path to PDF file

        Returns:
            Number of pages
        """
        try:
            reader = PdfReader(file_path)
            return len(reader.pages)
        except Exception as e:
            raise Exception(f"Error getting page count: {str(e)}")

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """
        Split text into chunks for embedding.

        Args:
            text: Text to chunk
            chunk_size: Size of each chunk in characters
            overlap: Overlap between chunks in characters

        Returns:
            List of text chunks
        """
        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap

        return chunks

    @staticmethod
    def extract_and_chunk(file_path: str, chunk_size: int = 1000, overlap: int = 200) -> List[Dict[str, any]]:
        """
        Extract text from PDF and split into chunks with metadata.

        Args:
            file_path: Path to PDF file
            chunk_size: Size of each chunk in characters
            overlap: Overlap between chunks in characters

        Returns:
            List of dictionaries with chunk text and metadata
        """
        pages = PDFProcessor.extract_text_with_pages(file_path)
        filename = os.path.basename(file_path)

        chunked_data = []
        for page_data in pages:
            page_number = page_data["page_number"]
            page_text = page_data["text"]

            # Chunk the page text
            chunks = PDFProcessor.chunk_text(page_text, chunk_size, overlap)

            for chunk_index, chunk in enumerate(chunks):
                chunked_data.append({
                    "text": chunk,
                    "metadata": {
                        "filename": filename,
                        "page_number": page_number,
                        "chunk_index": chunk_index
                    }
                })

        return chunked_data
