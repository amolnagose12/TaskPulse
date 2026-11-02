import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import EmailOutboxView from './components/EmailOutboxModal';
import AnalyticsView from './components/AnalyticsView';
import CreateTaskModal from './components/CreateTaskModal';
import RegisterModal from './components/RegisterModal';
import { AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';

export default function App() {
  const { loading, error, activeTab, toast } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-sm font-semibold text-slate-700">Connecting to TaskPulse Backend...</p>
        <p className="text-xs text-slate-400 mt-1">Checking Spring Boot on http://localhost:8080</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl max-w-md w-full border border-rose-200 shadow-md text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Backend Connection Error</h2>
          <p className="text-xs text-slate-500 mt-2">{error}</p>
          <div className="mt-4 p-3 bg-slate-50 rounded-xl text-left text-xs text-slate-600 font-mono">
            Ensure the Spring Boot backend is running on port 8080:<br />
            <code>cd backend &amp;&amp; mvn spring-boot:run</code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Navigation Header */}
      <Header 
        onOpenCreateTask={() => setIsCreateModalOpen(true)} 
        onOpenRegister={() => setIsRegisterModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'board' && <KanbanBoard />}
        {activeTab === 'outbox' && <EmailOutboxView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Register User Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
          <div className={`p-4 rounded-xl shadow-xl border flex items-start space-x-3 text-xs ${
            toast.type === 'success' 
              ? 'bg-slate-900 text-white border-slate-800' 
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : 'bg-blue-900 text-white border-blue-800'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />}
            <div className="flex-1">
              <span className="font-semibold block">{toast.type.toUpperCase()}</span>
              <p className="mt-0.5 text-slate-200 leading-relaxed">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        TaskPulse &bull; Collaborative Team &amp; Mentorship Task Tracker &bull; Spring Boot + React
      </footer>
    </div>
  );
}

