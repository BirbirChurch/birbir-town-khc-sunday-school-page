import React, { useState } from 'react';
import { Calendar, UserX, Trash2, Printer, Download, Filter } from 'lucide-react';
import { AbsenteeRecord, Role } from '../types';
import { downloadCSV } from '../utils/csv';

interface AttendanceTabProps {
  currentYear: string;
  classList: string[];
  attendance: AbsenteeRecord[];
  onAddAttendance: (record: Omit<AbsenteeRecord, 'id'>) => void;
  onDeleteAttendance: (id: number) => void;
  currentUserRole: Role | null;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  classList,
  attendance,
  onAddAttendance,
  onDeleteAttendance
}) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [targetClass, setTargetClass] = useState(classList[0]);
  const [studentName, setStudentName] = useState('');
  const [gender, setGender] = useState('ወ');
  const [reason, setReason] = useState('ሕመም / አልመጣም');

  const filteredAttendance = attendance.filter((rec) => {
    const matchesDate = rec.date === selectedDate;
    const matchesClass = selectedClassFilter === 'all' || rec.className === selectedClassFilter;
    return matchesDate && matchesClass;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert('እባክዎን የቀረውን ተማሪ ስም ያስገቡ!');
      return;
    }
    onAddAttendance({
      date: selectedDate,
      className: targetClass,
      studentName: studentName.trim(),
      gender,
      reason: reason.trim() || 'ያልታወቀ ምክንያት'
    });
    setStudentName('');
    setReason('ሕመም / አልመጣም');
    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    let csv = '\uFEFFቀን,ክፍል,የተማሪው ስም,ፆታ,የቀረበት ምክንያት\n';
    filteredAttendance.forEach((r) => {
      csv += `"${r.date}","${r.className}","${r.studentName}","${r.gender}","${r.reason}"\n`;
    });
    downloadCSV(csv, `የቀሪዎች_ሪፖርት_${selectedDate}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-semibold text-slate-600">ቀን፦</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-semibold text-slate-600">ክፍል፦</label>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">ሁሉም ክፍሎች ({classList.length})</option>
                {classList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <UserX className="w-3.5 h-3.5" />
              + የቀረ ተማሪ መዝግብ
            </button>

            <button
              onClick={() => window.print()}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              ማተሚያ
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Excel / CSV
            </button>
          </div>
        </div>

        {/* Count notification */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            በተመረጠው ቀን <strong className="text-slate-800">{selectedDate}</strong> የቀሩ ተማሪዎች ብዛት፦{' '}
            <strong className="text-rose-600 font-bold">{filteredAttendance.length}</strong>
          </span>
        </div>
      </div>

      {/* Absentee Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-center">
                <th className="py-3 px-3 border-r border-slate-200 w-12">ተ.ቁ</th>
                <th className="py-3 px-3 border-r border-slate-200 w-28">ቀን</th>
                <th className="py-3 px-3 border-r border-slate-200 w-36">ክፍል</th>
                <th className="py-3 px-4 border-r border-slate-200 text-left">የተማሪው ስም</th>
                <th className="py-3 px-3 border-r border-slate-200 w-16">ፆታ</th>
                <th className="py-3 px-4 border-r border-slate-200 text-left">የቀረበት ምክንያት</th>
                <th className="py-3 px-3 print:hidden w-16">ተግባር</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-center">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    በዚህ ቀን የቀረ ተማሪ አልተመዘገበም።
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-500 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                      {rec.date}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-semibold text-blue-900">
                      {rec.className}
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-left font-bold text-slate-900">
                      {rec.studentName}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <span
                        className={`font-semibold ${
                          rec.gender === 'ወ' ? 'text-blue-600' : 'text-rose-600'
                        }`}
                      >
                        {rec.gender}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-left text-slate-700">
                      {rec.reason}
                    </td>
                    <td className="py-2.5 px-3 print:hidden">
                      <button
                        onClick={() => {
                          if (confirm(`${rec.studentName} የቀረበትን መዝገብ መሰረዝ ይፈልጋሉ?`)) {
                            onDeleteAttendance(rec.id);
                          }
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition"
                        title="መዝገብ ሰርዝ"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Absentee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">የቀረ ተማሪ መዝግብ</h3>
            <p className="text-xs text-slate-500 mb-4">የቀን: {selectedDate}</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ክፍል፦
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
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
                  የተማሪው ስም፦
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="የተማሪውን ስም ያስገቡ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ፆታ፦
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="ወ">ወንድ (ወ)</option>
                  <option value="ሴ">ሴት (ሴ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  የቀረበት ምክንያት፦
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="ምሳሌ፡ ሕመም፣ ጉዞ፣ ወዘተ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  className="px-4 py-2 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow"
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
