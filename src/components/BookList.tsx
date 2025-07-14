import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Book } from '../interfaces'; // Import Book interface
import { useAuth } from '../context/AuthContext'; // IMPORT useAuth to get user roles

// Reuse constants
const FRAPPE_API_KEY = '6eab1607a5fe04b'; // Your API Key
const FRAPPE_API_SECRET = '5250726de623280'; // Your API Secret
const FRAPPE_BASE_URL = 'http://localhost:8000';

interface BookListProps {
  onEdit: (book: Book) => void;
  onBookAddedOrUpdated: () => void; // Callback to refresh list after add/update
}

const BookList: React.FC<BookListProps> = ({ onEdit, onBookAddedOrUpdated }) => {
  const { user } = useAuth(); // Get user from auth context for conditional rendering

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      // IMPORTANT: Request all fields you need for display!
      const response = await axios.get(`${FRAPPE_BASE_URL}/api/resource/Book?fields=["name", "title", "author", "published_date", "isbn", "status", "current_borrower", "current_reservation"]`, {
        headers: { 'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}` }
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
      onBookAddedOrUpdated(); // Trigger refresh
    } catch (err: any) {
      console.error("Error deleting book:", err);
      setError(err.message || "Failed to delete book.");
      alert(`Error deleting book: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Determine if user has permission to see/use management actions (Edit/Delete)
  const canManageBooks = user?.roles.includes('Administrator') || user?.roles.includes('Librarian');

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
              {canManageBooks && <th>Actions</th>} {/* FIX: Conditionally render Actions header */}
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.name}> {/* Use book.name (which is ISBN) as key */}
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.isbn}</td>
                <td>{book.status}</td>
                {canManageBooks && ( /* FIX: Conditionally render Actions cell */
                  <td>
                    <button onClick={() => onEdit(book)}>Edit</button>
                    <button onClick={() => handleDelete(book.name)} style={{ marginLeft: '5px' }}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookList;
