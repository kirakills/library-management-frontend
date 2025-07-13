import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MemberFormData, Member } from '../interfaces'; // IMPORT INTERFACES HERE

// Reuse constants
const FRAPPE_API_KEY = '6eab1607a5fe04b'; // Your API Key
const FRAPPE_API_SECRET = '5250726de623280'; // Your API Secret
const FRAPPE_BASE_URL = 'http://localhost:8000';


interface MemberFormProps {
  currentMember: Member | null; // Changed to use Member interface
  onMemberAddedOrUpdated: () => void;
  onCancelEdit: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ currentMember, onMemberAddedOrUpdated, onCancelEdit }) => {
  const [formData, setFormData] = useState<MemberFormData>({
    title: '', // Initialize with title
    membership_id: '',
    email: '',
    phone: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (currentMember) {
      // Map Member to MemberFormData for the form
      setFormData({
        title: currentMember.title,
        membership_id: currentMember.membership_id,
        email: currentMember.email,
        phone: currentMember.phone || '', // Ensure phone is string for input
      });
      setIsEditMode(true);
    } else {
      setFormData({
        title: '',
        membership_id: '',
        email: '',
        phone: '',
      });
      setIsEditMode(false);
    }
  }, [currentMember]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // When updating, use the original 'name' (which is membership_id) as the ID for the URL
        await axios.put(`${FRAPPE_BASE_URL}/api/resource/Member/${formData.membership_id}`, formData, {
          headers: {
            'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
          }
        });
        alert('Member updated successfully!');
      } else {
        await axios.post(`${FRAPPE_BASE_URL}/api/resource/Member`, formData, {
          headers: {
            'Authorization': `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`
          }
        });
        alert('Member added successfully!');
      }
      setFormData({
        title: '',
        membership_id: '',
        email: '',
        phone: '',
      }); // Clear form
      onMemberAddedOrUpdated(); // Refresh list
      onCancelEdit(); // Exit edit mode
    } catch (err: any) {
      console.error("Error saving member:", err);
      alert(`Error saving member: ${err.message || 'Unknown error'}\n${err.response?.data?.message || ''}`);
    }
  };

  return (
    <div className="member-form-container">
      <h2>{isEditMode ? 'Edit Member' : 'Add New Member'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Membership ID:</label>
          <input type="text" name="membership_id" value={formData.membership_id} onChange={handleChange} required disabled={isEditMode} />
          {isEditMode && <small> (Membership ID cannot be changed in edit mode)</small>}
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Phone:</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </div>
        <button type="submit">{isEditMode ? 'Update Member' : 'Add Member'}</button>
        {isEditMode && <button type="button" onClick={onCancelEdit} style={{ marginLeft: '10px' }}>Cancel Edit</button>}
      </form>
    </div>
  );
};

export default MemberForm;