import React, { useState, useCallback } from 'react';
import BookForm from './components/BookForm';
import BookList from './components/BookList';
import MemberForm from './components/MemberForm';
import MemberList from './components/MemberList';
import LoanAndReservationForm from './components/LoanAndReservationForm';
import ReportViewer from './components/ReportViewer';
import Login from './components/Login';
import LogoutButton from './components/LogoutButton';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import { useAuth } from './context/AuthContext';
import { Book, Member } from './interfaces';
import './App.css'; // Ensure App.css is imported for styling

function App() {
  const { isAuthenticated, user, loadingAuth } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home'); // State to control which page is shown

  // State for Books
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [refreshBookListKey, setRefreshBookListKey] = useState(0);

  // State for Members
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [refreshMemberListKey, setRefreshMemberListKey] = useState(0);

  // State for Loans/Reservations (to trigger refresh of Book/Member lists if status changes)
  const [refreshLoanOrReservationListKey, setRefreshLoanOrReservationListKey] = useState(0);

  // Callbacks for Books
  const handleEditBook = (book: Book) => {
    setCurrentBook(book);
    setCurrentPage('books'); // Navigate to books page on edit
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleBookAddedOrUpdated = useCallback(() => {
    setRefreshBookListKey(prevKey => prevKey + 1); // Increment key to force BookList refresh
  }, []);
  const handleCancelBookEdit = useCallback(() => {
    setCurrentBook(null); // Clear current book to switch back to add mode
  }, []);

  // Callbacks for Members
  const handleEditMember = (member: Member) => {
    setCurrentMember(member);
    setCurrentPage('members'); // Navigate to members page on edit
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleMemberAddedOrUpdated = useCallback(() => {
    setRefreshMemberListKey(prevKey => prevKey + 1); // Increment key to force MemberList refresh
  }, []);
  const handleCancelMemberEdit = useCallback(() => {
    setCurrentMember(null); // Clear current member to switch back to add mode
  }, []);

  // Callback for Loans/Reservations (triggers refresh of BookList and MemberList to update statuses)
  const handleLoanOrReservationAdded = useCallback(() => {
    setRefreshLoanOrReservationListKey(prevKey => prevKey + 1); // Not directly used by App for rendering, but tracks changes
    setRefreshBookListKey(prevKey => prevKey + 1); // Refresh books to reflect status changes (On Loan/Reserved)
    setRefreshMemberListKey(prevKey => prevKey + 1); // Refresh members if needed (e.g., if a member's loan count was displayed)
  }, []);

  // Function to render content based on currentPage state
  const renderContent = () => {
    if (loadingAuth) {
      return <div className="auth-container">Loading authentication...</div>;
    }
    if (!isAuthenticated) {
      return <Login />;
    }

    // Authenticated User Content based on currentPage
    switch (currentPage) {
      case 'home':
        return <DashboardHome />;
      case 'loans_reservations':
        // FIX: LoanAndReservationForm is now visible to ALL authenticated users
        return <LoanAndReservationForm onLoanOrReservationAdded={handleLoanOrReservationAdded} />;
      case 'books':
        return (
          <>
            {(user?.roles.includes('Administrator') || user?.roles.includes('Librarian')) && ( // BookForm is for Admin/Librarian
                <>
                    <BookForm
                        currentBook={currentBook}
                        onBookAddedOrUpdated={handleBookAddedOrUpdated}
                        onCancelEdit={handleCancelBookEdit}
                    />
                    <hr style={{ margin: '20px 0', borderColor: '#ccc' }} />
                </>
            )}
            {/* BookList is visible to ALL authenticated users for Read access */}
            <BookList
              key={refreshBookListKey}
              onEdit={handleEditBook}
              onBookAddedOrUpdated={handleBookAddedOrUpdated}
            />
          </>
        );
      case 'members':
        return (
            <>
                {(user?.roles.includes('Administrator') || user?.roles.includes('Librarian')) && ( // MemberForm is for Admin/Librarian
                    <>
                        <MemberForm
                            currentMember={currentMember}
                            onMemberAddedOrUpdated={handleMemberAddedOrUpdated}
                            onCancelEdit={handleCancelMemberEdit}
                        />
                        <hr style={{ margin: '20px 0', borderColor: '#ccc' }} />
                    </>
                )}
                {/* MemberList is visible to ALL authenticated users for Read access */}
                <MemberList
                  key={refreshMemberListKey}
                  onEdit={handleEditMember}
                  onMemberAddedOrUpdated={handleMemberAddedOrUpdated}
                />
            </>
        );
      case 'reports':
        return <ReportViewer />;
      case 'settings':
        return <div className="auth-container"><h2>Settings Page</h2><p>Content coming soon...</p></div>;
      default:
        return <DashboardHome />;
    }
  };


  return (
    <div className="App">
      {/* Sidebar - Only visible if authenticated */}
      {isAuthenticated && (
        <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      )}

      {/* Main Content Area */}
      <section className="main-content">
        <header className="main-header"> {/* Header content here */}
          <h1>Library Management Dashboard</h1>
          {/* Removed LogoutButton from here, it's now in SidebarFooter */}
          {isAuthenticated && user && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p style={{ margin: '0 10px', fontWeight: 'normal', fontSize: '0.9rem' }}>
                Logged in as: <strong>{user.full_name || user.username}</strong> ({user.roles.join(', ')})
              </p>
            </div>
          )}
        </header>

        {renderContent()} {/* Render current page content */}
      </section>

      {/* Optional Footer (uncomment if desired) */}
      {/* <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Library Management System. All rights reserved.</p>
      </footer> */}
    </div>
  );
}

export default App;