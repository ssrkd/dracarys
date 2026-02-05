import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus, Trash2, CheckCircle2,
    Brain, Sparkles, Zap, Target, Filter,
    Flame, ArrowUpRight,
    ArrowDownRight, Activity, Book, Database, Watch,
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Circle, AlertCircle, Timer
} from 'lucide-react';
import { focalService } from '../services/focalService';
import { focalAiService } from '../services/focalAiService';
import { healthService } from '../services/healthService';
import { useToastStore } from '../store/toastStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { KPICard } from '../components/focal/KPICard';
import { ProgressCard } from '../components/focal/ProgressCard';
import { InsightCard } from '../components/focal/InsightCard';
import type { FocalPlan, FocalDiary, FocalGoal, FocalHabit, FocalBrainNote } from '../types/database';

type FocalTab = 'planner' | 'habits' | 'journal' | 'goals' | 'ai' | 'brain';

export const AdminFocal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FocalTab>('planner');
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [timerRemaining, setTimerRemaining] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // UI State
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'plan' | 'journal' | 'goal' | 'habit' | 'brain' } | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Data State (Personal Only)
    const [plans, setPlans] = useState<FocalPlan[]>([]);
    const [habits, setHabits] = useState<FocalHabit[]>([]);
    const [journalEntries, setJournalEntries] = useState<FocalDiary[]>([]);
    const [goals, setGoals] = useState<FocalGoal[]>([]);
    const [brainNotes, setBrainNotes] = useState<FocalBrainNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dbError, setDbError] = useState<string | null>(null);

    // AI State
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiInsight, setAiInsight] = useState<any>(null);
    const [morningBrief, setMorningBrief] = useState<string | null>(null);
    const [isBriefLoading, setIsBriefLoading] = useState(false);

    // Modal States
    const [activeModal, setActiveModal] = useState<'plan' | 'journal' | 'goal' | 'habit' | 'brain' | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [celebratingId, setCelebratingId] = useState<string | null>(null);

    const { addToast } = useToastStore();

    // Memoized sorted/filtered data
    const sortedJournal = useMemo(() => {
        return [...journalEntries].sort((a, b) => {
            const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            // Secondary sort by creation time for entries on the same day
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [journalEntries]);


    const filteredPlans = useMemo(() => {
        if (filterCategory === 'All') return plans;
        return plans.filter(p => p.category === filterCategory);
    }, [plans, filterCategory]);

    const kpiMetrics = useMemo(() => {
        const total = plans.length;
        const completed = plans.filter(p => p.is_completed).length;
        const avgMood = journalEntries.length ? Math.round(journalEntries.reduce((acc, curr) => acc + curr.mood, 0) / journalEntries.length * 10) / 10 : 0;
        const avgEnergy = journalEntries.length ? Math.round(journalEntries.reduce((acc, curr) => acc + curr.energy_level, 0) / journalEntries.length * 10) / 10 : 0;

        const latestGoal = goals[0];
        const goalProgress = latestGoal ? Math.round((latestGoal.current_value / latestGoal.target_value) * 100) : 0;

        return {
            taskCompletion: total ? Math.round((completed / total) * 100) : 0,
            avgMood,
            avgEnergy,
            goalProgress
        };
    }, [plans, journalEntries, goals]);

    const getDaysForCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let firstDayIndex = firstDay.getDay(); // 0 is Sunday
        firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon=0, Sun=6

        const days = [];
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        for (let i = firstDayIndex; i > 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i + 1),
                isCurrentMonth: false
            });
        }
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }
        const remaining = 42 - days.length; // Show 6 weeks for consistency
        for (let i = 1; i <= remaining; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }
        return days;
    };

    useEffect(() => {
        let interval: any;
        if (isTimerRunning && timerRemaining > 0) {
            interval = setInterval(() => {
                setTimerRemaining((prev) => prev - 1);
            }, 1000);
        } else if (timerRemaining === 0) {
            setIsTimerRunning(false);
            addToast('success', 'Время фокуса вышло! Пора отдохнуть. ☕️');
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timerRemaining, addToast]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setDbError(null);
        try {
            const [p, j, g, h, b] = await Promise.all([
                focalService.getPlans(),
                focalService.getDiaryEntries(),
                focalService.getGoals(),
                focalService.getHabits(),
                focalService.getBrainNotes()
            ]);
            setPlans(p || []);
            setJournalEntries(j || []);
            setGoals(g || []);
            setHabits(h || []);
            setBrainNotes(b || []);

            // Check for morning brief if not loaded this session
            if (!morningBrief) {
                generateMorningBrief(p, j);
            }
        } catch (error: any) {
            console.error('Error loading FoCal data:', error);
            if (error.message?.includes('relation "focal_core" does not exist')) {
                setDbError('DATABASE_MIGRATION_REQUIRED');
            } else {
                addToast('error', 'Ошибка синхронизации личных данных');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const generateMorningBrief = async (p: FocalPlan[], j: FocalDiary[]) => {
        setIsBriefLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const todayPlans = p.filter(plan => plan.start_date.includes(today));
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const ydayStr = yesterday.toISOString().split('T')[0];
            const yesterdayDiary = j.find(d => d.date === ydayStr);

            const currentTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            const brief = await focalAiService.getMorningBrief({ todayPlans, yesterdayDiary, currentTime });
            setMorningBrief(brief);
        } catch (error) {
            console.error('Morning Brief Error:', error);
        } finally {
            setIsBriefLoading(false);
        }
    };

    const handleToggleHabit = async (id: string, completed: boolean) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await focalService.toggleHabit(id, today, completed);
            loadData();
            addToast('success', completed ? 'Привычка выполнена!' : 'Привычка отменена');
        } catch (error) {
            addToast('error', 'Ошибка обновления привычки');
        }
    };

    const handleSaveHabit = async (title: string) => {
        try {
            await focalService.createHabit(title);
            loadData();
            setActiveModal(null);
            addToast('success', 'Новая привычка добавлена');
        } catch (error) {
            addToast('error', 'Ошибка создания привычки');
        }
    };

    const handleSaveBrainNote = async (noteData: any) => {
        try {
            await focalService.createBrainNote({
                title: noteData.title || 'Новое прозрение',
                content: noteData.content || '',
                category: noteData.category || 'Strategy',
                tags: []
            });
            loadData();
            setActiveModal(null);
            addToast('success', 'Идея сохранена в базе знаний');
        } catch (error) {
            addToast('error', 'Ошибка сохранения в базу знаний');
        }
    };

    const [isHealthSyncing, setIsHealthSyncing] = useState(false);

    const handleSyncHealth = async () => {
        if (!healthService.isAvailable()) {
            addToast('info', 'Синхронизация доступна только в iOS приложении');
            return;
        }

        setIsHealthSyncing(true);
        try {
            const hours = await healthService.syncSleepData();
            if (hours !== null) {
                addToast('success', `Данные Apple Health синхронизированы: ${hours} ч. сна`);
                loadData();
            } else {
                addToast('error', 'Не удалось получить данные из Apple Health');
            }
        } catch (e) {
            addToast('error', 'Ошибка доступа к Apple Health');
        } finally {
            setIsHealthSyncing(false);
        }
    };

    const handleTogglePlanCompletion = async (id: string, currentStatus: boolean) => {
        try {
            if (!currentStatus) {
                setCelebratingId(id);
                setTimeout(() => setCelebratingId(null), 1000);
            }
            await focalService.updatePlan(id, { is_completed: !currentStatus });
            loadData();
            addToast('success', !currentStatus ? 'Задача завершена! 🚀' : 'Задача возобновлена');
        } catch (error) {
            addToast('error', 'Ошибка обновления статуса');
        }
    };

    const handleStrategicAnalysis = async () => {
        setIsAiLoading(true);
        try {
            const insight = await focalAiService.analyzeStrategicData({
                plans,
                journal: journalEntries,
                goals
            });
            setAiInsight(insight);
            setActiveTab('ai');
            addToast('success', 'Личный AI анализ завершен');
        } catch (error) {
            console.error('AI Analysis error:', error);
            addToast('error', 'Личный AI временно недоступен');
        } finally {
            setIsAiLoading(false);
        }
    };

    // ... handleSavePlan, handleSaveJournal, handleSaveGoal remain same but removed revenue impact where possible ...
    const handleSavePlan = async (planData: any) => {
        try {
            if (editingItem?.id) {
                await focalService.updatePlan(editingItem.id, planData);
                addToast('success', 'Задача обновлена');
            } else {
                await focalService.createPlan({
                    title: planData.title || 'Без названия',
                    description: planData.description || '',
                    category: planData.category || 'General',
                    priority: planData.priority || 'Medium',
                    revenue_impact: 0,
                    is_completed: false,
                    start_date: planData.start_date || new Date().toISOString(),
                    end_date: null
                });
                addToast('success', 'Задача запланирована');
            }
            loadData();
            setActiveModal(null);
        } catch (error: any) {
            addToast('error', 'Ошибка сохранения');
        }
    };

    const handleSaveJournal = async (journalData: any) => {
        try {
            if (editingItem?.id) {
                await focalService.updateDiaryEntry(editingItem.id, journalData);
                addToast('success', 'Запись обновлена');
            } else {
                await focalService.createDiaryEntry({
                    entry: journalData.entry || '',
                    revenue: Number(journalData.revenue || 0),
                    worked: journalData.worked || '',
                    failed: journalData.failed || '',
                    ideas: journalData.ideas || '',
                    mood: Number(journalData.mood || 5),
                    energy_level: Number(journalData.energy_level || 5),
                    date: journalData.date || new Date().toISOString().split('T')[0]
                });
                addToast('success', 'Запись сохранена');
            }
            loadData();
            setActiveModal(null);
        } catch (error: any) {
            addToast('error', 'Ошибка сохранения записи');
        }
    };

    const handleSaveGoal = async (goalData: any) => {
        try {
            if (editingItem?.id) {
                await focalService.updateGoal(editingItem.id, goalData);
                addToast('success', 'Цель обновлена');
            } else {
                await focalService.createGoal({
                    title: goalData.title || 'Новая цель',
                    target_value: Number(goalData.target_value || 0),
                    current_value: 0,
                    unit: goalData.unit || '₸',
                    type: goalData.type || 'Revenue',
                    period: goalData.period || 'Monthly',
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: null
                });
                addToast('success', 'Личная цель установлена');
            }
            loadData();
            setActiveModal(null);
        } catch (error) {
            addToast('error', 'Ошибка создания цели');
        }
    };

    const handleDeleteItem = async (id: string, _type: string) => {
        try {
            await focalService.deletePlan(id); // Generic delete
            loadData();
            addToast('success', 'Удалено успешно');
            setDeleteConfirm(null);
        } catch (error) {
            addToast('error', 'Ошибка удаления');
        }
    };


    const renderMigrationAlert = () => (
        <div className="max-w-2xl mx-auto mt-20 p-12 glass rounded-apple-3xl border-danger/20 text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-10 h-10 text-danger" />
            </div>
            <div className="space-y-4">
                <h2 className="text-3xl font-bold text-dark tracking-tighter italic">Требуется обновление базы данных</h2>
                <p className="text-gray font-medium leading-relaxed">
                    Для работы **Личного FoCal** необходимо выполнить SQL-запрос в консоли Supabase. Это создаст единую таблицу `focal_core`.
                </p>
            </div>
            <div className="bg-dark/5 p-6 rounded-2xl text-left font-mono text-[10px] text-gray overflow-x-auto select-all">
                {`CREATE TABLE focal_core (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
            </div>
            <Button onClick={loadData} className="variant-danger h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">
                Обновить после SQL-запроса
            </Button>
        </div>
    );

    const renderMorningBrief = () => {
        if (isBriefLoading) return (
            <div className="mb-12 glass p-8 rounded-[2.5rem] border-white animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-light rounded-2xl" />
                    <div className="h-4 w-64 bg-light rounded-full" />
                </div>
            </div>
        );
        if (!morningBrief) return null;
        return (
            <div className="mb-12 animate-in slide-in-from-top duration-700">
                <div className="glass p-8 rounded-[2.5rem] bg-gradient-to-br from-white/80 to-accent/5 border-white shadow-apple-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles className="w-24 h-24 text-accent" />
                    </div>
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="w-14 h-14 bg-dark rounded-2xl flex items-center justify-center shadow-apple rotate-3">
                            <Zap className="w-6 h-6 text-white fill-current" />
                        </div>
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Daily Briefing</span>
                                <div className="h-px w-8 bg-accent/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray">
                                    {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                                </span>
                            </div>
                            <h2 className="text-2xl font-medium text-dark leading-tight tracking-tight italic">
                                "{morningBrief}"
                            </h2>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setMorningBrief(null)}
                            className="ml-auto w-10 h-10 p-0 rounded-full bg-white/50 border-none shadow-soft hover:rotate-90 transition-all"
                        >
                            <Trash2 className="w-4 h-4 opacity-40" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const renderHabits = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        return (
            <div className="space-y-12 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-dark tracking-tighter">Ежедневные Ритуалы</h2>
                        <p className="text-xs text-gray uppercase tracking-widest font-black mt-1">Consistency is the key to mastery</p>
                    </div>
                    <Button onClick={() => setActiveModal('habit')} className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest">
                        <Plus className="w-4 h-4 mr-2" /> Добавить Ритуал
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map(habit => (
                        <div key={habit.id} className="glass p-6 rounded-apple-3xl border-white shadow-soft group hover:shadow-apple-sm transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-1 flex-1 min-w-0 mr-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-dark tracking-tight truncate">{habit.title}</h3>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingItem(habit); setActiveModal('habit'); }} className="p-1.5 hover:bg-light rounded-lg text-gray/40 hover:text-dark transition-all">
                                                <Sparkles className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => setDeleteConfirm({ id: habit.id, type: 'habit' as any })} className="p-1.5 hover:bg-danger/10 rounded-lg text-gray/40 hover:text-danger transition-all">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Flame className={`w-3 h-3 ${habit.streak > 0 ? 'text-danger fill-current' : 'text-gray/20'}`} />
                                        <span className="text-[10px] font-black text-gray uppercase tracking-widest">Серия: {habit.streak} дней</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleHabit(habit.id, !habit.history[todayStr])}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 ${habit.history[todayStr]
                                        ? 'bg-success text-white shadow-apple scale-110'
                                        : 'bg-light text-gray hover:bg-white hover:shadow-soft'
                                        }`}
                                >
                                    <CheckCircle2 className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                                {Array.from({ length: 14 }).map((_, i) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() - (13 - i));
                                    const ds = d.toISOString().split('T')[0];
                                    const isDone = habit.history[ds];
                                    const isToday = ds === todayStr;
                                    return (
                                        <div key={ds} title={ds} className={`flex-shrink-0 w-8 h-8 rounded-lg flex flex-col items-center justify-center text-[7px] font-black transition-all ${isDone ? 'bg-success/20 text-success border border-success/30' :
                                            isToday ? 'bg-accent/10 text-accent border border-dashed border-accent/40' : 'bg-light text-gray/40'
                                            }`}>
                                            {d.getDate()}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {habits.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-light rounded-apple-3xl">
                            <Activity className="w-12 h-12 text-light mx-auto mb-4" />
                            <p className="text-gray font-bold tracking-tight">Создайте свою первую привычку</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderBrain = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-dark tracking-tighter">Second Brain</h2>
                        <p className="text-xs text-gray uppercase tracking-widest font-black mt-1">Strategic knowledge base</p>
                    </div>
                </div>
                <Button onClick={() => setActiveModal('brain')} className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest">
                    <Plus className="w-4 h-4 mr-2" /> Записать идею
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {brainNotes.map(note => (
                    <div key={note.id} className="glass p-6 md:p-8 rounded-apple-3xl border-white shadow-soft hover:shadow-apple-sm transition-all cursor-pointer group relative">
                        <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 bg-accent/5 text-accent rounded-full text-[8px] font-black uppercase tracking-widest">
                                {note.category}
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setEditingItem(note); setActiveModal('brain'); }} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-light rounded-xl transition-all text-gray">
                                    <Sparkles className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: note.id, type: 'habit' as any }); }} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-danger/5 rounded-xl transition-all text-danger/40 hover:text-danger">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-dark tracking-tight mb-4 group-hover:text-accent transition-colors" onClick={() => { setEditingItem(note); setActiveModal('brain'); }}>
                            {note.title}
                        </h3>
                        <p className="text-sm text-gray leading-relaxed line-clamp-4" onClick={() => { setEditingItem(note); setActiveModal('brain'); }}>
                            {note.content}
                        </p>
                    </div>
                ))}

                {brainNotes.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-light rounded-apple-[3rem]">
                        <Book className="w-12 h-12 text-light mx-auto mb-4" />
                        <p className="text-gray font-bold tracking-tight">База знаний пуста. Записывайте стратегии и инсайты здесь.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderKPIs = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <KPICard
                label="Энергия (Средняя)"
                value={kpiMetrics.avgEnergy}
                icon={<Zap className="w-5 h-5" />}
                color="success"
                trend="Состояние"
            />
            <KPICard
                label="Прогресс задач"
                value={`${kpiMetrics.taskCompletion}%`}
                icon={<CheckCircle2 className="w-5 h-5" />}
                color="accent"
                trend={`${plans.length} всего`}
            />
            <KPICard
                label="Настроение"
                value={kpiMetrics.avgMood}
                icon={<Activity className="w-5 h-5" />}
                color="dark"
                trend="Стабильность"
            />
            <KPICard
                label="Прогресс Цели"
                value={`${kpiMetrics.goalProgress}%`}
                icon={<Target className="w-5 h-5" />}
                color="danger"
                trend="Фокус"
            />
        </div>
    );

    const renderIOSAlert = () => {
        if (!deleteConfirm) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/20 backdrop-blur-md animate-fade-in">
                <div className="bg-white/95 backdrop-blur-2xl rounded-[1.5rem] w-full max-w-[320px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white animate-in zoom-in-95 duration-300">
                    <div className="p-8 text-center space-y-3">
                        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-2 text-danger animate-bounce">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-dark tracking-tight">Подтвердите удаление</h3>
                        <p className="text-sm text-gray font-medium leading-relaxed">
                            Эта запись будет стерта из вашего личного пространства. Вы уверены?
                        </p>
                    </div>
                    <div className="flex flex-col border-t border-light">
                        <button
                            onClick={() => {
                                handleDeleteItem(deleteConfirm.id, deleteConfirm.type);
                                setDeleteConfirm(null);
                            }}
                            className="w-full py-5 text-sm font-black uppercase tracking-widest text-danger hover:bg-danger/5 active:bg-danger/10 transition-colors border-b border-light"
                        >
                            Удалить навсегда
                        </button>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className="w-full py-5 text-sm font-black uppercase tracking-widest text-gray hover:bg-light active:bg-dark/5 transition-colors"
                        >
                            Я передумал
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderPlanner = () => {
        const calendarDays = getDaysForCalendar();
        const monthName = currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

        const displayDays = viewMode === 'week'
            ? (() => {
                const now = new Date();
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(now.setDate(diff));
                const week = [];
                for (let i = 0; i < 7; i++) {
                    const d = new Date(monday);
                    d.setDate(monday.getDate() + i);
                    week.push({ date: d, isCurrentMonth: d.getMonth() === currentMonth.getMonth() });
                }
                return week;
            })()
            : calendarDays;

        const mobileDateStr = selectedDate.toISOString().split('T')[0];
        const selectedDayPlans = filteredPlans.filter(p => p.start_date.includes(mobileDateStr));

        return (
            <div className="space-y-6 md:space-y-8 animate-fade-in">
                <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-apple-3xl shadow-soft border border-light/50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-10">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-dark rounded-2xl flex items-center justify-center shadow-apple shrink-0">
                                <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-dark tracking-tighter capitalize leading-none">{monthName}</h2>
                                <div className="flex items-center gap-2 mt-1.5 md:mt-1">
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-light rounded-lg transition-all"><ChevronLeft className="w-4 h-4 text-gray" /></button>
                                    <button onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }} className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline px-2">Сегодня</button>
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-light rounded-lg transition-all"><ChevronRight className="w-4 h-4 text-gray" /></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="hidden md:flex items-center gap-1 bg-light p-1.5 rounded-2xl shadow-inner border border-light/40">
                                <button onClick={() => setViewMode('month')} className={`px-5 py-2 rounded-[0.9rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-white shadow-apple text-dark' : 'text-gray opacity-60'}`}>Месяц</button>
                                <button onClick={() => setViewMode('week')} className={`px-5 py-2 rounded-[0.9rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-white shadow-apple text-dark' : 'text-gray opacity-60'}`}>Неделя</button>
                            </div>

                            <div className="flex md:hidden items-center gap-1 bg-light p-1 rounded-2xl w-full border border-light/40 shadow-inner">
                                <button onClick={() => setViewMode('month')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-dark' : 'text-gray opacity-60'}`}>Месяц</button>
                                <button onClick={() => setViewMode('week')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-dark' : 'text-gray opacity-60'}`}>Неделя</button>
                            </div>

                            <div className="relative flex-1 md:flex-initial">
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="appearance-none w-full h-11 pl-5 pr-10 bg-light rounded-2xl text-[10px] font-black uppercase tracking-widest border-none focus:ring-2 focus:ring-accent/20 cursor-pointer shadow-sm"
                                >
                                    <option value="All">Все категории</option>
                                    <option value="Marketing">Маркетинг</option>
                                    <option value="Stock">Склад</option>
                                    <option value="Finance">Финансы</option>
                                    <option value="Content">Контент</option>
                                    <option value="Personal">Личное</option>
                                </select>
                                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-gray pointer-events-none" />
                            </div>

                            <div className="flex items-center gap-2 bg-light/50 p-1.5 rounded-2xl border border-light/50 shadow-inner w-full md:w-auto overflow-hidden">
                                <div className="px-3 flex items-center gap-2">
                                    <Timer className={`w-4 h-4 ${isTimerRunning ? 'text-danger animate-pulse' : 'text-gray'}`} />
                                    <span className="text-sm font-black tabular-nums text-dark">
                                        {Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                                    className={`h-8 px-4 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all shadow-sm flex-1 md:flex-initial ${isTimerRunning ? 'bg-danger text-white' : 'bg-white text-dark'
                                        }`}
                                >
                                    {isTimerRunning ? 'Стоп' : 'Фокус'}
                                </button>
                                <button
                                    onClick={() => { setIsTimerRunning(false); setTimerRemaining(25 * 60); }}
                                    className="p-2 hover:bg-white rounded-lg transition-all"
                                >
                                    <AlertCircle className="w-3.5 h-3.5 text-gray opacity-40 hover:opacity-100" />
                                </button>
                            </div>

                            <Button onClick={() => { setEditingItem(null); setActiveModal('plan'); }} className="h-11 w-full md:w-auto px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-apple hover:scale-105 transition-transform">
                                <Plus className="w-4 h-4 mr-2" /> Новая задача
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Day Picker - Horizontal Hub */}
                    <div className="flex md:hidden gap-3 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 py-4 mb-4 border-b border-light/50">
                        {calendarDays.filter(d => d.isCurrentMonth).map((day, i) => {
                            const isSelected = day.date.toDateString() === selectedDate.toDateString();
                            const isToday = day.date.toDateString() === new Date().toDateString();
                            const dayName = day.date.toLocaleDateString('ru-RU', { weekday: 'short' });
                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(day.date)}
                                    className={`flex flex-col items-center min-w-[54px] p-3.5 rounded-[1.25rem] transition-all shadow-sm ${isSelected ? 'bg-dark text-white shadow-apple-lg scale-105 border-transparent' : 'bg-light/40 text-dark/40 border border-transparent hover:bg-light/60'
                                        }`}
                                >
                                    <span className={`text-[8px] font-black uppercase mb-1 ${isSelected ? 'text-white/40' : 'text-dark/40'}`}>{dayName}</span>
                                    <span className="text-base font-black tracking-tighter relative">
                                        {day.date.getDate()}
                                        {isToday && !isSelected && <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-sm shadow-accent/50" />}
                                    </span>
                                    {filteredPlans.some(p => p.start_date.includes(day.date.toISOString().split('T')[0])) && (
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-accent shadow-sm shadow-accent/50' : 'bg-accent/30'}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Desktop Calendar Grid */}
                    <div className={`hidden md:grid grid-cols-7 gap-px bg-light/50 border border-light/50 rounded-2xl overflow-hidden shadow-sm`}>
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                            <div key={day} className="bg-white/90 py-3 text-center border-b border-light">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray/40">{day}</span>
                            </div>
                        ))}

                        {displayDays.map((day, i) => {
                            const dateKey = day.date.toISOString().split('T')[0];
                            const dayPlans = filteredPlans.filter(p => p.start_date.includes(dateKey));
                            const isToday = day.date.toDateString() === new Date().toDateString();

                            return (
                                <div
                                    key={i}
                                    className={`min-h-[160px] p-3 transition-all flex flex-col gap-2 group relative border-r border-b border-light last:border-r-0 ${isToday ? 'bg-accent/[0.02]' :
                                        day.isCurrentMonth ? 'bg-white' :
                                            'bg-light/30 opacity-40'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[11px] font-black ${isToday ? 'bg-accent text-white w-6 h-6 flex items-center justify-center rounded-full shadow-apple' : 'text-dark/30'}`}>
                                            {day.date.getDate()}
                                        </span>
                                        {dayPlans.filter(p => p.is_completed).length > 0 && dayPlans.every(p => p.is_completed) && (
                                            <CheckCircle2 className="w-3 h-3 text-success" />
                                        )}
                                    </div>

                                    <div className="space-y-1.5 overflow-y-auto max-h-[140px] no-scrollbar pb-2">
                                        {dayPlans.map(plan => (
                                            <div
                                                key={plan.id}
                                                className={`p-2.5 rounded-xl border-l-4 transition-all cursor-pointer relative shadow-sm border border-light/5 ${celebratingId === plan.id ? 'scale-110 rotate-1 shadow-apple-lg z-20' : ''
                                                    } ${plan.is_completed ? 'opacity-40 grayscale' : 'hover:scale-[1.02] hover:shadow-apple-sm'
                                                    } ${plan.priority === 'High' ? 'bg-danger/[0.03] border-l-danger' :
                                                        plan.priority === 'Medium' ? 'bg-accent/[0.03] border-l-accent' :
                                                            'bg-success/[0.03] border-l-success'
                                                    }`}
                                            >
                                                {celebratingId === plan.id && (
                                                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                                        <Sparkles className="absolute top-0 right-0 w-8 h-8 text-accent animate-ping opacity-50" />
                                                        <div className="absolute inset-0 bg-accent/10 animate-pulse" />
                                                    </div>
                                                )}
                                                <div className="flex items-start gap-2 mb-1.5">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleTogglePlanCompletion(plan.id, plan.is_completed); }}
                                                        className={`mt-0.5 transition-colors ${plan.is_completed ? 'text-success' : 'text-gray/30 hover:text-accent'}`}
                                                    >
                                                        {plan.is_completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                    </button>
                                                    <div className="flex-1 min-w-0" onClick={() => { setEditingItem(plan); setActiveModal('plan'); }}>
                                                        <p className={`text-[11px] font-bold leading-tight ${plan.is_completed ? 'line-through text-gray' : 'text-dark'}`}>
                                                            {plan.title}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-[7.5px] font-black uppercase tracking-widest opacity-40">{plan.category}</span>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={(e) => { e.stopPropagation(); setEditingItem(plan); setActiveModal('plan'); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-accent transition-all">
                                                            <Sparkles className="w-3 h-3" />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ id: plan.id, type: 'plan' }); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-danger transition-all">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {day.isCurrentMonth && (
                                        <button
                                            onClick={() => { setEditingItem({ start_date: dateKey }); setActiveModal('plan'); }}
                                            className="mt-auto opacity-0 group-hover:opacity-100 flex items-center justify-center py-1.5 hover:bg-light rounded-xl text-gray transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Mobile View - Single Day Hub (No Horizontal Scroll for list) */}
                    <div className="block md:hidden space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray/40">
                                {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/5 px-4 py-1.5 rounded-full border border-accent/10 shadow-sm">
                                {selectedDayPlans.length} дел
                            </span>
                        </div>

                        {selectedDayPlans.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDayPlans.map(plan => (
                                    <div
                                        key={plan.id}
                                        className={`p-6 rounded-[2.5rem] border transition-all active:scale-[0.98] ${celebratingId === plan.id ? 'scale-105 border-accent bg-accent/5 shadow-apple-lg' :
                                            plan.is_completed ? 'opacity-40 bg-light/30 border-transparent shadow-none' : 'bg-white shadow-apple border-light/50'
                                            }`}
                                    >
                                        {celebratingId === plan.id && (
                                            <div className="absolute top-4 right-4 animate-bounce">
                                                <Sparkles className="w-6 h-6 text-accent" />
                                            </div>
                                        )}
                                        <div className="flex items-start gap-4">
                                            <button
                                                onClick={() => handleTogglePlanCompletion(plan.id, plan.is_completed)}
                                                className={`mt-1.5 transition-colors ${plan.is_completed ? 'text-success' : 'text-gray/20'}`}
                                            >
                                                {plan.is_completed ? <CheckCircle2 className="w-6 h-6 shadow-sm" /> : <Circle className="w-6 h-6" />}
                                            </button>
                                            <div className="flex-1 min-w-0" onClick={() => { setEditingItem(plan); setActiveModal('plan'); }}>
                                                <p className={`text-base font-bold leading-tight tracking-tight ${plan.is_completed ? 'line-through text-gray' : 'text-dark'}`}>{plan.title}</p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 bg-light rounded-full text-gray">{plan.category}</span>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${plan.priority === 'High' ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'
                                                        }`}>{plan.priority}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setDeleteConfirm({ id: plan.id, type: 'plan' })}
                                                className="p-3 text-gray/20 active:text-danger active:bg-danger/5 rounded-2xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-light/20 rounded-[3rem] border-2 border-dashed border-light/50">
                                <Plus className="w-8 h-8 text-light mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray/30">Задач пока нет</p>
                                <button
                                    onClick={() => { setEditingItem({ start_date: mobileDateStr }); setActiveModal('plan'); }}
                                    className="mt-8 px-10 py-4 bg-dark text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest shadow-apple-lg hover:scale-105 active:scale-95 transition-all"
                                >
                                    Создать задачу
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    const renderJournal = () => (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-dark tracking-tighter">Личный Журнал</h2>
                    <p className="text-xs text-gray uppercase tracking-widest font-black mt-1">My private growth log</p>
                </div>
                <Button onClick={() => { setEditingItem(null); setActiveModal('journal'); }} className="h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                    <Plus className="w-4 h-4 mr-3" /> Запись в дневник
                </Button>
            </div>

            <div className="space-y-10 relative pl-8 border-l-2 border-light/50 ml-4">
                {sortedJournal.length > 0 ? sortedJournal.map((entry) => (
                    <div key={entry.id} className="relative group">
                        <div className="hidden md:block absolute -left-[42px] top-6 w-5 h-5 rounded-full bg-white border-[5px] border-dark shadow-apple z-10 transition-transform group-hover:scale-125" />
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-soft border border-light/50 hover:shadow-apple-sm transition-all group-hover:border-dark/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-gray mb-1">
                                            {new Date(entry.date).toLocaleDateString('ru-RU', { weekday: 'long' })}
                                        </span>
                                        <span className="text-lg md:text-xl font-bold text-dark tracking-tight">
                                            {new Date(entry.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-dark/[0.03] px-3 py-1.5 rounded-full border border-dark/5">
                                        <div className="flex items-center gap-1">
                                            <Flame className={`w-3.5 h-3.5 ${entry.mood >= 7 ? 'text-danger fill-current' : 'text-gray/20'}`} />
                                            <span className="text-[10px] font-black text-dark/60">{entry.mood}/10</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => { setEditingItem(entry); setActiveModal('journal'); }} className="p-2.5 hover:bg-light rounded-xl text-gray/40 hover:text-dark transition-all">
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDeleteConfirm({ id: entry.id, type: 'journal' as any })} className="p-2.5 hover:bg-danger/5 rounded-xl text-gray/40 hover:text-danger transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent">
                                        <Sparkles className="w-3.5 h-3.5" /> Главный инсайт
                                    </div>
                                    <p className="text-xl md:text-2xl font-bold text-dark leading-tight tracking-tight break-words whitespace-pre-wrap italic">
                                        "{entry.entry}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-light/50">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-success">
                                            <ArrowUpRight className="w-3 h-3" /> Победы
                                        </div>
                                        <p className="text-sm font-medium text-dark/60 leading-relaxed border-l-2 border-success/20 pl-4 min-h-[40px]">
                                            {entry.worked || 'Не зафиксировано'}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-danger">
                                            <ArrowDownRight className="w-3 h-3" /> Ошибки
                                        </div>
                                        <p className="text-sm font-medium text-dark/60 leading-relaxed border-l-2 border-danger/20 pl-4 min-h-[40px]">
                                            {entry.failed || 'Не зафиксировано'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center glass rounded-apple-2xl border-white/50">
                        <Book className="w-12 h-12 text-light mx-auto mb-4" />
                        <p className="text-gray font-bold tracking-tight">Ваш дневник пуст. Начните записывать свой путь.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderGoals = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-dark tracking-tighter">Личные Цели</h2>
                    <p className="text-xs text-gray uppercase tracking-widest font-black mt-1">Life milestones</p>
                </div>
                <Button onClick={() => { setEditingItem(null); setActiveModal('goal'); }} className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest">
                    <Plus className="w-4 h-4 mr-2" /> Добавить Цель
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {goals.map(goal => (
                    <div key={goal.id} className="relative group">
                        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => { setEditingItem(goal); setActiveModal('goal'); }} className="p-2 bg-white/80 backdrop-blur shadow-apple-sm rounded-xl text-gray hover:text-dark transition-all">
                                <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteConfirm({ id: goal.id, type: 'goal' as any })} className="p-2 bg-white/80 backdrop-blur shadow-apple-sm rounded-xl text-danger/40 hover:text-danger transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <ProgressCard
                            label={goal.title}
                            current={goal.current_value}
                            target={goal.target_value}
                            unit={goal.unit}
                            color={goal.type === 'Revenue' ? 'var(--success)' : goal.type === 'Sales' ? 'var(--dark)' : 'var(--accent)'}
                            description={`${goal.period} | ${goal.type}`}
                        />
                    </div>
                ))}

                {goals.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-light rounded-apple-3xl">
                        <Target className="w-12 h-12 text-light mx-auto mb-4" />
                        <p className="text-gray font-bold tracking-tight">Нет активных целей</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderEnergyMap = () => {
        const last14Days = Array.from({ length: 14 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            const ds = d.toISOString().split('T')[0];
            const entry = journalEntries.find(e => e.date === ds);
            return {
                day: d.getDate(),
                energy: entry?.energy_level || 0,
                mood: entry?.mood || 0,
                date: ds
            };
        });

        const maxVal = 10;
        const width = 1000;
        const height = 300;
        const padding = 60;

        const getX = (i: number) => padding + (i * (width - 2 * padding)) / 13;
        const getY = (v: number) => height - padding - (v * (height - 2 * padding)) / maxVal;

        const energyPath = last14Days.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.energy)}`).join(' ');
        const moodPath = last14Days.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.mood)}`).join(' ');

        const energyArea = `${energyPath} L ${getX(13)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;
        const moodArea = `${moodPath} L ${getX(13)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

        return (
            <div className="glass p-6 md:p-10 rounded-apple-3xl border-white shadow-soft mb-12 overflow-hidden bg-gradient-to-br from-white/40 to-accent/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-accent" />
                            <h3 className="text-xl font-bold text-dark tracking-tight">Карта Состояния</h3>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-success rounded-full shadow-sm shadow-success/30" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray">Энергия</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-accent rounded-full shadow-sm shadow-accent/30" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray">Настроение</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleSyncHealth}
                            isLoading={isHealthSyncing}
                            className="h-10 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest gap-2 bg-white text-dark border-light shadow-apple-sm hover:shadow-apple transition-all"
                        >
                            <Watch className="w-4 h-4" /> {isHealthSyncing ? 'Синхронизация...' : 'Apple Health Sync'}
                        </Button>
                    </div>
                </div>

                <div className="relative h-[280px] w-full mt-4">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="gradient-energy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="gradient-mood" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#007AFF" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        {[0, 2, 4, 6, 8, 10].map(v => (
                            <g key={v}>
                                <line
                                    x1={padding} y1={getY(v)} x2={width - padding} y2={getY(v)}
                                    stroke="rgba(0,0,0,0.03)" strokeWidth="1"
                                />
                                <text x={padding - 15} y={getY(v) + 4} textAnchor="end" className="text-[8px] fill-gray/30 font-black">{v}</text>
                            </g>
                        ))}

                        {/* Area fills */}
                        <path d={energyArea} fill="url(#gradient-energy)" className="animate-in fade-in duration-1000" />
                        <path d={moodArea} fill="url(#gradient-mood)" className="animate-in fade-in duration-1000 delay-150" />

                        {/* Main lines */}
                        <path d={energyPath} fill="none" stroke="#22C55E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm opacity-80" />
                        <path d={moodPath} fill="none" stroke="#007AFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm opacity-80" />

                        {/* Points and Dates */}
                        {last14Days.map((d, i) => (
                            <g key={i} className="group/point">
                                <circle cx={getX(i)} cy={getY(d.energy)} r="5" fill="#22C55E" stroke="white" strokeWidth="3" className="shadow-apple transition-all hover:r-7 group-hover/point:opacity-100" />
                                <circle cx={getX(i)} cy={getY(d.mood)} r="5" fill="#007AFF" stroke="white" strokeWidth="3" className="shadow-apple transition-all hover:r-7 group-hover/point:opacity-100" />

                                <text
                                    x={getX(i)} y={height - 20}
                                    textAnchor="middle"
                                    className={`text-[9px] font-black tracking-tighter transition-colors ${d.day === new Date().getDate() ? 'fill-dark' : 'fill-gray/20'}`}
                                >
                                    {d.day}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        );
    };

    const renderAIHub = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-dark rounded-[1.5rem] flex items-center justify-center shadow-apple rotate-6">
                        <Zap className="w-8 h-8 text-white fill-current" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold text-dark tracking-tighter">Личный Коуч FoCal</h2>
                        <p className="text-xs text-gray uppercase tracking-widest font-black mt-1">Growth & Stability Insights</p>
                    </div>
                </div>
                <Button onClick={handleStrategicAnalysis} isLoading={isAiLoading} className="h-14 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest bg-dark hover:bg-black transition-all shadow-apple">
                    {isAiLoading ? 'Общаюсь с вашим подсознанием...' : 'Получить Инсайты'}
                </Button>
            </div>

            {renderEnergyMap()}

            {aiInsight ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass p-10 rounded-apple-3xl border-white shadow-apple-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Brain className="w-48 h-48 text-dark" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.5em] text-accent">
                                    <Activity className="w-4 h-4" /> Анализ состояния
                                </div>
                                <h3 className="text-3xl font-medium text-dark leading-tight tracking-tight italic">
                                    "{aiInsight.executive_summary}"
                                </h3>
                                <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-light">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray">Продуктивность</p>
                                        <p className="text-4xl font-black text-dark">{aiInsight.productivity_score}%</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray">Баланс Жизнь/Работа</p>
                                        <p className="text-sm font-bold text-success uppercase tracking-tighter">{aiInsight.overall_balance}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InsightCard title="Ваши паттерны" type="pattern" content={aiInsight.pattern_detection} />
                            <InsightCard
                                title="Риск выгорания"
                                type="risk"
                                content={`${aiInsight.burnout_risk}: ${aiInsight.executive_summary.split('.')[0]}`}
                            />
                        </div>

                        <div className="glass p-8 rounded-apple-3xl border-white shadow-soft space-y-4">
                            <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-accent" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-dark">Корреляция Энергии</h3>
                            </div>
                            <p className="text-sm font-medium text-dark/70 leading-relaxed italic">
                                {aiInsight.energy_productivity_correlation}
                            </p>
                        </div>

                        {aiInsight.blind_spots && aiInsight.blind_spots.length > 0 && (
                            <div className="glass p-8 rounded-apple-3xl border-white shadow-apple-sm bg-danger/[0.02]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Zap className="w-5 h-5 text-danger" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-danger">Слепые зоны</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {aiInsight.blind_spots.map((spot: string, i: number) => (
                                        <span key={i} className="px-4 py-2 bg-white rounded-full text-[10px] font-bold text-dark border border-danger/10 shadow-sm">
                                            {spot}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="glass p-8 rounded-apple-3xl border-white shadow-apple-lg bg-gradient-to-br from-white to-accent/5">
                            <div className="flex items-center gap-3 mb-10">
                                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-dark">Стратегия Роста</h3>
                            </div>
                            <div className="space-y-6">
                                {aiInsight.strategic_suggestions.map((suggestion: string, idx: number) => (
                                    <div key={idx} className="flex gap-5 p-5 rounded-2xl bg-white/40 hover:bg-white transition-all cursor-pointer border border-transparent hover:border-accent/10 shadow-apple-sm hover:shadow-apple group">
                                        <span className="text-2xl font-black text-dark/5 group-hover:text-accent/20 transition-colors">{idx + 1}</span>
                                        <p className="text-sm font-bold text-dark/80 leading-snug group-hover:text-dark transition-colors">{suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Insight of the Day */}
                        <div className="p-8 rounded-apple-3xl bg-dark text-white shadow-apple-lg relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform">
                                <Activity className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Insight of the Day</span>
                                </div>
                                <p className="text-base font-medium italic leading-relaxed text-white/90">
                                    "Ваша продуктивность растет при постепенном погружении, а не резком старте."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-32 flex flex-col items-center justify-center glass rounded-apple-[3rem] border-white/50 text-center space-y-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-light rounded-full flex items-center justify-center animate-pulse">
                            <Brain className="w-12 h-12 text-gray" />
                        </div>
                        <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-accent animate-bounce" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-dark tracking-tighter">Ваш ИИ-коуч готов к анализу</h3>
                        <p className="text-sm text-gray font-medium uppercase tracking-widest">FoCal изучит ваши личные записи и цели для глубокого понимания</p>
                    </div>
                    <Button onClick={handleStrategicAnalysis} className="h-14 px-12 rounded-full font-black text-[12px] uppercase tracking-widest">
                        Включить Коуча
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FBFBFD] pb-32">
            <div className="max-w-[1400px] mx-auto px-6 pt-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-dark/30">Personal Workspace</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-sm shadow-accent/50" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-dark tracking-tighter flex items-center gap-3 md:gap-4">
                            FOCAL<span className="text-accent opacity-20">.</span>Personal
                        </h1>
                    </div>

                    <div className="sticky top-4 z-50 flex items-center gap-1.5 p-1.5 bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[1.2rem] shadow-apple-lg md:shadow-apple-sm border border-white/40 overflow-x-auto no-scrollbar md:relative md:top-0 md:bg-light">
                        {(['planner', 'habits', 'journal', 'goals', 'ai', 'brain'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 md:px-6 py-2.5 md:py-3 rounded-[1rem] md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap flex items-center justify-center ${activeTab === tab
                                    ? 'bg-dark text-white shadow-apple scale-[1.02] md:scale-105'
                                    : 'text-gray/60 hover:text-dark hover:bg-white/40'
                                    }`}
                            >
                                {tab === 'planner' && <CheckCircle2 className={`w-3 h-3 ${activeTab === tab ? 'mr-2' : ''}`} />}
                                {tab === 'habits' && <Flame className={`w-3 h-3 ${activeTab === tab ? 'mr-2 text-danger' : ''}`} />}
                                {tab === 'journal' && <Book className={`w-3 h-3 ${activeTab === tab ? 'mr-2' : ''}`} />}
                                {tab === 'goals' && <Target className={`w-3 h-3 ${activeTab === tab ? 'mr-2' : ''}`} />}
                                {tab === 'ai' && <Sparkles className={`w-3 h-3 ${activeTab === tab ? 'mr-2 text-accent' : ''}`} />}
                                {tab === 'brain' && <Brain className={`w-3 h-3 ${activeTab === tab ? 'mr-2' : ''}`} />}
                                <span className={activeTab === tab ? 'inline' : 'hidden md:inline ml-2'}>
                                    {tab === 'planner' && 'План'}
                                    {tab === 'habits' && 'Ритуалы'}
                                    {tab === 'journal' && 'Дневник'}
                                    {tab === 'goals' && 'Цели'}
                                    {tab === 'ai' && 'Коуч'}
                                    {tab === 'brain' && 'Мозг'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-[500px] flex flex-col items-center justify-center space-y-6">
                        <div className="w-12 h-12 border-4 border-dark/10 border-t-dark rounded-full animate-spin" />
                        <p className="text-gray font-black uppercase tracking-[0.3em] text-[10px]">Загружаю ваше личное пространство...</p>
                    </div>
                ) : dbError === 'DATABASE_MIGRATION_REQUIRED' ? (
                    renderMigrationAlert()
                ) : (
                    <>
                        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {renderIOSAlert()}
                            {renderMorningBrief()}
                            {renderKPIs()}
                            {activeTab === 'planner' && renderPlanner()}
                            {activeTab === 'habits' && renderHabits()}
                            {activeTab === 'journal' && renderJournal()}
                            {activeTab === 'goals' && renderGoals()}
                            {activeTab === 'ai' && renderAIHub()}
                            {activeTab === 'brain' && renderBrain()}
                        </div>
                    </>
                )}
            </div>

            {/* Mobile FAB */}
            <div className="fixed bottom-8 right-6 flex flex-col items-end gap-3 md:hidden z-[60] animate-in slide-in-from-bottom-5 duration-500">
                <button
                    onClick={() => { setEditingItem(null); setActiveModal('journal'); }}
                    className="w-12 h-12 bg-white text-dark rounded-2xl shadow-apple-lg flex items-center justify-center border border-light/50 active:scale-90 transition-all group"
                >
                    <Book className="w-5 h-5 group-active:scale-110 transition-transform" />
                </button>
                <button
                    onClick={() => { setEditingItem(null); setActiveModal('plan'); }}
                    className="w-16 h-16 bg-dark text-white rounded-[2rem] shadow-apple-lg flex items-center justify-center active:scale-95 transition-all group"
                >
                    <Plus className="w-8 h-8 group-active:scale-110 transition-transform" />
                </button>
            </div>

            <FocalPremiumModals
                activeModal={activeModal}
                onClose={() => setActiveModal(null)}
                onSavePlan={handleSavePlan}
                onSaveJournal={handleSaveJournal}
                onSaveGoal={handleSaveGoal}
                onSaveHabit={handleSaveHabit}
                onSaveBrainNote={handleSaveBrainNote}
                editingItem={editingItem}
            />
        </div>
    );
};

const FocalPremiumModals: React.FC<any> = ({
    activeModal, onClose, onSavePlan, onSaveJournal, onSaveGoal, onSaveHabit, onSaveBrainNote, editingItem
}) => {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (editingItem) setFormData(editingItem);
        else setFormData({
            category: 'Strategic',
            priority: 'Medium',
            mood: 7,
            energy_level: 7,
            type: 'Revenue',
            period: 'Monthly',
            unit: '₸',
            title: '',
            content: '',
            revenue: 0
        });
    }, [editingItem, activeModal]);

    return (
        <>
            {/* Modal components... reusing same style */}
            <Modal isOpen={activeModal === 'plan'} onClose={onClose} title={editingItem ? "Изменить дело" : "Новое личное дело"} size="sm">
                <div className="space-y-6 py-4 md:py-6 font-sans">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">Что сделать?</label>
                        <input
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Напр: Сходить в зал"
                            className="w-full px-5 py-4 md:py-3 bg-light rounded-2xl md:rounded-xl font-bold border-2 border-transparent focus:border-dark outline-none transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray">Сфера</label>
                            <select
                                value={formData.category || 'General'}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-4 md:py-3 bg-light rounded-2xl md:rounded-xl font-bold outline-none appearance-none"
                            >
                                <option value="Strategic">Стратегия</option>
                                <option value="Personal">Личное</option>
                                <option value="Business">Бизнес</option>
                                <option value="Routine">Рутина</option>
                                <option value="General">Прочее</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray">Приоритет</label>
                            <select
                                value={formData.priority || 'Medium'}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-4 md:py-3 bg-light rounded-2xl md:rounded-xl font-bold outline-none appearance-none"
                            >
                                <option value="High">Срочно</option>
                                <option value="Medium">Важно</option>
                                <option value="Low">Если успею</option>
                            </select>
                        </div>
                    </div>
                    <Button onClick={() => onSavePlan(formData)} className="w-full h-14 md:h-12 rounded-2xl font-black uppercase tracking-widest bg-dark text-white shadow-apple-lg transition-transform active:scale-95">
                        {editingItem ? 'Обновить' : 'В список дел'}
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'journal'} onClose={onClose} title="Мои Итоги Дня" size="sm">
                <div className="space-y-6 py-4 font-sans">
                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">О чем я думаю сейчас?</label>
                        <textarea
                            value={formData.entry || ''}
                            onChange={e => setFormData({ ...formData, entry: e.target.value })}
                            placeholder="Ваши мысли, инсайты, чувства..."
                            className="w-full h-40 px-6 py-5 bg-light rounded-[2.5rem] font-medium outline-none resize-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">Энергия и Фокус (1-10)</label>
                        <div className="flex items-center gap-4 h-full pt-2">
                            <input
                                type="range" min="1" max="10"
                                value={formData.mood || 7}
                                onChange={e => setFormData({ ...formData, mood: Number(e.target.value), energy_level: Number(e.target.value) })}
                                className="w-full h-2 accent-dark bg-light rounded-full appearance-none cursor-pointer"
                            />
                            <span className="font-bold text-dark min-w-[20px]">{formData.mood || 7}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray">Победы</label>
                            <input
                                value={formData.worked || ''}
                                onChange={e => setFormData({ ...formData, worked: e.target.value })}
                                placeholder="Что получилось?"
                                className="w-full px-5 py-4 bg-light rounded-2xl font-bold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray">Ошибки</label>
                            <input
                                value={formData.failed || ''}
                                onChange={e => setFormData({ ...formData, failed: e.target.value })}
                                placeholder="Что пошло не так?"
                                className="w-full px-5 py-4 bg-light rounded-2xl font-bold outline-none"
                            />
                        </div>
                    </div>
                    <Button onClick={() => onSaveJournal(formData)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-dark text-white shadow-apple-lg transition-transform active:scale-95">
                        {editingItem ? 'Обновить запись' : 'Зафиксировать день'}
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'goal'} onClose={onClose} title={editingItem ? "Изменить цель" : "Новая стратегическая цель"} size="sm">
                <div className="space-y-6 py-4 font-sans">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">Название цели</label>
                        <input
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Напр: Доход 5 млн ₸"
                            className="w-full px-5 py-4 bg-light rounded-2xl font-bold outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray">Цель (число)</label>
                            <input
                                type="number"
                                value={formData.target_value || ''}
                                onChange={e => setFormData({ ...formData, target_value: Number(e.target.value) })}
                                className="w-full px-5 py-4 bg-light rounded-2xl font-bold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray">Ед. изм.</label>
                            <input
                                value={formData.unit || '₸'}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-5 py-4 bg-light rounded-2xl font-bold outline-none"
                            />
                        </div>
                    </div>
                    <Button onClick={() => onSaveGoal(formData)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-dark text-white shadow-apple-lg transition-transform active:scale-95">
                        {editingItem ? 'Обновить цель' : 'Установить цель'}
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'habit'} onClose={onClose} title={editingItem ? "Изменить ритуал" : "Новый ежедневный ритуал"} size="sm">
                <div className="space-y-6 py-4 font-sans">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">Что нужно делать каждый день?</label>
                        <input
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Напр: Читать 30 мин"
                            className="w-full px-5 py-4 bg-light rounded-2xl font-bold outline-none"
                        />
                    </div>
                    <Button onClick={() => onSaveHabit(formData.title)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-dark text-white shadow-apple-lg transition-transform active:scale-95">
                        {editingItem ? 'Обновить' : 'Добавить ритуал'}
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'brain'} onClose={onClose} title={editingItem ? "Изменить идею" : "Новое прозрение / Идея"} size="sm">
                <div className="space-y-6 py-4 font-sans">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">Заголовок</label>
                        <input
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Суть идеи..."
                            className="w-full px-5 py-4 bg-light rounded-2xl font-bold outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">Детали</label>
                        <textarea
                            value={formData.content || ''}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Подробности, размышления..."
                            className="w-full h-40 px-6 py-5 bg-light rounded-[2rem] font-medium outline-none resize-none"
                        />
                    </div>
                    <Button onClick={() => onSaveBrainNote(formData)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-dark text-white shadow-apple-lg transition-transform active:scale-95">
                        {editingItem ? 'Обновить' : 'Сохранить в базу знаний'}
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'goal'} onClose={onClose} title="Моя Вершина (Цель)" size="sm">
                <div className="space-y-6 py-6 font-sans">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">Описание личной цели</label>
                        <input
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Напр: Купить квартиру" className="w-full px-5 py-3 bg-light rounded-xl font-bold outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray">Стоимость / Значение</label>
                            <input
                                type="number"
                                value={formData.target_value || ''}
                                onChange={e => setFormData({ ...formData, target_value: Number(e.target.value) })}
                                placeholder="Значение" className="w-full px-5 py-3 bg-light rounded-xl font-bold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray">Тип</label>
                            <select
                                value={formData.type || 'Revenue'}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 bg-light rounded-xl font-bold outline-none">
                                <option value="Revenue">Финансовая</option>
                                <option value="Sales">Количественная</option>
                                <option value="Launch">Проектная</option>
                            </select>
                        </div>
                    </div>
                    <Button onClick={() => onSaveGoal(formData)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest">Путь к цели</Button>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'habit'} onClose={onClose} title="Новый Ритуал" size="sm">
                <div className="space-y-6 py-6 font-sans">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">Какое действие повторять ежедневно?</label>
                        <input
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Напр: Медитация 10 мин" className="w-full px-5 py-3 bg-light rounded-xl font-bold outline-none"
                        />
                    </div>
                    <Button onClick={() => onSaveHabit(formData.title)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest">Внедрить ритуал</Button>
                </div>
            </Modal>

            <Modal isOpen={activeModal === 'brain'} onClose={onClose} title="Входящая идея в Базу Знаний" size="sm">
                <div className="space-y-6 py-6 font-sans">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">Заголовок мысли</label>
                        <input
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Напр: Стратегия масштабирования 2026" className="w-full px-5 py-3 bg-light rounded-xl font-bold outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">Содержание</label>
                        <textarea
                            value={formData.content || ''}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Распишите подробнее..."
                            className="w-full h-40 px-6 py-4 bg-light rounded-3xl font-medium outline-none resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray">Категория</label>
                        <select
                            value={formData.category || 'Strategy'}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-light rounded-xl font-bold outline-none"
                        >
                            <option value="Strategy">Стратегия</option>
                            <option value="Insight">Инсайт</option>
                            <option value="SOP">Инструкция</option>
                            <option value="Vision">Видение</option>
                        </select>
                    </div>
                    <Button onClick={() => onSaveBrainNote(formData)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest">Сохранить в Мозг</Button>
                </div>
            </Modal>
        </>
    );
};
