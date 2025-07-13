import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, Member } from '../interfaces'; // Import Book and Member interfaces
import { useAuth } from '../context/AuthContext'; // IMPORT useAuth to get user roles

const FRAPPE_API_KEY = '6eab1607a5fe04b'; // Your API Key
const FRAPPE_API_SECRET = '5250726de623280'; // Your API Secret
const FRAPPE_BASE_URL = 'http://localhost:8000';

interface LoanFormData {
  book: string; // Frappe's 'name' (ISBN) of the book
  member: string; // Frappe's 'name' (Membership ID) of the member
  loan_date: string;
  return_date: string;
}

interface ReservationFormData {
  book: string; // Frappe's 'name' (ISBN) of the book
  member: string; // Frappe's 'name' (Membership ID) of the member
  reservation_date: string;
}

interface LoanAndReservationFormProps {
  onLoanOrReservationAdded: () => void; // Callback to refresh lists later
}

const LoanAndReservationForm: React.FC<LoanAndReservationFormProps> = ({ onLoanOrReservationAdded }) => {
  const { user } = useAuth(); // Get user from auth context for conditional button rendering

  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>(''); // Stores book.name (ISBN)
  const [selectedMember, setSelectedMember] = useState<string>(''); // Stores member.name (Membership ID)
  const [returnDate, setReturnDate] = useState<string>('');
  const [loanDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today

  const fetchDependencies = async () => {
    try {
      const [booksResponse, membersResponse] = await Promise.all([
        axios.get(`${FRAPPE_BASE_URL}/api/resource/Book?fields=["name", "title", "isbn", "status"]`, {
          headers: { 'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}` }
        }),
        axios.get(`${FRAPPE_BASE_URL}/api/resource/Member?fields=["name", "title", "membership_id"]`, {
          headers: { 'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}` }
        })
      ]);
      setBooks(booksResponse.data.data);
      setMembers(membersResponse.data.data);
    } catch (err) {
      console.error("Error fetching books/members for form:", err);
      alert("Failed to load necessary data for form.");
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBook || !selectedMember || !returnDate) {
      alert('Please select a book, a member, and a return date.');
      return;
    }

    try {
      // Call the new single whitelisted transaction method for Loan from api.py
      const response = await axios.post(`${FRAPPE_BASE_URL}/api/method/library_management.api.create_loan_transaction`, {
        book_name: selectedBook,
        member_name: selectedMember,
        loan_date: loanDate,
        return_date: returnDate,
      }, {
        headers: {
          'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
        }
      });
      alert(`Loan created successfully! Loan ID: ${response.data.loan_name}`);

      // Clear form
      setSelectedBook('');
      setSelectedMember('');
      setReturnDate('');
      onLoanOrReservationAdded(); // Trigger refresh for any related lists
      fetchDependencies(); // Re-fetch books to update status in dropdown
    } catch (err: any) {
      console.error("Error creating loan transaction:", err);
      alert(`Error creating loan: ${err.response?.data?.exception || err.message || 'Unknown error'}`);
    }
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBook || !selectedMember) {
      alert('Please select a book and a member for reservation.');
      return;
    }

    try {
      // Call the new single whitelisted transaction method for Reservation from api.py
      const response = await axios.post(`${FRAPPE_BASE_URL}/api/method/library_management.api.create_reservation_transaction`, {
        book_name: selectedBook,
        member_name: selectedMember,
        reservation_date: loanDate,
      }, {
        headers: {
          'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
        }
      });
      alert(`Reservation created successfully! Reservation ID: ${response.data.reservation_name}`);

      // Clear form
      setSelectedBook('');
      setSelectedMember('');
      setReturnDate(''); // Clear return date as it's not relevant for reservation
      onLoanOrReservationAdded();
      fetchDependencies(); // Re-fetch books to update status in dropdown
    } catch (err: any) {
      console.error("Error creating reservation transaction:", err);
      alert(`Error creating reservation: ${err.response?.data?.exception || err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="loan-reservation-form-container">
      <h2>Create Loan or Reservation</h2>
      <form>
        <div>
          <label>Book:</label>
          <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} required>
            <option value="">Select a Book</option>
            {books.map((book) => (
              <option key={book.name} value={book.name}>
                {book.title} (ISBN: {book.isbn}) - Status: {book.status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Member:</label>
          <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} required>
            <option value="">Select a Member</option>
            {members.map((member) => (
              <option key={member.name} value={member.name}>
                {member.title} (ID: {member.membership_id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Loan Date (Today):</label>
          <input type="date" value={loanDate} readOnly /> {/* Read-only, automatically today */}
        </div>
        <div>
          <label>Expected Return Date:</label>
          <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required />
        </div>
        {/* FIX: Conditionally render Create Loan button based on roles */}
        { (user?.roles.includes('Administrator') || user?.roles.includes('Librarian')) && (
            <button type="button" onClick={handleLoanSubmit} style={{ marginRight: '10px' }}>Create Loan</button>
        )}
        <button type="button" onClick={handleReservationSubmit} style={{ backgroundColor: '#28a745' }}>Create Reservation</button>
      </form>
    </div>
  );
};

export default LoanAndReservationForm;