import React, { useState, useEffect } from 'react';
import { Plus, Activity, List, Dumbbell, Trash2, CheckCircle2 } from 'lucide-react';

type SetType = 'Single set' | 'Superset' | 'Triset';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restTime: string;
  setType: SetType;
}

interface SetLog {
  weight: string;
  reps: string;
}

interface WorkoutLog {
  id: string;
  date: string;
  exerciseId: string;
  sets: SetLog[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'creator' | 'logger'>('creator');
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<Record<string, WorkoutLog[]>>({});
  
  const [exName, setExName] = useState('');
  const [exSets, setExSets] = useState('');
  const [exReps, setExReps] = useState('');
  const [exRest, setExRest] = useState('');
  const [exType, setExType] = useState<SetType>('Single set');

  const [sessionData, setSessionData] = useState<Record<string, SetLog[]>>({});

  // Load data
  useEffect(() => {
    const savedExercises = localStorage.getItem('fit_exercises');
    const savedLogs = localStorage.getItem('fit_logs');
    const savedSession = localStorage.getItem('fit_session');
    
    if (savedExercises) try { setExercises(JSON.parse(savedExercises)); } catch (e) {}
    if (savedLogs) try { setLogs(JSON.parse(savedLogs)); } catch (e) {}
    if (savedSession) try { setSessionData(JSON.parse(savedSession)); } catch (e) {}
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('fit_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('fit_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('fit_session', JSON.stringify(sessionData));
  }, [sessionData]);

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName || !exSets || !exReps) return;
    
    const newEx: Exercise = {
      id: crypto.randomUUID(),
      name: exName,
      sets: parseInt(exSets, 10),
      reps: exReps,
      restTime: exRest,
      setType: exType
    };
    
    setExercises([...exercises, newEx]);
    setExName('');
    setExSets('');
    setExReps('');
    setExRest('');
    setExType('Single set');
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
    // Also clean up session data for this exercise
    setSessionData(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleInputChange = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setSessionData(prev => {
      const exData = prev[exerciseId] ? [...prev[exerciseId]] : [];
      while (exData.length <= setIndex) {
        exData.push({ weight: '', reps: '' });
      }
      exData[setIndex] = { ...exData[setIndex], [field]: value };
      return { ...prev, [exerciseId]: exData };
    });
  };

  const handleFinishWorkout = () => {
    if (Object.keys(sessionData).length === 0) {
      alert('No data to save!');
      return;
    }

    const date = new Date().toISOString();
    const newLogs = { ...logs };
    
    Object.keys(sessionData).forEach(exId => {
      if (!newLogs[exId]) newLogs[exId] = [];
      newLogs[exId].push({
        id: crypto.randomUUID(),
        date,
        exerciseId: exId,
        sets: sessionData[exId]
      });
    });
    
    setLogs(newLogs);
    setSessionData({});
    alert('Workout saved successfully!');
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-24">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-bold flex items-center gap-2 tracking-tight">
            <Activity className="w-5 h-5 text-emerald-600" />
            FitTrack
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {activeTab === 'creator' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <section>
              <h2 className="text-xl font-bold mb-4 tracking-tight">Workout Creator</h2>
              <form onSubmit={handleAddExercise} className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Exercise Name</label>
                  <input 
                    type="text" 
                    required
                    value={exName}
                    onChange={e => setExName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Sets</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={exSets}
                      onChange={e => setExSets(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Reps</label>
                    <input 
                      type="text" 
                      required
                      value={exReps}
                      onChange={e => setExReps(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Rest Time</label>
                    <input 
                      type="text" 
                      value={exRest}
                      onChange={e => setExRest(e.target.value)}
                      placeholder="e.g. 60s"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Set Type</label>
                    <select 
                      value={exType}
                      onChange={e => setExType(e.target.value as SetType)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                    >
                      <option>Single set</option>
                      <option>Superset</option>
                      <option>Triset</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 shadow-sm">
                  <Plus className="w-5 h-5" />
                  Add Exercise
                </button>
              </form>
            </section>

            {exercises.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wider">Your Routine</h3>
                <div className="space-y-3">
                  {exercises.map((ex) => (
                    <div key={ex.id} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex justify-between items-center group">
                      <div>
                        <h4 className="font-semibold text-zinc-900">{ex.name}</h4>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">
                          {ex.sets} sets × {ex.reps} reps • {ex.setType} {ex.restTime && `• ${ex.restTime} rest`}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDeleteExercise(ex.id)}
                        className="text-zinc-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'logger' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Workout Logger</h2>
              {exercises.length > 0 && (
                <button 
                  onClick={handleFinishWorkout}
                  className="text-sm bg-zinc-900 text-white px-5 py-2 rounded-full font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finish
                </button>
              )}
            </div>

            {exercises.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                <p className="font-medium text-zinc-900">No exercises yet</p>
                <p className="text-sm mt-1">Go to the Creator tab to add some.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {exercises.map((ex) => {
                  const exData = sessionData[ex.id] || [];
                  
                  return (
                    <div key={ex.id} className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100">
                      <div className="mb-5">
                        <h3 className="font-bold text-zinc-900 text-lg">{ex.name}</h3>
                        <p className="text-xs font-medium text-zinc-500 mt-0.5">Target: {ex.sets} sets × {ex.reps} reps</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-[auto_1fr_1fr] gap-3 px-1">
                          <div className="text-[10px] font-bold text-zinc-400 w-8 text-center uppercase tracking-wider">Set</div>
                          <div className="text-[10px] font-bold text-zinc-400 text-center uppercase tracking-wider">Weight</div>
                          <div className="text-[10px] font-bold text-zinc-400 text-center uppercase tracking-wider">Reps</div>
                        </div>
                        
                        {Array.from({ length: ex.sets }).map((_, i) => (
                          <div key={i} className="grid grid-cols-[auto_1fr_1fr] gap-3 items-center">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600">
                              {i + 1}
                            </div>
                            <input 
                              type="number" 
                              placeholder="0"
                              value={exData[i]?.weight || ''}
                              onChange={e => handleInputChange(ex.id, i, 'weight', e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                            <input 
                              type="number" 
                              placeholder="0"
                              value={exData[i]?.reps || ''}
                              onChange={e => handleInputChange(ex.id, i, 'reps', e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-20">
        <div className="max-w-md mx-auto flex">
          <button 
            onClick={() => setActiveTab('creator')}
            className={`flex-1 py-3.5 flex flex-col items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'creator' ? 'text-emerald-600' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <List className="w-5 h-5" />
            Creator
          </button>
          <button 
            onClick={() => setActiveTab('logger')}
            className={`flex-1 py-3.5 flex flex-col items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'logger' ? 'text-emerald-600' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            <Dumbbell className="w-5 h-5" />
            Logger
          </button>
        </div>
      </nav>
    </div>
  );
}
