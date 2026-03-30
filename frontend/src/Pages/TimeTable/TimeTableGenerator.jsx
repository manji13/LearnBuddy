import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import API_URL from '../../api/config';
import Navbar from '../../Components/NavBar/NavBar';

const TimeTableGenerator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [userId] = useState('64bd2c9b4e3f4a2b9c8d1e7f');

  const [formData, setFormData] = useState({
    examName: '',
    examDate: '',
    hoursPerDay: 4,
    availableSlots: [],
    subjects: [{ name: '', proficiency: 'Average' }],
    prioritizeDifficult: true,
    scheduleType: 'Daily',
    unavailableDays: [],
    unavailableTimeSlots: [], // New state for specific busy blocks
    minBreakDuration: 15,
    energyLevel: 'Medium',
    studyPreference: 'Mixed'
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const proficiencies = ['Weak', 'Average', 'Strong'];
  const energyLevels = ['High', 'Medium', 'Low'];
  const studyPreferences = ['Morning', 'Afternoon', 'Night', 'Mixed'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (name, value) => {
    setFormData(prev => {
      const array = [...prev[name]];
      if (array.includes(value)) {
        return { ...prev, [name]: array.filter(item => item !== value) };
      } else {
        return { ...prev, [name]: [...array, value] };
      }
    });
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index][field] = value;
    setFormData(prev => ({ ...prev, subjects: newSubjects }));
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { name: '', proficiency: 'Average' }]
    }));
  };

  const removeSubject = (index) => {
    const newSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, subjects: newSubjects }));
  };

  // Specific Time Slot Handlers
  const addUnavailableTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      unavailableTimeSlots: [...(prev.unavailableTimeSlots || []), { day: 'Monday', startTime: '16:00', endTime: '19:00' }]
    }));
  };

  const handleUnavailableTimeSlotChange = (index, field, value) => {
    const newSlots = [...(formData.unavailableTimeSlots || [])];
    newSlots[index][field] = value;
    setFormData(prev => ({ ...prev, unavailableTimeSlots: newSlots }));
  };

  const removeUnavailableTimeSlot = (index) => {
    const newSlots = (formData.unavailableTimeSlots || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, unavailableTimeSlots: newSlots }));
  };

  const validateForm = () => {
    if (!formData.examName.trim()) { toast.error('Enter an exam name'); return false; }
    if (!formData.examDate) { toast.error('Select an exam date'); return false; }
    if (formData.subjects.some(sub => !sub.name.trim())) { toast.error('Fill in all subject names'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = { userId, ...formData };
      const res = await axios.post(`${API_URL}/timetable/generate`, payload);
      setGeneratedSchedule(res.data);
      toast.success('Advanced study timetable generated! 🎉');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (blockId, currentStatus) => {
    if (!generatedSchedule || !generatedSchedule._id) return;
    try {
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      const res = await axios.put(`${API_URL}/timetable/${generatedSchedule._id}/block/${blockId}`, { status: newStatus });
      setGeneratedSchedule(res.data);
      toast.success(`Block marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleRecalculate = async () => {
    if (!generatedSchedule || !generatedSchedule._id) return;
    toast.loading('Recalculating missed blocks...', { id: 'recalc' });
    try {
      const res = await axios.post(`${API_URL}/timetable/${generatedSchedule._id}/recalculate`);
      setGeneratedSchedule(res.data);
      toast.success('Schedule optimized & redistributed!', { id: 'recalc' });
    } catch (error) {
      toast.error('Failed to recalculate', { id: 'recalc' });
    }
  };

  const handleExport = () => {
    if (!generatedSchedule || !generatedSchedule._id) return;
    window.open(`${API_URL}/timetable/${generatedSchedule._id}/export`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />

      <div className="container mx-auto px-6 max-w-5xl mt-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition-colors mb-6"
        >
          <span>←</span> Back
        </button>

        <div className="text-center mb-10 animate-in fade-in-down">

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">Time Table Generator</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Design a scientifically optimized study schedule perfectly tuned to your life constraints.
          </p>
        </div>

        {generatedSchedule ? (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 animate-in fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-100 pb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Your Action Plan 🚀</h2>
                <p className="text-slate-500">For: <span className="font-semibold text-indigo-600">{generatedSchedule.examName}</span></p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRecalculate}
                  className="px-4 py-2 bg-rose-50 text-rose-600 font-medium hover:bg-rose-100 rounded-xl transition"
                >
                  🔄 Recalculate Missed Days
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 rounded-xl transition"
                >
                  📅 Export to Calendar
                </button>
                <button
                  onClick={() => setGeneratedSchedule(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 rounded-xl transition"
                >
                  Create New
                </button>
              </div>
            </div>

            {generatedSchedule.generatedSchedule && generatedSchedule.generatedSchedule.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                      <th className="p-4 font-semibold whitespace-nowrap">Time Slot</th>
                      <th className="p-4 font-semibold">Subject</th>
                      <th className="p-4 font-semibold whitespace-nowrap">Duration</th>
                      <th className="p-4 font-semibold text-center whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {generatedSchedule.generatedSchedule.map((block, index) => {
                      const isBreak = block.subject.includes('Break');
                      const isCompleted = block.status === 'Completed';

                      return (
                        <tr key={block._id || index} className={`transition-colors hover:bg-slate-50/50 ${isBreak ? 'bg-amber-50/40' : (isCompleted ? 'bg-teal-50/20' : '')}`}>
                          <td className="p-4 align-middle">
                            <div className="font-bold text-slate-800 whitespace-nowrap">{new Date(block.date).toLocaleDateString()}</div>
                            <div className="text-xs font-semibold text-slate-500 uppercase">{block.dayName}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-600 whitespace-nowrap shadow-sm border border-indigo-100">
                              🌤️ {block.timeSlot}
                            </span>
                          </td>
                          <td className="p-4 align-middle">
                            <div className={`font-bold text-base ${isBreak ? 'text-amber-600' : 'text-indigo-700'}`}>
                              {block.subject}
                            </div>
                          </td>
                          <td className="p-4 align-middle font-medium text-slate-600 whitespace-nowrap">
                            ⏱️ {block.durationHours} hrs
                          </td>
                          <td className="p-4 align-middle">
                            {isBreak ? (
                              <div className="flex justify-center w-full">
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 uppercase">Rest</span>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <label className="relative flex items-center justify-center cursor-pointer group" title={isCompleted ? "Mark Pending" : "Mark Done"}>
                                  <input
                                    type="checkbox"
                                    checked={isCompleted}
                                    onChange={() => handleStatusToggle(block._id, block.status)}
                                    className="peer sr-only"
                                  />
                                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-300 text-transparent group-hover:border-teal-400 group-hover:bg-teal-50'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </label>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-500 text-lg">No study days available based on your constraints.</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in-up animation-delay-200">
            {/* 1. Exam Details */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">📝</div>
                <h2 className="text-2xl font-bold text-slate-800">1. Exam Details</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Name</label>
                  <input type="text" name="examName" value={formData.examName} onChange={handleInputChange} placeholder="e.g. Final Semester Exam" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Date</label>
                  <input type="date" name="examDate" value={formData.examDate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none bg-slate-50 " />
                </div>
              </div>
            </div>

            {/* 2. Intelligent Preferences */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-teal-100 p-2 rounded-xl text-teal-600">🧠</div>
                <h2 className="text-2xl font-bold text-slate-800">2. Study Intelligence Profiling</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Daily Energy Level</label>
                  <div className="flex flex-col gap-2">
                    {energyLevels.map(lvl => (
                      <label key={lvl} className={`flex items-center justify-between px-4 py-3 border rounded-xl cursor-pointer transition-all ${formData.energyLevel === lvl ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <span className="font-medium text-slate-700">{lvl}</span>
                        <input type="radio" name="energyLevel" value={lvl} checked={formData.energyLevel === lvl} onChange={handleInputChange} className="w-4 h-4 text-teal-600" />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Time Preference</label>
                  <div className="flex flex-col gap-2">
                    {studyPreferences.map(pref => (
                      <label key={pref} className={`flex items-center justify-between px-4 py-3 border rounded-xl cursor-pointer transition-all ${formData.studyPreference === pref ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <span className="font-medium text-slate-700">{pref}</span>
                        <input type="radio" name="studyPreference" value={pref} checked={formData.studyPreference === pref} onChange={handleInputChange} className="w-4 h-4 text-teal-600" />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hours Per Day (Focus Target)</label>
                  <input type="number" name="hoursPerDay" min="1" max="24" value={formData.hoursPerDay} onChange={handleInputChange} className="w-full px-4 py-3 mb-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 transition-all outline-none bg-slate-50" />

                  <label className="block text-sm font-semibold text-slate-700 mb-2">Min Break Duration (Mins)</label>
                  <input type="number" name="minBreakDuration" value={formData.minBreakDuration} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 transition-all outline-none bg-slate-50" />
                </div>
              </div>
            </div>

            {/* 3. Subjects & Proficiency */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-xl text-purple-600">📚</div>
                <h2 className="text-2xl font-bold text-slate-800">3. Subject Proficiency</h2>
              </div>

              <div className="mb-6 space-y-4">
                {formData.subjects.map((subject, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <input type="text" value={subject.name} onChange={(e) => handleSubjectChange(index, 'name', e.target.value)} placeholder="Subject Name" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none w-full bg-white" />

                    <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden w-full sm:w-auto shrink-0 shadow-sm">
                      {proficiencies.map(prof => (
                        <button
                          type="button" key={prof}
                          onClick={() => handleSubjectChange(index, 'proficiency', prof)}
                          className={`px-4 py-3 text-sm font-semibold transition flex-1 ${subject.proficiency === prof ? (prof === 'Weak' ? 'bg-rose-500 text-white' : prof === 'Strong' ? 'bg-teal-500 text-white' : 'bg-indigo-500 text-white') : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          {prof}
                        </button>
                      ))}
                    </div>

                    {formData.subjects.length > 1 && (
                      <button type="button" onClick={() => removeSubject(index)} className="p-3 bg-white text-rose-500 border border-slate-200 hover:bg-rose-50 rounded-xl transition-colors shrink-0 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 01-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    )}
                  </div>
                ))}

                <button type="button" onClick={addSubject} className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-5 py-3 rounded-xl transition-colors w-full justify-center border border-purple-100">
                  <span>+</span> Add Another Subject
                </button>
              </div>
            </div>

            {/* 4. Constraints */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-2 rounded-xl text-amber-600">🚫</div>
                <h2 className="text-2xl font-bold text-slate-800">4. Availability Constraints</h2>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Select unavailable days (Full days off from studying)</label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map(day => (
                    <button
                      type="button" key={day} onClick={() => handleArrayChange('unavailableDays', day)}
                      className={`px-5 py-3 rounded-xl text-sm font-bold transition-all ${formData.unavailableDays.includes(day)
                        ? 'bg-rose-500 text-white shadow-md transform -translate-y-1'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {day} {formData.unavailableDays.includes(day) && '🚫'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Time Blocks */}
              <div className="border-t border-slate-100 pt-8 mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Specific Busy Time Blocks</label>
                <p className="text-xs text-slate-500 mb-4">Add your work schedule, classes, or chores. The AI will perfectly schedule your study hours around them.</p>

                <div className="space-y-4 mb-4">
                  {formData.unavailableTimeSlots && formData.unavailableTimeSlots.map((slot, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in">
                      <select
                        value={slot.day}
                        onChange={(e) => handleUnavailableTimeSlotChange(index, 'day', e.target.value)}
                        className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none w-full md:w-1/3 bg-white"
                      >
                        {weekDays.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleUnavailableTimeSlotChange(index, 'startTime', e.target.value)}
                        className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none w-full md:w-1/3 bg-white"
                      />
                      <span className="text-slate-400 font-bold hidden md:block">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleUnavailableTimeSlotChange(index, 'endTime', e.target.value)}
                        className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none w-full md:w-1/3 bg-white"
                      />
                      <button type="button" onClick={() => removeUnavailableTimeSlot(index)} className="p-3 bg-white text-rose-500 border border-slate-200 hover:bg-rose-50 rounded-xl transition-colors shrink-0 shadow-sm md:w-auto w-full flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 01-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addUnavailableTimeSlot} className="flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-5 py-3 rounded-xl transition-colors w-full md:w-auto border border-amber-100">
                  <span>+</span> Add Busy Block (e.g. Work, Classes)
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit" disabled={loading}
                className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-bold text-xl px-12 py-5 rounded-full shadow-[0_8px_30px_rgb(99,102,241,0.4)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group w-full max-w-lg"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Synthesizing Algorithm... ⚙️' : ' Genarate shedule Plan 🚀'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
};

export default TimeTableGenerator;
