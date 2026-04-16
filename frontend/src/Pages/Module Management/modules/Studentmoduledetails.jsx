import API_URL from '../../../api/config';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../../../Components/NavBar/NavBar.jsx';

export default function StudentModuleDetails() {
	const { moduleId } = useParams();
	const navigate = useNavigate();

	const [module, setModule] = useState(null);
	const [semester, setSemester] = useState(null);
	const [faculty, setFaculty] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [noteForm, setNoteForm] = useState({ title: '', topic: '', uploadedBy: '' });
	const [noteFile, setNoteFile] = useState(null);
	const [noteSubmitting, setNoteSubmitting] = useState(false);
	const [resourceType, setResourceType] = useState('note'); // 'note' or 'pastpaper'

	useEffect(() => {
		const load = async () => {
			try {
				setError('');
				// Load module with populated semester / faculty if backend supports it
				const { data: md } = await axios.get(`${API_URL}/modules/${moduleId}`);
				const mod = md.data ?? md;
				setModule(mod);

				const semesterId = mod.semester?._id || mod.semester;
				const facultyId = mod.faculty?._id || mod.faculty;

				const [semRes, facRes] = await Promise.allSettled([
					semesterId ? axios.get(`${API_URL}/semesters/${semesterId}`) : Promise.resolve(null),
					facultyId ? axios.get(`${API_URL}/faculties/${facultyId}`) : Promise.resolve(null),
				]);

				if (semRes.status === 'fulfilled') {
					const sd = semRes.value.data;
					setSemester(sd.data ?? sd);
				}
				if (facRes.status === 'fulfilled') {
					const fd = facRes.value.data;
					setFaculty(fd.data ?? fd);
				}
			} catch (err) {
				console.error(err);
				setError('Failed to load module');
				toast.error('Failed to load module');
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [moduleId]);

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 font-sans">
				<Navbar />
				<div className="max-w-5xl mx-auto p-8 flex items-center justify-center gap-3 text-sm text-gray-400">
					<div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
					Loading module...
				</div>
			</div>
		);
	}

	if (!module) {
		return (
			<div className="min-h-screen bg-slate-50 font-sans">
				<Navbar />
				<div className="max-w-5xl mx-auto p-8">
					<p className="text-sm text-gray-500">Module not found.</p>
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
					>
						← Back
					</button>
				</div>
			</div>
		);
	}

	const facultyId = faculty?._id || module.faculty;
	const semesterId = semester?._id || module.semester;
	const moduleName = module.moduleName || '';
	const encodedModuleName = encodeURIComponent(moduleName);

	const handleStudentNoteInputChange = (e) => {
		const { name, value } = e.target;
		setNoteForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleStudentNoteFileChange = (e) => {
		setNoteFile(e.target.files[0] || null);
	};

	const handleStudentNoteSubmit = async (e) => {
		e.preventDefault();
		setError('');
		if (!noteFile) {
			toast.error('Please choose a PDF file');
			return;
		}
		if (!noteForm.title) {
			toast.error('Please enter a title');
			return;
		}

		const formData = new FormData();
		formData.append('title', noteForm.title);
		formData.append('uploadedBy', noteForm.uploadedBy);
		formData.append('file', noteFile);

		try {
			setNoteSubmitting(true);

			if (resourceType === 'note') {
				formData.append('moduleName', moduleName);
				formData.append('topic', noteForm.topic);
				await axios.post(`${API_URL}/notes/upload-student`, formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
				toast.success('Note submitted for approval. It will appear after admin approves it.');
			} else {
				// past paper: use current semester context for semester/year
				if (!semester) {
					toast.error('Semester information is not available for this module.');
					return;
				}
				const semesterLabel = `Semester ${semester.semester}`;
				formData.append('moduleName', moduleName);
				formData.append('semester', semesterLabel);
				formData.append('year', semester.year);
				await axios.post(`${API_URL}/pastpapers/upload-student`, formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
				toast.success('Past paper submitted for approval. It will appear after admin approves it.');
			}

			setNoteForm({ title: '', topic: '', uploadedBy: '' });
			setNoteFile(null);
		} catch (submitErr) {
			console.error(submitErr);
			toast.error(
				submitErr.response?.data?.message || 'Failed to submit file for approval',
			);
		} finally {
			setNoteSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 font-sans">
			<Navbar />

			<div className="max-w-5xl mx-auto p-8">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
					<Link to="/student/faculties" className="hover:text-blue-600 transition-colors">
						Faculties
					</Link>
					{facultyId && (
						<>
							<span>/</span>
							<Link
								to={`/student/faculties/${facultyId}/semesters`}
								className="hover:text-blue-600 transition-colors"
							>
								{faculty?.name || 'Semesters'}
							</Link>
						</>
					)}
					{semesterId && (
						<>
							<span>/</span>
							<Link
								to={`/student/faculties/${facultyId}/semesters/${semesterId}/modules`}
								className="hover:text-blue-600 transition-colors"
							>
								{semester
									? `Year ${semester.year} 
                  
									— Sem ${semester.semester}`
									: 'Modules'}
							</Link>
						</>
					)}
					<span>/</span>
					<span className="text-gray-700 font-medium">{moduleName}</span>
				</div>

				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
					<div>
						<p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">
							Module
						</p>
						<div className="flex items-center gap-3 mb-1">
							<h1 className="text-2xl font-bold text-gray-900">{moduleName}</h1>
							{module.moduleNumber && (
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
									{module.moduleNumber}
								</span>
							)}
						</div>
						{faculty && (
							<p className="text-sm text-gray-500">
								{faculty.name}
								{faculty.code && (
									<span className="ml-1 text-gray-400">({faculty.code})</span>
								)}
							</p>
						)}
						{semester && (
							<p className="text-xs text-gray-400 mt-1">
								Year {semester.year} · Semester {semester.semester}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-2 items-stretch md:items-end">
						<button
							type="button"
							onClick={() => navigate(-1)}
							className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-xs font-medium text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm"
						>
							← Back to Modules
						</button>
					</div>
				</div>

				{/* Description */}
				<div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-8">
					<h2 className="text-sm font-semibold text-gray-800 mb-2">About this module</h2>
					<p className="text-sm text-gray-600">
						{module.description || (
							<span className="text-gray-400">No description has been added yet.</span>
						)}
					</p>
				</div>

				{/* Study resources: Past Papers & Lecture Notes */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					{/* Past Papers card */}
					<div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
						<div>
							<p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">
								Past Papers
							</p>
							<h3 className="text-lg font-bold text-gray-900 mb-1">Practice with previous exams</h3>
							<p className="text-sm text-gray-600 mb-3">
								View and download all past papers uploaded for this module. You can also use the AI tools on the
								past papers page to generate practice questions and exam analysis.
							</p>
						</div>
						<Link
							to={`/past-papers?moduleName=${encodedModuleName}`}
							className="inline-flex items-center justify-center mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-sm"
						>
							Go to Past Papers →
						</Link>
					</div>

					{/* Lecture Notes card */}
					<div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
						<div>
							<p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">
								Lecture Notes
							</p>
							<h3 className="text-lg font-bold text-gray-900 mb-1">AI lecture notes workspace</h3>
							<p className="text-sm text-gray-600 mb-3">
								Open the lecture notes page filtered for this module. From there you can download notes, generate AI
								summaries, and create practice questions using the uploaded PDFs.
							</p>
						</div>
						<Link
							to={`/notes-ai?moduleName=${encodedModuleName}`}
							className="inline-flex items-center justify-center mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm"
						>
							Go to Lecture Notes →
						</Link>
					</div>
				</div>

				{/* Student note submission (no login required) */}
				<div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
					<h2 className="text-base font-semibold text-gray-900 mb-1">Submit a resource for this module</h2>
					<p className="text-xs text-gray-500 mb-4">
						Upload a PDF note or past paper for <span className="font-medium">{moduleName}</span>. It will be
							visible to other students only after an admin approves it.
					</p>
					<form
						onSubmit={handleStudentNoteSubmit}
						className="grid grid-cols-1 md:grid-cols-2 gap-4"
					>
						<div className="flex flex-col">
							<label className="text-sm font-medium text-gray-700 mb-1">Type *</label>
							<select
								value={resourceType}
								onChange={(e) => setResourceType(e.target.value)}
								className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
							>
								<option value="note">Lecture Note</option>
								<option value="pastpaper">Past Paper</option>
							</select>
						</div>
						<div className="flex flex-col">
							<label className="text-sm font-medium text-gray-700 mb-1">Title *</label>
							<input
								type="text"
								name="title"
								value={noteForm.title}
								onChange={handleStudentNoteInputChange}
								className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								placeholder="e.g. Week 05 - Sorting Algorithms"
							/>
						</div>

						<div className="flex flex-col">
							<label className="text-sm font-medium text-gray-700 mb-1">Topic (optional)</label>
							<input
								type="text"
								name="topic"
								value={noteForm.topic}
								onChange={handleStudentNoteInputChange}
								className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								placeholder="Optional short topic"
							/>
						</div>

						<div className="flex flex-col">
							<label className="text-sm font-medium text-gray-700 mb-1">Your name (optional)</label>
							<input
								type="text"
								name="uploadedBy"
								value={noteForm.uploadedBy}
								onChange={handleStudentNoteInputChange}
								className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								placeholder="Optional"
							/>
						</div>

						<div className="flex flex-col">
							<label className="text-sm font-medium text-gray-700 mb-1">PDF File *</label>
							<input
								type="file"
								accept="application/pdf"
								onChange={handleStudentNoteFileChange}
								className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
							/>
						</div>

						<div className="md:col-span-2 flex justify-end mt-2">
							<button
								type="submit"
								disabled={noteSubmitting}
								className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
							>
								{noteSubmitting ? 'Submitting...' : 'Submit for Approval'}
							</button>
						</div>
					</form>
				</div>

				{error && (
					<p className="mt-6 text-xs text-red-500">{error}</p>
				)}
			</div>
		</div>
	);
}

