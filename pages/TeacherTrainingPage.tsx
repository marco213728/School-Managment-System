import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { TrainingPlan, TrainingCourse } from '../types';
import { CalendarIcon, CheckCircleIcon } from '../components/icons/Icons';

interface TeacherTrainingPageProps {
    trainingPlans: TrainingPlan[];
    onUpdateTrainingPlans: (plans: TrainingPlan[]) => void;
}

const TeacherTrainingPage: React.FC<TeacherTrainingPageProps> = ({ trainingPlans, onUpdateTrainingPlans }) => {
    const { user } = useContext(UserContext);

    if (!user) return null;

    const handleRegister = (planId: string, course: TrainingCourse) => {
        if (course.enrolledTeachers.some(t => t.teacherId === user.id)) return;

        const updatedCourse = {
            ...course,
            enrolledTeachers: [...course.enrolledTeachers, { teacherId: user.id, attendancePercentage: 0, finalGrade: 0, status: 'En Curso' }]
        };

        const updatedPlans = trainingPlans.map(p => {
            if (p.id === planId) {
                return { ...p, courses: p.courses.map(c => c.id === course.id ? updatedCourse : c) };
            }
            return p;
        });

        onUpdateTrainingPlans(updatedPlans as TrainingPlan[]);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Oferta de Capacitación y Desarrollo Profesional</h2>
            {trainingPlans.map(plan => (
                <div key={plan.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-xl font-bold text-primary-700 mb-2">{plan.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{plan.objectives}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.courses.map(course => {
                            const isEnrolled = course.enrolledTeachers.some(t => t.teacherId === user.id);
                            return (
                                <div key={course.id} className="border p-4 rounded-lg bg-gray-50 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between">
                                            <h4 className="font-bold text-gray-800">{course.title}</h4>
                                            {isEnrolled && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircleIcon className="h-3 w-3"/> Inscrito</span>}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Instructor: {course.instructor}</p>
                                        <p className="text-xs text-gray-400 mt-1"><CalendarIcon className="inline h-3 w-3"/> {new Date(course.startDate).toLocaleDateString()} - {course.durationHours} Horas</p>
                                    </div>
                                    <button 
                                        onClick={() => handleRegister(plan.id, course)} 
                                        disabled={isEnrolled}
                                        className={`mt-4 w-full py-2 rounded font-semibold text-sm ${isEnrolled ? 'bg-gray-200 text-gray-500 cursor-default' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                                    >
                                        {isEnrolled ? 'Ya estás inscrito' : 'Inscribirse al Curso'}
                                    </button>
                                </div>
                            );
                        })}
                        {plan.courses.length === 0 && <p className="text-sm text-gray-500 italic col-span-full">No hay cursos disponibles en este plan.</p>}
                    </div>
                </div>
            ))}
            {trainingPlans.length === 0 && <p className="text-center text-gray-500 py-10">No hay planes de capacitación activos en este momento.</p>}
        </div>
    );
};

export default TeacherTrainingPage;