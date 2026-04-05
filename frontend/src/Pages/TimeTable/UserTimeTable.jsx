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
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to update status');
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
                              if (currentView === 'month') {
                                setCurrentDate(start);
                                setCurrentView('day');
                              }
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
    </div>
  );
};

export default UserTimeTable;
