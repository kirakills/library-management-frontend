import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Book } from '../interfaces'; // IMPORT INTERFACE HERE

// Reuse constants (still define them here, or move to a separate config file if preferred)
const FRAPPE_API_KEY = '6eab1607a5fe04b'; // Use your generated API Key
const FRAPPE_API_SECRET = '5250726de623280'; // PASTE your NEW API Secret
const FRAPPE_BASE_URL = 'http://localhost:8000';

interface BookListProps {
  onEdit: (book: Book) => void;
  onBookAddedOrUpdated: () => void;
}

const BookList: React.FC<BookListProps> = ({ onEdit, onBookAddedOrUpdated }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${FRAPPE_BASE_URL}/api/resource/Book?fields=["name", "title", "author", "published_date", "isbn", "status", "current_borrower", "current_reservation"]`, {
        headers: {
          'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
        }
      });
      setBooks(response.data.data);
    } catch (err: any) {
      console.error("Error fetching books:", err);
      setError(err.message || "Failed to fetch books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [onBookAddedOrUpdated]);

  const handleDelete = async (bookName: string) => {
    if (!window.confirm(`Are you sure you want to delete book with ISBN: ${bookName}?`)) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`${FRAPPE_BASE_URL}/api/resource/Book/${bookName}`, {
        headers: {
          'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
        }
      });
      alert('Book deleted successfully!');
      onBookAddedOrUpdated();
    } catch (err: any) {
      console.error("Error deleting book:", err);
      setError(err.message || "Failed to delete book.");
      alert(`Error deleting book: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading books...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="book-list-container">
      <h2>Available Books</h2>
      {books.length === 0 ? (
        <p>No books found. Add some using the form above!</p>
      ) : (
        <table className="books-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.name}> {/* Use book.name (which is ISBN) as key */}
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.isbn}</td>
                <td>{book.status}</td>
                <td>
                  <button onClick={() => onEdit(book)}>Edit</button>
                  <button onClick={() => handleDelete(book.name)} style={{ marginLeft: '5px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookList;