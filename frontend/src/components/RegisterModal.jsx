import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, UserPlus, Shield, UserCheck, User, Mail, Briefcase, Sparkles } from 'lucide-react';

export default function RegisterModal({ isOpen, onClose }) {
  const { registerUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [department, setDepartment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setSubmitting(true);
    try {
      await registerUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
        department: department.trim() || undefined
      });
      onClose();
      setFullName('');
      setEmail('');
      setDepartment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleDescription = (selectedRole) => {
    switch (selectedRole) {
      case 'MANAGER':
        return 'Can assign tasks with due dates, assign mentors and mentees, and receives automated completion sign-off emails.';
      case 'MENTOR':
        return 'Receives immediate email notifications with due dates upon task creation, and holds sole authority to transition tasks (PENDING → IN_PROGRESS → COMPLETED).';
      case 'MEMBER':
        return 'Team member (mentee). Executes assigned deliverables and reviews mentor feedback.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Register New User</h3>
              <p className="text-xs text-slate-500">Add a team member, mentor, or manager to the system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rachel Green"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Work Email Address *</span>
            </label>
            <input
              type="email"
              required
              placeholder="rachel.green@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Select System Role *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('MEMBER')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold text-center transition flex flex-col items-center space-y-1 ${
                  role === 'MEMBER'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Mentee</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('MENTOR')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold text-center transition flex flex-col items-center space-y-1 ${
                  role === 'MENTOR'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Mentor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('MANAGER')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold text-center transition flex flex-col items-center space-y-1 ${
                  role === 'MANAGER'
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Manager</span>
              </button>
            </div>
          </div>

          {/* Role details callout */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider mb-0.5">
              {role} Permissions:
            </span>
            <p className="text-[11px] leading-relaxed">{getRoleDescription(role)}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Department / Team</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Core Backend, Data Platform, Security"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? 'Registering...' : 'Register & Switch User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

