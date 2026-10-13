import React, { useState } from 'react';
import { UserPlus, Printer, Download, Search, Trash2, Award, UserCheck } from 'lucide-react';
import { Student, Teacher, Role } from '../types';
import { downloadCSV } from '../utils/csv';

interface ClassesTabProps {
  currentYear: string;
  classList: string[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  teachers: Teacher[];
  students: Student[];
  onUpdateStudent: (student: Student) => void;
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onDeleteStudent: (studentId: number) => void;
  currentUserRole: Role | null;
  loggedInTeacher: Teacher | null;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  currentYear,
  classList,
  selectedClass,
  onSelectClass,
  teachers,
  students,
  onUpdateStudent,
  onAddStudent,
  onDeleteStudent,
  currentUserRole,
  loggedInTeacher
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAge, setNewStudentAge] = useState('7');
  const [newStudentGender, setNewStudentGender] = useState('ወ');

  const assignedTeacher = teachers.find((t) => t.assignedClass === selectedClass);
  const canEdit =
    currentUserRole === 'admin' ||
    (currentUserRole === 'teacher' && loggedInTeacher?.assignedClass === selectedClass);

  // Compute calculated totals and rankings
  const calculatedStudents = students.map((s) => {
    const total =
      (Number(s.m1) || 0) +
      (Number(s.m2) || 0) +
      (Number(s.m3) || 0) +
      (Number(s.m4) || 0) +
      (Number(s.m5) || 0) +
      (Number(s.m6) || 0) +
      (Number(s.m7) || 0);
    return { ...s, total };
  });

  const sortedTotals = [...calculatedStudents].sort((a, b) => (b.total || 0) - (a.total || 0));
  const rankedStudents = calculatedStudents.map((s) => {
    const rank = sortedTotals.findIndex((item) => item.total === s.total) + 1;
    return { ...s, rank };
  });

  const filteredStudents = rankedStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalCount = rankedStudents.length;
  const maleCount = rankedStudents.filter((s) => s.gender === 'ወ').length;
  const femaleCount = rankedStudents.filter((s) => s.gender === 'ሴ').length;
  const avgScore =
    totalCount > 0
      ? (rankedStudents.reduce((sum, s) => sum + (s.total || 0), 0) / totalCount).toFixed(1)
      : '0';
  const highestScore =
    totalCount > 0 ? Math.max(...rankedStudents.map((s) => s.total || 0)) : 0;

  const handleScoreChange = (
    student: Student,
    field: 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'm7',
    val: string,
    maxVal: number
  ) => {
    let num = parseFloat(val) || 0;
    if (num < 0) num = 0;
    if (num > maxVal) {
      alert(`ከፍተኛው ነጥብ ${maxVal} መሆን አለበት!`);
      num = maxVal;
    }
    onUpdateStudent({
      ...student,
      [field]: num
    });
  };

  const handleInfoChange = (
    student: Student,
    field: 'name' | 'age' | 'gender',
    val: string
  ) => {
    onUpdateStudent({
      ...student,
      [field]: val
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      alert('እባክዎ የተማሪውን ሙሉ ስም ያስገቡ!');
      return;
    }
    onAddStudent({
      name: newStudentName.trim(),
      age: newStudentAge.trim() || '7',
      gender: newStudentGender,
      m1: 0,
      m2: 0,
      m3: 0,
      m4: 0,
      m5: 0,
      m6: 0,
      m7: 0
    });
    setNewStudentName('');
    setNewStudentAge('7');
    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    let csv =
      '\uFEFFተ.ቁ,የተማሪው ስም,ዕድሜ,ፆታ,ምዘና 1 (10),ምዘና 2 (10),ምዘና 3 (10),ምዘና 4 (20),ምዘና 5 (10),ምዘና 6 (10),ምዘና 7 (30),አጠቃላይ ድምር (100),ደረጃ\n';
    rankedStudents.forEach((s, idx) => {
      csv += `${idx + 1},"${s.name}",${s.age},${s.gender},${s.m1},${s.m2},${s.m3},${s.m4},${s.m5},${s.m6},${s.m7},${s.total},${s.rank}\n`;
    });
    downloadCSV(csv, `${selectedClass}_የውጤት_መዝገብ_${currentYear}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Printable Sheet Header */}
      <div className="hidden print:block text-center pb-4 mb-4 border-b border-slate-300">
        <h1 className="text-xl font-bold">የብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን</h1>
        <h2 className="text-base font-semibold">የልጆች አገልግሎት ዘርፍ የውጤት መዝገብ</h2>
        <div className="flex justify-between text-xs mt-2 font-medium">
          <span>ክፍል፦ {selectedClass}</span>
          <span>የትምህርት ዘመን፦ {currentYear} ዓ/ም</span>
          <span>መምህር፦ {assignedTeacher ? assignedTeacher.name : 'ልዩ አልተመደበም'}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm print:hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                ክፍል ይምረጡ፦
              </label>
              <select
                value={selectedClass}
                onChange={(e) => onSelectClass(e.target.value)}
                disabled={currentUserRole === 'teacher'}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:opacity-80"
              >
                {classList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                የክፍሉ መምህር፦ {assignedTeacher ? assignedTeacher.name : 'ልዩ አልተመደበም'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="በተማሪ ስም ፈልግ..."
                className="pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-48"
              />
            </div>

            {(canEdit || currentUserRole === 'leader') && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + አዲስ ተማሪ አስገባ
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              ማተሚያ (Print)
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

        {/* Quick summary stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 block">ጠቅላላ ተማሪዎች</span>
            <span className="text-lg font-bold text-slate-800">{totalCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-[11px] text-blue-600 block">ወንድ ተማሪዎች</span>
            <span className="text-lg font-bold text-blue-800">{maleCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
            <span className="text-[11px] text-rose-600 block">ሴት ተማሪዎች</span>
            <span className="text-lg font-bold text-rose-800">{femaleCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[11px] text-emerald-600 block">አማካይ ውጤት</span>
            <span className="text-lg font-bold text-emerald-800">{avgScore}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-amber-600 block">ከፍተኛ ውጤት</span>
            <span className="text-lg font-bold text-amber-800">{highestScore} / 100</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-center">
                <th className="py-3 px-2 border-r border-slate-200">ተ.ቁ</th>
                <th className="py-3 px-3 border-r border-slate-200 min-w-[150px] text-left">
                  የተማሪው ሙሉ ስም
                </th>
                <th className="py-3 px-2 border-r border-slate-200 w-14">ዕድሜ</th>
                <th className="py-3 px-2 border-r border-slate-200 w-12">ፆታ</th>
                <th className="py-3 px-2 border-r border-slate-200 w-16 bg-blue-50/40">ምዘና 1 (10)</th>
                <th className="py-3 px-2 border-r border-slate-200 w-16 bg-blue-50/40">ምዘና 2 (10)</th>
                <th className="py-3 px-2 border-r border-slate-200 w-16 bg-blue-50/40">ምዘና 3 (10)</th>
                <th className="py-3 px-2 border-r border-slate-200 w-16 bg-indigo-50/40">ምዘና 4 (20)</th>
                <th className="py-3 px-2 border-r border-slate-200 w-16 bg-blue-50/40">ምዘና 5 (10)</th>
                <th className="py-3 px-2 border-r border-slate-200 w-16 bg-blue-50/40">ምዘና 6 (10)</th>
                <th className="py-3 px-2 border-r border-slate-200 w-16 bg-amber-50/40">ምዘና 7 (30)</th>
                <th className="py-3 px-2 border-r border-slate-200 w-20 bg-slate-200 font-extrabold text-slate-900">
                  ድምር (100)
                </th>
                <th className="py-3 px-2 border-r border-slate-200 w-16">ደረጃ</th>
                {currentUserRole !== 'leader' && (
                  <th className="py-3 px-2 print:hidden w-16" id="actionHeaderTh">
                    ተግባር
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-center">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-10 text-center text-slate-400">
                    ምንም ተማሪ አልተገኘም። አዲስ ተማሪ ለማስገባት "+ አዲስ ተማሪ" የሚለውን ይጫኑ።
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, index) => {
                  const isTopThree = (s.rank || 0) <= 3;
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isTopThree ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-2 border-r border-slate-200 font-medium text-slate-500">
                        {index + 1}
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-left font-semibold text-slate-900">
                        {canEdit ? (
                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) => handleInfoChange(s, 'name', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white px-1 py-0.5 rounded text-xs outline-none"
                          />
                        ) : (
                          <span>{s.name}</span>
                        )}
                      </td>

                      {/* Age */}
                      <td className="py-2.5 px-1 border-r border-slate-200">
                        {canEdit ? (
                          <input
                            type="text"
                            value={s.age}
                            onChange={(e) => handleInfoChange(s, 'age', e.target.value)}
                            className="w-10 text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white px-1 py-0.5 rounded text-xs outline-none"
                          />
                        ) : (
                          <span>{s.age}</span>
                        )}
                      </td>

                      {/* Gender */}
                      <td className="py-2.5 px-1 border-r border-slate-200">
                        {canEdit ? (
                          <select
                            value={s.gender}
                            onChange={(e) => handleInfoChange(s, 'gender', e.target.value)}
                            className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 rounded px-1 py-0.5 text-xs outline-none"
                          >
                            <option value="ወ">ወ</option>
                            <option value="ሴ">ሴ</option>
                          </select>
                        ) : (
                          <span
                            className={`font-semibold ${
                              s.gender === 'ወ' ? 'text-blue-600' : 'text-rose-600'
                            }`}
                          >
                            {s.gender}
                          </span>
                        )}
                      </td>

                      {/* Assessments 1 - 7 */}
                      <td className="py-2 px-1 border-r border-slate-200 bg-blue-50/20">
                        <input
                          type="number"
                          value={s.m1}
                          disabled={!canEdit}
                          onChange={(e) => handleScoreChange(s, 'm1', e.target.value, 10)}
                          className="w-12 text-center py-1 rounded border border-slate-200 focus:border-blue-600 focus:bg-white disabled:bg-transparent disabled:border-transparent font-medium"
                          min="0"
                          max="10"
                        />
                      </td>

                      <td className="py-2 px-1 border-r border-slate-200 bg-blue-50/20">
                        <input
                          type="number"
                          value={s.m2}
                          disabled={!canEdit}
                          onChange={(e) => handleScoreChange(s, 'm2', e.target.value, 10)}
                          className="w-12 text-center py-1 rounded border border-slate-200 focus:border-blue-600 focus:bg-white disabled:bg-transparent disabled:border-transparent font-medium"
                          min="0"
                          max="10"
                        />
                      </td>

                      <td className="py-2 px-1 border-r border-slate-200 bg-blue-50/20">
                        <input
                          type="number"
                          value={s.m3}
                          disabled={!canEdit}
                          onChange={(e) => handleScoreChange(s, 'm3', e.target.value, 10)}
                          className="w-12 text-center py-1 rounded border border-slate-200 focus:border-blue-600 focus:bg-white disabled:bg-transparent disabled:border-transparent font-medium"
                          min="0"
                          max="10"
                        />
                      </td>

                      <td className="py-2 px-1 border-r border-slate-200 bg-indigo-50/20">
                        <input
                          type="number"
                          value={s.m4}
                          disabled={!canEdit}
                          onChange={(e) => handleScoreChange(s, 'm4', e.target.value, 20)}
                          className="w-12 text-center py-1 rounded border border-slate-200 focus:border-indigo-600 focus:bg-white disabled:bg-transparent disabled:border-transparent font-medium"
                          min="0"
                          max="20"
                        />
                      </td>

                      <td className="py-2 px-1 border-r border-slate-200 bg-blue-50/20">
                        <input
                          type="number"
                          value={s.m5}
                          disabled={!canEdit}
                          onChange={(e) => handleScoreChange(s, 'm5', e.target.value, 10)}
                          className="w-12 text-center py-1 rounded border border-slate-200 focus:border-blue-600 focus:bg-white disabled:bg-transparent disabled:border-transparent font-medium"
                          min="0"
                          max="10"
                        />
                      </td>

                      <td className="py-2 px-1 border-r border-slate-200 bg-blue-50/20">
                        <input
                          type="number"
                          value={s.m6}
                          disabled={!canEdit}
                          onChange={(e) => handleScoreChange(s, 'm6', e.target.value, 10)}
                          className="w-12 text-center py-1 rounded border border-slate-200 focus:border-blue-600 focus:bg-white disabled:bg-transparent disabled:border-transparent font-medium"
                          min="0"
                          max="10"
                        />
                      </td>

                      <td className="py-2 px-1 border-r border-slate-200 bg-amber-50/20">
                        <input
                          type="number"
                          value={s.m7}
                          disabled={!canEdit}
                          onChange={(e) => handleScoreChange(s, 'm7', e.target.value, 30)}
                          className="w-12 text-center py-1 rounded border border-slate-200 focus:border-amber-600 focus:bg-white disabled:bg-transparent disabled:border-transparent font-medium"
                          min="0"
                          max="30"
                        />
                      </td>

                      {/* Total */}
                      <td className="py-2.5 px-2 border-r border-slate-200 font-extrabold text-sm text-slate-900 bg-slate-100/60">
                        {s.total}
                      </td>

                      {/* Rank */}
                      <td className="py-2.5 px-2 border-r border-slate-200">
                        {isTopThree ? (
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-xs ${
                              s.rank === 1
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : s.rank === 2
                                ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                : 'bg-orange-100 text-orange-800 border border-orange-300'
                            }`}
                          >
                            <Award className="w-3 h-3" />
                            {s.rank}ኛ
                          </span>
                        ) : (
                          <span className="text-slate-600 font-medium">{s.rank}ኛ</span>
                        )}
                      </td>

                      {/* Action */}
                      {currentUserRole !== 'leader' && (
                        <td className="py-2.5 px-2 print:hidden">
                          {canEdit ? (
                            <button
                              onClick={() => {
                                if (confirm(`${s.name} የተባለውን ተማሪ መሰረዝ ይፈልጋሉ?`)) {
                                  onDeleteStudent(s.id);
                                }
                              }}
                              className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition"
                              title="ተማሪ ሰርዝ"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Signature Section */}
      <div className="hidden print:flex justify-between pt-10 text-xs font-semibold text-slate-800">
        <div>
          <p>የክፍሉ መምህር ስም፦ _______________________</p>
          <p className="mt-2">ፊርማ፦ _________________ ቀን፦ ___________</p>
        </div>
        <div>
          <p>የሰንበት ት/ቤት አስተባባሪ፦ ___________________</p>
          <p className="mt-2">ፊርማ፦ _________________ ቀን፦ ___________</p>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">አዲስ ተማሪ መዝግብ</h3>
            <p className="text-xs text-slate-500 mb-4">ክፍል፦ {selectedClass}</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  የተማሪው ሙሉ ስም፦
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="የተማሪውን ሙሉ ስም ያስገቡ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ዕድሜ፦
                  </label>
                  <input
                    type="number"
                    value={newStudentAge}
                    onChange={(e) => setNewStudentAge(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    min="1"
                    max="25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ፆታ፦
                  </label>
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="ወ">ወንድ (ወ)</option>
                    <option value="ሴ">ሴት (ሴ)</option>
                  </select>
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
                  className="px-4 py-2 text-xs bg-blue-800 hover:bg-blue-700 text-white rounded-xl font-semibold shadow"
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
