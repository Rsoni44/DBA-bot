"""Vector store service using ChromaDB."""

import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
import os


class VectorStore:
    """Manage document embeddings and semantic search using ChromaDB."""

    def __init__(self, persist_directory: str = "./chroma_db"):
        """
        Initialize ChromaDB client.

        Args:
            persist_directory: Directory to persist the vector database
        """
        self.persist_directory = persist_directory
        os.makedirs(persist_directory, exist_ok=True)

        # Initialize ChromaDB client with persistence
        self.client = chromadb.PersistentClient(path=persist_directory)

        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="dba_documents",
            metadata={"description": "DBA course documents and materials"}
        )

    def add_document(
        self,
        document_id: str,
        chunks: List[Dict[str, any]],
        course_id: Optional[int] = None
    ) -> int:
        """
        Add document chunks to the vector store.

        Args:
            document_id: Unique identifier for the document
            chunks: List of dictionaries with 'text' and 'metadata'
            course_id: Optional course ID to associate with document

        Returns:
            Number of chunks added
        """
        ids = []
        documents = []
        metadatas = []

        for i, chunk_data in enumerate(chunks):
            chunk_id = f"{document_id}_chunk_{i}"
            ids.append(chunk_id)
            documents.append(chunk_data["text"])

            # Merge metadata
            metadata = chunk_data.get("metadata", {})
            metadata["document_id"] = document_id
            if course_id is not None:
                metadata["course_id"] = str(course_id)
            metadatas.append(metadata)

        # Add to collection
        self.collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )

        return len(ids)

    def search(
        self,
        query: str,
        n_results: int = 5,
        course_id: Optional[int] = None,
        document_id: Optional[str] = None
    ) -> List[Dict[str, any]]:
        """
        Search for relevant document chunks.

        Args:
            query: Search query
            n_results: Number of results to return
            course_id: Optional filter by course ID
            document_id: Optional filter by document ID

        Returns:
            List of search results with text and metadata
        """
        # Build where filter
        where = {}
        if course_id is not None:
            where["course_id"] = str(course_id)
        if document_id is not None:
            where["document_id"] = document_id

        # Query the collection
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where if where else None
        )

        # Format results
        formatted_results = []
        if results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                formatted_results.append({
                    "text": doc,
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": results["distances"][0][i] if results["distances"] else None
                })

        return formatted_results

    def delete_document(self, document_id: str) -> bool:
        """
        Delete all chunks of a document from the vector store.

        Args:
            document_id: Document identifier

        Returns:
            True if successful
        """
        try:
            # Get all chunk IDs for this document
            results = self.collection.get(
                where={"document_id": document_id}
            )

            if results["ids"]:
                self.collection.delete(ids=results["ids"])

            return True
        except Exception as e:
            print(f"Error deleting document: {str(e)}")
            return False

    def get_document_count(self) -> int:
        """
        Get total number of chunks in the vector store.

        Returns:
            Number of chunks
        """
        return self.collection.count()

    def clear_all(self) -> bool:
        """
        Clear all documents from the vector store.

        Returns:
            True if successful
        """
        try:
            # Delete the collection and recreate it
            self.client.delete_collection(name="dba_documents")
            self.collection = self.client.get_or_create_collection(
                name="dba_documents",
                metadata={"description": "DBA course documents and materials"}
            )
            return True
        except Exception as e:
            print(f"Error clearing vector store: {str(e)}")
            return False
