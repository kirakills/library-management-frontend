// Book Interfaces
export interface Book {
  name: string; // Frappe's internal ID (ISBN for Book)
  title: string;
  author: string;
  published_date: string;
  isbn: string;
  status: string;
  current_borrower?: string;
  current_reservation?: string;
}

export interface BookFormData {
  title: string;
  author: string;
  published_date: string;
  isbn: string;
  status: string;
}

// Member Interfaces
export interface Member {
  name: string; // Frappe's internal ID (Membership ID for Member)
  title: string; // The display name field you added/changed
  membership_id: string;
  email: string;
  phone?: string; // Optional field
}

export interface MemberFormData {
  title: string; // Matches the display name
  membership_id: string;
  email: string;
  phone?: string; // Optional
}

// NavItem Interface for Sidebar (Explicitly defined for TypeScript)
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  roles?: string[]; // Make roles optional for items accessible to all
}

// Add other interfaces here as you create them (e.g., Loan, Reservation)