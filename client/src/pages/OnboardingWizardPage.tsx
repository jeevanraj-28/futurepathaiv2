import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Award,
  IndianRupee,
  Sparkles,
  Loader2
} from 'lucide-react';

export const OnboardingWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [currentClass, setCurrentClass] = useState('CLASS_10');
  const [board, setBoard] = useState('CBSE');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('Pune');
  const [scoreRange, setScoreRange] = useState('85-92%');
  const [favouriteSubjects, setFavouriteSubjects] = useState<string[]>(['Mathematics', 'Science']);
  const [difficultSubjects, setDifficultSubjects] = useState<string[]>(['Hindi']);
  const [skills, setSkills] = useState<string[]>(['Logical Reasoning', 'Python Basics']);
  const [hobbies, setHobbies] = useState<string[]>(['Robotics Club', 'Reading Tech']);
  const [budgetRange, setBudgetRange] = useState('5-10 Lakhs');
  const [careerExpectations, setCareerExpectations] = useState('Aspiring to work in tech, research or space engineering.');

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Economics', 'Accountancy', 'Business Studies', 'English', 'History',
    'Political Science', 'Psychology', 'Geography', 'Hindi', 'Physical Education'
  ];

  const skillOptions = [
    'Coding / Algorithms', 'Mathematical Proofs', 'Creative Writing',
    'Public Speaking', '3D Sketching & CAD', 'Robotics Hardware',
    'Scientific Laboratory Inquiry', 'Financial Bookkeeping', 'Debating'
  ];

  const toggleFav = (sub: string) => {
    if (favouriteSubjects.includes(sub)) {
      setFavouriteSubjects(favouriteSubjects.filter(s => s !== sub));
    } else {
      setFavouriteSubjects([...favouriteSubjects, sub]);
    }
  };

  const toggleSkill = (sk: string) => {
    if (skills.includes(sk)) {
      setSkills(skills.filter(s => s !== sk));
    } else {
      setSkills([...skills, sk]);
    }
  };

  const handleSaveAndFinish = async () => {
    setLoading(true);
    try {
      await ApiService.updateStudentProfile({
        currentClass,
        board,
        state,
        city,
        scoreRange,
        favouriteSubjects,
        difficultSubjects,
        skills,
        hobbies,
        budgetRange,
        careerExpectations
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Progress Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Student Onboarding Wizard</span>
            <span className="font-bold text-cyan-400">Step {step} of 3</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-cyan-400 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Academic Stage */}
        {step === 1 && (
          <div className="p-8 rounded-2xl glass-panel bg-slate-900 border border-slate-800 space-y-6 animate-fade-in shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Your Academic Milestones</h2>
              <p className="text-xs text-slate-400">Tell us where you are in your school curriculum.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-2">Current Class:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentClass('CLASS_10')}
                    className={`p-4 rounded-xl border text-center font-bold text-sm transition-all ${
                      currentClass === 'CLASS_10'
                        ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Class 10 (Secondary)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentClass('CLASS_12')}
                    className={`p-4 rounded-xl border text-center font-bold text-sm transition-all ${
                      currentClass === 'CLASS_12'
                        ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Class 12 (Senior Secondary)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Education Board:</label>
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                  >
                    <option value="CBSE">CBSE (Central Board)</option>
                    <option value="CISCE">CISCE / ICSE / ISC</option>
                    <option value="STATE_BOARD">State Board</option>
                    <option value="IB">International Baccalaureate (IB)</option>
                    <option value="CAMBRIDGE">Cambridge IGCSE</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Score Range:</label>
                  <select
                    value={scoreRange}
                    onChange={(e) => setScoreRange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                  >
                    <option value="90%+">Above 90% (Outstanding)</option>
                    <option value="80-90%">80% – 90% (Strong)</option>
                    <option value="70-80%">70% – 80% (Moderate)</option>
                    <option value="60-70%">60% – 70%</option>
                    <option value="<60%">Below 60%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">State:</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">City:</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <span>Continue to Subject Interests</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Favourite Subjects & Skills */}
        {step === 2 && (
          <div className="p-8 rounded-2xl glass-panel bg-slate-900 border border-slate-800 space-y-6 animate-fade-in shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Subjects & Natural Aptitudes</h2>
              <p className="text-xs text-slate-400">Select subjects you genuinely enjoy studying.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-2">Favourite Subjects (Select multiple):</label>
                <div className="flex flex-wrap gap-2">
                  {subjectOptions.map(sub => {
                    const active = favouriteSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleFav(sub)}
                        className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                          active
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-2">Skills You Enjoy Exercising:</label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map(sk => {
                    const active = skills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleSkill(sk)}
                        className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                          active
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {sk}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <span>Continue to Career Expectations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Aspirations & Education Budget */}
        {step === 3 && (
          <div className="p-8 rounded-2xl glass-panel bg-slate-900 border border-slate-800 space-y-6 animate-fade-in shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Aspirations & Practical Context</h2>
              <p className="text-xs text-slate-400">Helps recommend realistic pathways and scholarship options.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Higher Education Budget Range:</label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                >
                  <option value="< 2 Lakhs">Below ₹2 Lakhs (Targeting Govt IIT/NIT/AIIMS + Scholarships)</option>
                  <option value="2-5 Lakhs">₹2 – ₹5 Lakhs (Moderate Budget)</option>
                  <option value="5-10 Lakhs">₹5 – ₹10 Lakhs (Accredited State & Central Universities)</option>
                  <option value="10-25 Lakhs">₹10 – ₹25 Lakhs (Premier Private Universities / BITS / Manipal)</option>
                  <option value="25+ Lakhs">₹25+ Lakhs (Private / International Mobility)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Your Career Expectations in 1 Sentence:</label>
                <textarea
                  rows={3}
                  value={careerExpectations}
                  onChange={(e) => setCareerExpectations(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={handleSaveAndFinish}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg glow-blue transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Save Profile & Launch Dashboard</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
