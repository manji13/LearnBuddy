import React, { useState, useEffect } from 'react';

const User = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/users');
      const data = await response.json();
      setUsers(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/users/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setUsers(users.filter(user => user._id !== id));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleEditChange = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      });
      
      if (response.ok) {
        const updatedUserResponse = await response.json();
        // Update table UI
        setUsers(users.map(u => u._id === editingUser._id ? {...u, ...updatedUserResponse} : u));
        closeEditModal();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold">Loading Users...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">User Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage all registered users and roles across the platform.</p>
          </div>
        </div>

        {/* Beautiful Table Container */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Campus</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="profile" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                          {user.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800">{user.fullName}</p>
                        <p className="text-xs text-slate-500">ID: {user._id.slice(-6)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">{user.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{user.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {user.campus}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'Employee' ? 'bg-teal-100 text-teal-800' : 
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {/* Edit Icon */}
                        <button onClick={() => openEditModal(user)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {/* Delete Icon */}
                        <button onClick={() => handleDelete(user._id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-colors shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal Popup */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Edit User Profile</h3>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <form onSubmit={submitEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input type="text" name="fullName" value={editingUser.fullName} onChange={handleEditChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" name="email" value={editingUser.email} onChange={handleEditChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Campus</label>
                  <input type="text" name="campus" value={editingUser.campus} onChange={handleEditChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Configuration</label>
                <select 
                  name="role" 
                  value={editingUser.role} 
                  onChange={handleEditChange} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-medium"
                >
                  <option value="Student">Student</option>
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">* Changing this will alter where the user is redirected upon their next login.</p>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default User;