import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Member } from '../interfaces'; // Import Member interface
import { useAuth } from '../context/AuthContext'; // IMPORT useAuth to get user roles

// Reuse constants
const FRAPPE_API_KEY = '6eab1607a5fe04b'; // Your API Key
const FRAPPE_API_SECRET = '5250726de623280'; // Your API Secret
const FRAPPE_BASE_URL = 'http://localhost:8000';

interface MemberListProps {
  onEdit: (member: Member) => void;
  onMemberAddedOrUpdated: () => void; // Callback to refresh list after add/update
}

const MemberList: React.FC<MemberListProps> = ({ onEdit, onMemberAddedOrUpdated }) => {
  const { user } = useAuth(); // Get user from auth context for conditional rendering

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      // IMPORTANT: Request all fields you need for display!
      const response = await axios.get(`${FRAPPE_BASE_URL}/api/resource/Member?fields=["name", "title", "membership_id", "email", "phone"]`, {
        headers: {
          'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
        }
      });
      setMembers(response.data.data);
    } catch (err: any) {
      console.error("Error fetching members:", err);
      setError(err.message || "Failed to fetch members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [onMemberAddedOrUpdated]);

  const handleDelete = async (memberName: string) => {
    if (!window.confirm(`Are you sure you want to delete member with ID: ${memberName}?`)) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`${FRAPPE_BASE_URL}/api/resource/Member/${memberName}`, {
        headers: {
          'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
        }
      });
      alert('Member deleted successfully!');
      onMemberAddedOrUpdated(); // Trigger refresh
    } catch (err: any) {
      console.error("Error deleting member:", err);
      setError(err.message || "Failed to delete member.");
      alert(`Error deleting member: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async (memberName: string) => {
    try {
        // Call the new whitelisted API method for CSV export
        const response = await axios.post(`${FRAPPE_BASE_URL}/api/method/library_management.api.get_member_loan_history_csv`, {
            member_name: memberName
        }, {
            headers: {
                'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
            },
            responseType: 'blob' // Important: Expect binary data (blob) for file download
        });

        // Create a blob from the CSV string and trigger download
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `loan_history_${memberName}.csv`);
        document.body.appendChild(link);
        link.click(); // Programmatically click the link to trigger download
        document.body.removeChild(link); // Clean up the link
        URL.revokeObjectURL(url); // Release the object URL

        alert(`Loan history exported for ${memberName}!`);

    } catch (err: any) {
        console.error(`Error exporting CSV for member ${memberName}:`, err);
        alert(`Error exporting CSV: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  // Determine if user has permission to see/use management actions (Edit/Delete/Export)
  const canManageMembers = user?.roles.includes('Administrator') || user?.roles.includes('Librarian');

  if (loading) return <div>Loading members...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="member-list-container">
      <h2>Registered Members</h2>
      {members.length === 0 ? (
        <p>No members found. Add some using the form below!</p>
      ) : (
        <table className="members-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Membership ID</th>
              <th>Email</th>
              <th>Phone</th>
              {canManageMembers && <th>Actions</th>} {/* Conditionally render Actions header */}
              {canManageMembers && <th>Export</th>} {/* Conditionally render Export header */}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.name}>
                <td>{member.title}</td>
                <td>{member.membership_id}</td>
                <td>{member.email}</td>
                <td>{member.phone || 'N/A'}</td>
                {canManageMembers && ( /* Conditionally render Actions cell */
                  <td>
                    <button onClick={() => onEdit(member)}>Edit</button>
                    <button onClick={() => handleDelete(member.name)} style={{ marginLeft: '5px' }}>Delete</button>
                  </td>
                )}
                {canManageMembers && ( /* Conditionally render Export cell */
                  <td>
                    <button onClick={() => handleExportCsv(member.name)}>Export CSV</button>
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

export default MemberList;
