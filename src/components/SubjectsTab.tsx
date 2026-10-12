import React, { useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { Role } from '../types';

interface SubjectsTabProps {
  subjects: string[];
  onAddSubject: (subjectName: string) => void;
  onDeleteSubject: (index: number) => void;
  currentUserRole: Role | null;
}

export const SubjectsTab: React.FC<SubjectsTabProps> = ({
  subjects,
  onAddSubject,
  onDeleteSubject,
  currentUserRole
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  const isAdmin = currentUserRole === 'admin';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) {
      alert('እባክዎ የትምህርቱን ስም ያስገቡ!');
      return;
    }
    onAddSubject(newSubject.trim());
    setNewSubject('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                የኮርስ / የትምህርት ዓይነቶች መዝገብ
              </h3>
              <p className="text-xs text-slate-500">
                በሰንበት ትምህርት ቤት የሚሰጡ መደበኛና ልዩ መንፈሳዊ ትምህርቶች
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              + አዲስ ትምህርት ጨምር
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjects.map((sub, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50/50 hover:border-blue-200 transition group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </span>
                <span className="font-semibold text-slate-800 text-sm">{sub}</span>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    if (confirm(`"${sub}" የሚለውን ትምህርት መሰረዝ ይፈልጋሉ?`)) {
                      onDeleteSubject(idx);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition"
                  title="ትምህርት ሰርዝ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">አዲስ ትምህርት ጨምር</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  የትምህርቱ ስም፦
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="ምሳሌ፡ የሐዋርያት ሥራ ጥናት"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-800 hover:bg-blue-700 text-white rounded-xl font-semibold shadow"
                >
                  ጨምር
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
