import React, { useState, useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { ReinforcementPlan, Student, Class, Subject, User, Role } from '../types';
import ReinforcementList from '../components/vicerrectorado/ReinforcementList';
import ReinforcementForm from '../components/vicerrectorado/ReinforcementForm';
import { GraduationCapIcon } from '../components/icons/Icons';

interface TeacherReinforcementPageProps {
    students: Student[];
    classes: Class[];
    subjects: Subject[];
    users: User[];
    reinforcementPlans: ReinforcementPlan[];
    onUpdateReinforcementPlans: (plans: ReinforcementPlan[]) => void;
}

const TeacherReinforcementPage: React.FC<TeacherReinforcementPageProps> = ({ students, classes, subjects, users, reinforcementPlans, onUpdateReinforcementPlans }) => {
    const { user } = useContext(UserContext);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<ReinforcementPlan | null>(null);

    // Filter plans where this user is the reinforcement teacher OR the subject teacher
    const teacherPlans = useMemo(() => {
        if (!user) return [];
        return reinforcementPlans.filter(p => p.teacherId === user.id || p.reinforcementTeacherId === user.id);
    }, [reinforcementPlans, user]);
    
    const handleSave = (plan: ReinforcementPlan) => {
        if (reinforcementPlans.some(p => p.id === plan.id)) {
            onUpdateReinforcementPlans(reinforcementPlans.map(p => p.id === plan.id ? plan : p));
        } else {
            onUpdateReinforcementPlans([...reinforcementPlans, plan]);
        }
        setIsFormOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <GraduationCapIcon className="h-8 w-8 text-primary-600" />
                        Gestión de Refuerzo Académico
                    </h2>
                    <p className="text-slate-600 text-sm mt-1">Genere la nómina de estudiantes y planifique la recuperación pedagógica.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <ReinforcementList
                    plans={teacherPlans}
                    students={students}
                    teachers={users.filter(u => u.role === Role.Teacher)}
                    subjects={subjects}
                    classes={classes}
                    onCreate={() => { setEditingPlan(null); setIsFormOpen(true); }}
                    onEdit={(plan) => { setEditingPlan(plan); setIsFormOpen(true); }}
                />
            </div>

            {isFormOpen && user && (
                <ReinforcementForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                    planToEdit={editingPlan}
                    students={students} // Pass all students so teacher can select any student from their institution
                    teachers={users.filter(u => u.role === Role.Teacher)}
                    subjects={subjects}
                    classes={classes}
                    currentUser={user}
                />
            )}
        </div>
    );
};

export default TeacherReinforcementPage;