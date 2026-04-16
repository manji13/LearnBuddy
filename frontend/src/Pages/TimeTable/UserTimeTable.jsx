import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import './ios-calendar.css';
import API_URL from '../../api/config';
import Navbar from '../../Components/NavBar/ProfileNavbar'; 

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar); 

const UserTimeTable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [selectedDay, setSelectedDay] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [editFormData, setEditFormData] = useState({ subject: '', timeSlot: '' });

  const navigate = useNavigate();
  
  // Try to use true logged in user, fallback to the hardcoded test user if not found
  const userId = localStorage.getItem('userId') || '64bd2c9b4e3f4a2b9c8d1e7f';

  useEffect(() => {
    fetchTimeTables();
  }, []);

  const fetchTimeTables = async () => {
    try {
      const res = await axios.get(`${API_URL}/timetable/user/${userId}`);
      setTimetables(res.data);
    } catch (err) {
      toast.error('Failed to load timetables');
      console.error(err);
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
    } catch {
      toast.error('Failed to delete timetable');
    }
  };

  const handleEventDrop = async (tableId, { event, start, end }) => {
    const newTimeSlot = `${moment(start).format('h:mm A')} - ${moment(end).format('h:mm A')}`;
    const newDate = start.toISOString();
    
    try {
      const res = await axios.put(`${API_URL}/timetable/${tableId}/block/${event.id}`, {
        timeSlot: newTimeSlot,
        date: newDate
      });
      setTimetables(prev => prev.map(t => t._id === tableId ? res.data : t));
      toast.success("Schedule Updated!");
    } catch {
      toast.error("Failed to move block");
    }
  };

  const handleSelectEvent = async (tableId, event) => {
    if (event.isBreak) return;
    const newStatus = event.isCompleted ? 'Pending' : 'Completed';
    try {
      const res = await axios.put(`${API_URL}/timetable/${tableId}/block/${event.id}`, { status: newStatus });
      setTimetables(prev => prev.map(t => t._id === tableId ? res.data : t));
      toast.success(`Marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteBlock = async (tableId, blockId) => {
    if (!window.confirm("Are you sure you want to delete this schedule block?")) return;
    try {
      const res = await axios.delete(`${API_URL}/timetable/${tableId}/block/${blockId}`);
      setTimetables(prev => prev.map(t => t._id === tableId ? res.data : t));
      toast.success('Task removed from schedule');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleEditBlockSubmit = async (tableId, blockId) => {
    if (!editFormData.subject.trim() || !editFormData.timeSlot.trim()) {
      toast.error('Subject and timeslot are required');
      return;
    }
    
    try {
      const res = await axios.put(`${API_URL}/timetable/${tableId}/block/${blockId}`, {
        subject: editFormData.subject,
        timeSlot: editFormData.timeSlot
      });
      setTimetables(prev => prev.map(t => t._id === tableId ? res.data : t));
      setEditingBlockId(null);
      toast.success('Task updated');
    } catch {
      toast.error('Failed to update task');
    }
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
    <div className="min-h-screen bg-[#f2f2f7] font-sans py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 items-start w-full relative">
        <div className="w-full md:w-64 flex-shrink-0 md:sticky md:top-12 z-10">
          <Navbar /> 
        </div>

        <main className="flex-1 w-full">
          <div className="bg-white rounded-3xl shadow-sm border border-[#e5e5ea] overflow-hidden w-full mx-auto p-4 md:p-8 lg:p-12">
            
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-10 border-b border-[#e5e5ea] pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-[#000000] tracking-tight">My Saved Time Tables</h1>
                <p className="text-gray-500 mt-2">View and manage your AI-generated study schedules.</p>
              </div>
              <button 
                onClick={() => navigate('/timetable-generator')}
                className="whitespace-nowrap px-5 py-2.5 bg-[#007aff] text-white font-bold hover:bg-blue-600 rounded-xl transition-all shadow-sm"
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
              <div className="animate-in fade-in">
                {(() => {
                  const table = timetables[0];
                  let earliestHour = 24;
                  let latestHour = 0;

                  const calendarEvents = table.generatedSchedule.map(block => {
                    if (!block.timeSlot || !block.timeSlot.includes(' - ')) return null;
                    const [startTimeStr, endTimeStr] = block.timeSlot.split(' - ');
                    const baseDateStr = block.date.split('T')[0];
                    const startDate = moment(`${baseDateStr} ${startTimeStr}`, 'YYYY-MM-DD h:mm A').toDate();
                    const endDate = moment(`${baseDateStr} ${endTimeStr}`, 'YYYY-MM-DD h:mm A').toDate();
                    
                    const startH = startDate.getHours();
                    const endH = endDate.getHours();
                    if (startH < earliestHour) earliestHour = startH;
                    if (endH > latestHour || (endH === 0 && endDate.getMinutes() === 0)) {
                       latestHour = (endH === 0 && endDate.getMinutes() === 0) ? 24 : endH;
                    }

                    return {
                      id: block._id,
                      title: block.subject,
                      start: startDate,
                      end: endDate,
                      isBreak: block.subject.includes('Break'),
                      isCompleted: block.status === 'Completed'
                    };
                  }).filter(Boolean);

                  if (earliestHour === 24) earliestHour = 8;
                  else earliestHour = Math.max(0, earliestHour - 1); 

                  if (latestHour === 0) latestHour = 20;
                  else latestHour = Math.min(23, latestHour + 1);

                  const minTime = moment().set({ hour: earliestHour, minute: 0, second: 0, millisecond: 0 }).toDate();
                  const maxTime = moment().set({ hour: latestHour, minute: 59, second: 59, millisecond: 0 }).toDate();
                  
                  return (
                    <div key={table._id} className="bg-[#f9f9eb] rounded-3xl overflow-hidden border border-[#e5e5ea]">
                      <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border-b border-[#e5e5ea]">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-[#000000]">{table.examName}</h2>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${table.scheduleType === 'Daily' ? 'bg-sky-100 text-sky-700' : table.scheduleType === 'Weekly' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                              {table.scheduleType}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-500">
                            Target Exam Date: <span className="text-[#007aff]">{new Date(table.examDate).toLocaleDateString()}</span> • {table.hoursPerDay} hrs/day
                          </p>
                          <p className="text-xs font-medium text-gray-400 mt-2">
                            Drag blocks to reschedule. Click a block to toggle completion! Click a day to view its detailed tasks.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => window.open(`${API_URL}/timetable/${table._id}/export`, '_blank')}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#f2f2f7] text-[#000000] font-bold hover:bg-[#e5e5ea] rounded-lg transition-all text-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            Export ICS
                          </button>
                          <button 
                            onClick={() => handleDelete(table._id)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-[#ff3b30] font-bold hover:bg-[#fff2f2] border border-[#ff3b30] rounded-lg transition-all text-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="p-0 md:p-4">
                        <div style={{ height: '750px' }} className="bg-white p-2 rounded-2xl w-full border border-[#e5e5ea]">
                          <DnDCalendar
                            localizer={localizer}
                            events={calendarEvents}
                            min={minTime}
                            max={maxTime}
                            view={currentView}
                            onView={setCurrentView}
                            date={currentDate}
                            onNavigate={setCurrentDate}
                            selectable={true}
                            onSelectSlot={({ start }) => {
                              setSelectedDay(start);
                              setIsDayModalOpen(true);
                            }}
                            onEventDrop={(args) => handleEventDrop(table._id, args)}
                            onSelectEvent={(event) => handleSelectEvent(table._id, event)}
                            resizable={false}
                            views={['week', 'day', 'month']}
                            step={30}
                            formats={{
                              eventTimeRangeFormat: () => '', 
                            }}
                            components={{
                              event: ({ event }) => (
                                <div 
                                  className={`h-full w-full rounded-md px-1.5 py-0.5 flex flex-col justify-start overflow-hidden transition-all shadow-sm ${
                                    event.isBreak ? 'bg-[#ffcc00] text-[#000]' : 
                                    (event.isCompleted ? 'bg-[#34c759] text-[#fff]' : 'bg-[#007aff] text-[#fff]')
                                  }`}
                                >
                                  <span className={`font-semibold text-[11px] leading-tight truncate ${event.isCompleted && !event.isBreak ? 'line-through opacity-80' : ''}`}>
                                    {event.title}
                                  </span>
                                  {currentView !== 'month' && !event.isBreak && (
                                    <span className="text-[10px] font-medium opacity-80 truncate">
                                      {moment(event.start).format('h:mm A')}
                                    </span>
                                  )}
                                </div>
                              )
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </main>
      </div>

      {isDayModalOpen && selectedDay && timetables.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsDayModalOpen(false);
            setEditingBlockId(null);
          }
        }}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col transform animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Schedule for {moment(selectedDay).format('MMMM Do, YYYY')}
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">Manage your day's tasks, breaks, and study sessions</p>
              </div>
              <button 
                onClick={() => { setIsDayModalOpen(false); setEditingBlockId(null); }}
                className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-full p-2.5 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="overflow-y-auto w-full p-6 bg-gray-50/20">
              <div className="bg-white border text-left border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-4 px-6 font-bold text-gray-700 text-xs uppercase tracking-wider">Time Slot</th>
                      <th className="py-4 px-6 font-bold text-gray-700 text-xs uppercase tracking-wider">Task / Subject</th>
                      <th className="py-4 px-6 font-bold text-gray-700 text-xs uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 font-bold text-gray-700 text-xs uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(() => {
                      const table = timetables[0];
                      const dayBlocks = table.generatedSchedule.filter(b => 
                        moment(b.date).isSame(selectedDay, 'day')
                      );
                      
                      if (dayBlocks.length === 0) {
                        return (
                          <tr>
                            <td colSpan="4" className="py-12 text-center">
                              <div className="text-gray-400 mb-2">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="font-medium text-lg text-gray-500">No tasks scheduled for this day</span>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      // Sort blocks by start time
                      dayBlocks.sort((a, b) => {
                        const timeA = moment(a.timeSlot ? a.timeSlot.split(' - ')[0] : '12:00 AM', 'h:mm A');
                        const timeB = moment(b.timeSlot ? b.timeSlot.split(' - ')[0] : '12:00 AM', 'h:mm A');
                        return timeA.diff(timeB);
                      });

                      return dayBlocks.map(block => (
                        <tr key={block._id} className="hover:bg-blue-50/30 transition-colors group">
                          {editingBlockId === block._id ? (
                            <>
                              <td className="py-3 px-6">
                                <input 
                                  type="text"
                                  className={`w-full max-w-[160px] border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${!editFormData.timeSlot.trim() ? 'border-red-400 focus:ring-red-500' : 'border-gray-200'}`}
                                  value={editFormData.timeSlot}
                                  onChange={(e) => setEditFormData({...editFormData, timeSlot: e.target.value})}
                                  placeholder="e.g. 9:00 AM - 10:00 AM"
                                />
                                {!editFormData.timeSlot.trim() && <p className="text-[10px] text-red-500 mt-1 font-semibold">Time is required</p>}
                              </td>
                              <td className="py-3 px-6">
                                <select 
                                  className={`w-full border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${!editFormData.subject.trim() ? 'border-red-400 focus:ring-red-500' : 'border-gray-200'}`}
                                  value={editFormData.subject}
                                  onChange={(e) => setEditFormData({...editFormData, subject: e.target.value})}
                                >
                                  <option value="">Select a subject...</option>
                                  {table.subjects && table.subjects.map((sub, idx) => (
                                    <option key={idx} value={sub.name}>{sub.name}</option>
                                  ))}
                                  <option value="Break ☕">Break ☕</option>
                                </select>
                                {!editFormData.subject.trim() && <p className="text-[10px] text-red-500 mt-1 font-semibold">Subject cannot be empty</p>}
                              </td>
                              <td className="py-3 px-6 text-sm whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full border ${
                                  block.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {block.status}
                                </span>
                              </td>
                              <td className="py-3 px-6 text-right whitespace-nowrap">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleEditBlockSubmit(table._id, block._id)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 shadow-sm transition-all">Save</button>
                                  <button onClick={() => setEditingBlockId(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-xs hover:bg-gray-200 shadow-sm transition-all border border-gray-200">Cancel</button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-4 px-6 text-sm font-bold text-gray-900 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                  {block.timeSlot}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm font-semibold text-gray-800">
                                <span className={block.subject.includes('Break') ? 'bg-orange-100 text-orange-800 px-3 py-1 rounded-lg border border-orange-200 shadow-sm' : ''}>
                                  {block.subject}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border shadow-sm ${
                                  block.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200'
                                }`}>
                                  {block.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      setEditingBlockId(block._id);
                                      setEditFormData({ subject: block.subject, timeSlot: block.timeSlot || '' });
                                    }} 
                                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors border border-blue-100"
                                    title="Edit task"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteBlock(table._id, block._id)} 
                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors border border-red-100"
                                    title="Delete task"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default UserTimeTable;
