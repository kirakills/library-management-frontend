import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookFormData, Book } from '../interfaces'; // IMPORT INTERFACES HERE

// Reuse constants
const FRAPPE_API_KEY = '6eab1607a5fe04b'; // Use your generated API Key
const FRAPPE_API_SECRET = '5250726de623280'; // PASTE your NEW API Secret
const FRAPPE_BASE_URL = 'http://localhost:8000';


interface BookFormProps {
  currentBook: Book | null; // Changed to use Book interface
  onBookAddedOrUpdated: () => void;
  onCancelEdit: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ currentBook, onBookAddedOrUpdated, onCancelEdit }) => {
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    published_date: '',
    isbn: '',
    status: 'Available',
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (currentBook) {
      // Map Book to BookFormData for the form
      setFormData({
        title: currentBook.title,
        author: currentBook.author,
        published_date: currentBook.published_date,
        isbn: currentBook.isbn,
        status: currentBook.status,
      });
      setIsEditMode(true);
    } else {
      setFormData({
        title: '',
        author: '',
        published_date: '',
        isbn: '',
        status: 'Available',
      });
      setIsEditMode(false);
    }
  }, [currentBook]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`${FRAPPE_BASE_URL}/api/resource/Book/${formData.isbn}`, formData, {
          headers: {
            'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
          }
        });
        alert('Book updated successfully!');
      } else {
        await axios.post(`${FRAPPE_BASE_URL}/api/resource/Book`, formData, {
          headers: {
            'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
          }
        });
        alert('Book added successfully!');
      }
      setFormData({
        title: '',
        author: '',
        published_date: '',
        isbn: '',
        status: 'Available',
      }); // Clear form
      onBookAddedOrUpdated(); // Refresh list
      onCancelEdit(); // Exit edit mode
    } catch (err: any) {
      console.error("Error saving book:", err);
      alert(`Error saving book: ${err.message || 'Unknown error'}\n${err.response?.data?.message || ''}`);
    }
  };

  return (
    <div className="book-form-container">
      <h2>{isEditMode ? 'Edit Book' : 'Add New Book'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Author:</label>
          <input type="text" name="author" value={formData.author} onChange={handleChange} required />
        </div>
        <div>
          <label>Published Date:</label>
          <input type="date" name="published_date" value={formData.published_date} onChange={handleChange} required />
        </div>
        <div>
          <label>ISBN:</label>
          <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} required disabled={isEditMode} />
          {isEditMode && <small> (ISBN cannot be changed in edit mode)</small>}
        </div>
        <div>
          <label>Status:</label>
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="Available">Available</option>
            <option value="On Loan">On Loan</option>
            <option value="Reserved">Reserved</option>
          </select>
        </div>
        <button type="submit">{isEditMode ? 'Update Book' : 'Add Book'}</button>
        {isEditMode && <button type="button" onClick={onCancelEdit} style={{ marginLeft: '10px' }}>Cancel Edit</button>}
      </form>
    </div>
  );
};

export default BookForm;
