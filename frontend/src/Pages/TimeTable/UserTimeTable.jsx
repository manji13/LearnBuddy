import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import API_URL from '../../api/config';
import Navbar from '../../Components/NavBar/ProfileNavbar'; 

const UserTimeTable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Try to use true logged in user, fallback to the hardcoded test user if not found
  const userId = localStorage.getItem('userId') || '64bd2c9b4e3f4a2b9c8d1e7f';

  const [editingBlockId, setEditingBlockId] = useState(null);
  const [editForm, setEditForm] = useState({ timeSlot: '', subject: '', date: '' });

  useEffect(() => {
    fetchTimeTables();
  }, []);

  const fetchTimeTables = async () => {
    try {
      const res = await axios.get(`${API_URL}/timetable/user/${userId}`);
      setTimetables(res.data);
    } catch (error) {
      toast.error('Failed to load timetables');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this timetable?")) return;
    try {
      await axios.delete(`${API_URL}/timetable/${id}`);
      setTimetables(prev => prev.filter(t => t._id !== id));
      toast.success('Timetable deleted');
    } catch (error) {
      toast.error('Failed to delete timetable');
    }
  };

  const handleStatusToggle = async (tableId, blockId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      const res = await axios.put(`${API_URL}/timetable/${tableId}/block/${blockId}`, { status: newStatus });
      setTimetables(prev => prev.map(t => t._id === tableId ? res.data : t));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const startEdit = (block) => {
    setEditingBlockId(block._id);
    setEditForm({ 
      timeSlot: block.timeSlot, 
      subject: block.subject,
      date: new Date(block.date).toISOString().split('T')[0]
    });
  };

  const saveEdit = async (table, blockId) => {
    const selectedDate = new Date(editForm.date);
    const examDate = new Date(table.examDate);
    if (selectedDate > examDate) {
      toast.error('Date cannot be greater than exam date!');
      return;
    }
    if (!editForm.date) {
      toast.error('Date is required!');
      return;
    }

    try {
      const res = await axios.put(`${API_URL}/timetable/${table._id}/block/${blockId}`, editForm);
      setTimetables(prev => prev.map(t => t._id === table._id ? res.data : t));
      setEditingBlockId(null);
      toast.success('Block accurately updated!');
    } catch (error) {
      toast.error('Failed to update block');
    }
  };

  const groupScheduleByDate = (scheduleArray) => {
    const groups = {};
    // Ensure chronological sorting across dynamically injected dates
    const sorted = [...scheduleArray].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sorted.forEach(block => {
      const dateStr = new Date(block.date).toLocaleDateString();
      if (!groups[dateStr]) {
        groups[dateStr] = { date: block.date, dayName: block.dayName, blocks: [] };
      }
      groups[dateStr].blocks.push(block);
    });
    return Object.values(groups);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <div className="text-indigo-600 font-bold">Loading Your Time Tables...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 items-start w-full relative">
        <div className="w-full md:w-64 flex-shrink-0 md:sticky md:top-12 z-10">
          <Navbar /> 
        </div>

        <main className="flex-1 w-full">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden w-full mx-auto p-4 md:p-8 lg:p-12">
            
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-10 border-b border-slate-100 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Saved Time Tables</h1>
                <p className="text-slate-500 mt-2">View and manage your AI-generated study schedules.</p>
              </div>
              <button 
                onClick={() => navigate('/timetable-generator')}
                className="whitespace-nowrap px-5 py-2.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
              >
                + Create New Plan
              </button>
            </div>

            {timetables.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No active time tables</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">You haven't generated any study schedules yet. Let our AI build the perfect plan for your exams!</p>
                <button 
                  onClick={() => navigate('/timetable-generator')}
                  className="px-6 py-3 bg-white text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl shadow-sm transition-all border border-indigo-100"
                >
                  Generate Time Table
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {timetables.map((table) => {
                  const groupedSchedule = groupScheduleByDate(table.generatedSchedule || []);
                  
                  return (
                    <div key={table._id} className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in">
                      <div className="bg-white px-8 py-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-slate-800">{table.examName}</h2>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${table.scheduleType === 'Daily' ? 'bg-sky-100 text-sky-700' : table.scheduleType === 'Weekly' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                              {table.scheduleType}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-500">
                            Target Exam Date: <span className="text-indigo-600">{new Date(table.examDate).toLocaleDateString()}</span> • {table.hoursPerDay} hrs/day
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => window.open(`${API_URL}/timetable/${table._id}/export`, '_blank')}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 rounded-lg shadow-sm transition-all text-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            Export ICS
                          </button>
                          <button 
                            onClick={() => handleDelete(table._id)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-rose-600 font-bold hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg shadow-sm transition-all text-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="p-4 md:p-8 space-y-8">
                        {groupedSchedule.map((group, groupIdx) => (
                          <div key={groupIdx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                {new Date(group.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </h3>
                              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                {group.dayName}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-3 font-semibold whitespace-nowrap w-64">Date & Time Slot</th>
                                    <th className="px-6 py-3 font-semibold">Allocated Subject</th>
                                    <th className="px-6 py-3 font-semibold whitespace-nowrap border-l border-slate-100 w-32">Duration</th>
                                    <th className="px-6 py-3 font-semibold text-center whitespace-nowrap border-l border-slate-100 w-24">Status</th>
                                    <th className="px-6 py-3 font-semibold text-center whitespace-nowrap border-l border-slate-100 w-32">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {group.blocks.map((block, index) => {
                                    const isBreak = block.subject.includes('Break');
                                    const isEditing = editingBlockId === block._id;
                                    const isCompleted = block.status === 'Completed';

                                    return (
                                      <tr key={block._id || index} className={`transition-colors hover:bg-slate-50/50 ${isBreak ? 'bg-amber-50/20' : (isCompleted && !isEditing ? 'bg-teal-50/10' : (isEditing ? 'bg-indigo-50/20' : ''))}`}>
                                        <td className="px-6 py-4 align-middle w-64">
                                          {isEditing ? (
                                            <div className="flex flex-col gap-2.5">
                                              <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block tracking-wider">Target Date</label>
                                                <input 
                                                  type="date" 
                                                  value={editForm.date} 
                                                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                                  max={new Date(table.examDate).toISOString().split('T')[0]}
                                                  className="w-full px-3 py-2 text-sm font-semibold border-0 rounded-lg outline-none ring-1 ring-inset ring-indigo-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 shadow-sm bg-white" 
                                                />
                                              </div>
                                              <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block tracking-wider">Time Format</label>
                                                <input 
                                                  type="text" 
                                                  value={editForm.timeSlot} 
                                                  onChange={(e) => setEditForm({...editForm, timeSlot: e.target.value})}
                                                  className="w-full px-3 py-2 text-sm font-semibold border-0 rounded-lg outline-none ring-1 ring-inset ring-indigo-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 shadow-sm bg-white" 
                                                  placeholder="08:00 AM - 10:00 AM"
                                                />
                                              </div>
                                            </div>
                                          ) : (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-sm border ${isBreak ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-white text-slate-700 border-slate-200'}`}>
                                              🌤️ {block.timeSlot}
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                          {isEditing ? (
                                            <div className="flex flex-col gap-2.5 h-full pt-1">
                                              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block tracking-wider">Selected Subject</label>
                                              <select 
                                                value={editForm.subject} 
                                                onChange={(e) => setEditForm({...editForm, subject: e.target.value})}
                                                className="w-full px-3 py-2 text-sm font-semibold border-0 rounded-lg outline-none ring-1 ring-inset ring-indigo-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 shadow-sm bg-white cursor-pointer" 
                                              >
                                                {[...table.subjects.map(s => s.name), 'Break ☕'].map(sub => (
                                                  <option key={sub} value={sub}>{sub}</option>
                                                ))}
                                              </select>
                                            </div>
                                          ) : (
                                            <div className={`font-bold text-base ${isBreak ? 'text-amber-600' : (isCompleted ? 'text-slate-400 line-through' : 'text-slate-800')}`}>
                                              {block.subject}
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-6 py-4 align-middle font-medium text-slate-500 whitespace-nowrap border-l border-slate-50 w-32">
                                          <div className={isEditing ? 'mt-6' : ''}>
                                            ⏱️ {block.durationHours} hrs
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 align-middle border-l border-slate-50 w-24">
                                          <div className={isEditing ? 'mt-6' : ''}>
                                            {isBreak ? (
                                              <div className="flex justify-center w-full">
                                                <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-widest">Rest</span>
                                              </div>
                                            ) : (
                                              <div className="flex justify-center">
                                                <label className="relative flex items-center justify-center cursor-pointer group" title={isCompleted ? "Mark Pending" : "Mark Done"}>
                                                  <input 
                                                    type="checkbox" 
                                                    checked={isCompleted} 
                                                    onChange={() => handleStatusToggle(table._id, block._id, block.status)}
                                                    className="peer sr-only"
                                                  />
                                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-teal-500 border-teal-500 text-white shadow-sm' : 'bg-white border-slate-300 text-transparent group-hover:border-teal-400 group-hover:bg-teal-50'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                  </div>
                                                </label>
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 align-middle border-l border-slate-50 text-center w-32">
                                          {!isBreak && (
                                            isEditing ? (
                                              <div className="flex flex-col items-stretch justify-center gap-2 mt-6">
                                                <button onClick={() => saveEdit(table, block._id)} className="w-full text-xs font-bold py-2 px-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1" title="Save changes">
                                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                  </svg>
                                                  Save
                                                </button>
                                                <button onClick={() => setEditingBlockId(null)} className="w-full text-xs font-bold py-2 px-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1" title="Cancel editing">
                                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                  </svg>
                                                  Cancel
                                                </button>
                                              </div>
                                            ) : (
                                              <button onClick={() => startEdit(block)} className="p-2.5 text-indigo-500 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200 hover:border-indigo-200 shadow-sm" title="Edit Block">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mx-auto">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                              </button>
                                            )
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserTimeTable;
