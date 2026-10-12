import React, { useState } from 'react';
import { UserCheck, UserPlus, Trash2, Search, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Teacher, Role } from '../types';

interface TeachersTabProps {
  teachers: Teacher[];
  classList: string[];
  currentUserRole: Role | null;
  onUpdateTeacher: (teacher: Teacher) => void;
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onDeleteTeacher: (id: number) => void;
}

export const TeachersTab: React.FC<TeachersTabProps> = ({
  teachers,
  classList,
  currentUserRole,
  onUpdateTeacher,
  onAddTeacher,
  onDeleteTeacher
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPins, setShowPins] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [assignedClass, setAssignedClass] = useState(classList[0]);
  const [pin, setPin] = useState('');

  const isAdmin = currentUserRole === 'admin';

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNameBlur = (teacher: Teacher, newName: string) => {
    if (newName.trim() && newName !== teacher.name) {
      onUpdateTeacher({ ...teacher, name: newName.trim() });
    }
  };

  const handleClassChange = (teacher: Teacher, newClass: string) => {
    onUpdateTeacher({ ...teacher, assignedClass: newClass });
  };

  const handlePinChange = (teacher: Teacher, newPin: string) => {
    onUpdateTeacher({ ...teacher, pin: newPin.trim() });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('እባክዎን የመምህሩን ሙሉ ስም ያስገቡ!');
      return;
    }
    const finalPin = pin.trim() || Math.floor(1000 + Math.random() * 9000).toString();
    onAddTeacher({
      name: name.trim(),
      assignedClass,
      pin: finalPin
    });

    setName('');
    setPin('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-700" />
              የመምህራን ዝርዝር፣ የተመደቡበት ክፍል እና የግል PIN
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ጠቅላላ መምህራን፦ <strong className="text-teal-900 font-bold">{teachers.length}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="መምህር ፈልግ..."
                className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 w-48"
              />
            </div>

            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setShowPins(!showPins)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPins ? 'PIN ደብቅ' : 'PIN አሳይ'}
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + አዲስ መምህር ጨምር
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-center">
                <th className="py-3 px-3 border-r border-slate-200 w-12">ተ.ቁ</th>
                <th className="py-3 px-4 border-r border-slate-200 text-left min-w-[180px]">
                  የመምህር ስም
                </th>
                <th className="py-3 px-4 border-r border-slate-200 min-w-[160px]">
                  የተመደበበት ክፍል
                </th>
                <th className="py-3 px-4 border-r border-slate-200 w-32">የግል PIN</th>
                {isAdmin && <th className="py-3 px-3 print:hidden w-16">ተግባር</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-center">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    ምንም መምህር አልተገኘም።
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-500 font-medium">
                      {idx + 1}
                    </td>

                    {/* Teacher Name */}
                    <td className="py-2.5 px-4 border-r border-slate-200 text-left font-bold text-slate-900">
                      {isAdmin ? (
                        <input
                          type="text"
                          defaultValue={t.name}
                          onBlur={(e) => handleNameBlur(t, e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-600 focus:bg-white px-1 py-0.5 rounded text-xs outline-none"
                        />
                      ) : (
                        <span>{t.name}</span>
                      )}
                    </td>

                    {/* Assigned Class */}
                    <td className="py-2.5 px-4 border-r border-slate-200">
                      {isAdmin ? (
                        <select
                          value={t.assignedClass}
                          onChange={(e) => handleClassChange(t, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
                        >
                          {classList.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-semibold text-slate-800">{t.assignedClass}</span>
                      )}
                    </td>

                    {/* PIN */}
                    <td className="py-2.5 px-4 border-r border-slate-200 font-mono">
                      {isAdmin ? (
                        <input
                          type={showPins ? 'text' : 'password'}
                          value={t.pin}
                          onChange={(e) => handlePinChange(t, e.target.value)}
                          className="w-20 text-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-teal-600"
                        />
                      ) : (
                        <span className="text-slate-400">••••</span>
                      )}
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td className="py-2.5 px-3 print:hidden">
                        <button
                          onClick={() => {
                            if (confirm(`${t.name} የተባሉትን መምህር መሰረዝ ይፈልጋሉ?`)) {
                              onDeleteTeacher(t.id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition"
                          title="መምህር ሰርዝ"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">አዲስ መምህር መዝግብ</h3>
            <p className="text-xs text-slate-500 mb-4">የመምህር መረጃ እና የግል PIN</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  የመምህሩ ሙሉ ስም፦
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ሙሉ ስም ያስገቡ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  የሚመደቡበት ክፍል፦
                </label>
                <select
                  value={assignedClass}
                  onChange={(e) => setAssignedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  {classList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  የግል PIN (ባዶ ከተተወ በራሱ ይመረጣል)፦
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="ምሳሌ፡ 2034"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                  />
                </div>
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
                  className="px-4 py-2 text-xs bg-teal-700 hover:bg-teal-600 text-white rounded-xl font-semibold shadow"
                >
                  መዝግብ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
