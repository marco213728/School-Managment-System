import React, { useState, useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MOCK_ACTIVITIES, MOCK_CLASSES, MOCK_USERS } from '../constants';
import { Role, Activity, ActivityType, Class } from '../types';
import { EditIcon, TrashIcon, PlusIcon } from '../components/icons/Icons';

// FIX: Changed component to React.FC with a typed props interface to fix key prop error.
interface ActivityCardProps {
    activity: Activity;
    classInfo: Class | undefined;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, classInfo }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500">{classInfo?.name}</p>
                    <h4 className="font-bold text-gray-800">{activity.title}</h4>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${activity.type === ActivityType.Exam ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{activity.type}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
            <p className="text-sm font-semibold text-gray-700 mt-4">Fecha de Entrega: {activity.deliveryDate}</p>
        </div>
    );
};

const TeacherActivities = () => {
    const { user } = useContext(UserContext);

    const institutionClasses = useMemo(() => MOCK_CLASSES.filter(c => c.institutionId === user?.institutionId), [user]);
    
    const teacherActivities = useMemo(() => 
        MOCK_ACTIVITIES.filter(act => act.teacherId === user?.id && act.institutionId === user?.institutionId), 
        [user]
    );
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Gestionar Actividades</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    <PlusIcon className="h-5 w-5" />
                    Crear Actividad
                </button>
            </div>
             <div className="space-y-4">
                {teacherActivities.map(activity => (
                    <div key={activity.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                        <div>
                             <p className="text-sm text-gray-500">{institutionClasses.find(c => c.id === activity.classId)?.name}</p>
                            <h4 className="font-bold text-gray-800">{activity.title}</h4>
                             <p className="text-sm font-semibold text-gray-700 mt-1">Entrega: {activity.deliveryDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full"><EditIcon className="h-5 w-5" /></button>
                            <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="h-5 w-5" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StudentParentActivities = () => {
    const { user } = useContext(UserContext);

    const institutionClasses = useMemo(() => MOCK_CLASSES.filter(c => c.institutionId === user?.institutionId), [user]);

    const relevantClassIds = useMemo(() => {
        if (!user) return [];

        if (user.role === Role.Student) {
            return user.classIds || [];
        }
        if (user.role === Role.Parent && user.childId) {
            const childUser = MOCK_USERS.find(u => u.id === user.childId && u.institutionId === user.institutionId);
            return childUser?.classIds || [];
        }
        return [];
    }, [user]);

    const activities = useMemo(() =>
        MOCK_ACTIVITIES.filter(act => act.institutionId === user?.institutionId && relevantClassIds.includes(act.classId)),
        [relevantClassIds, user]
    );

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Próximas Actividades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map(activity => {
                    const classInfo = institutionClasses.find(c => c.id === activity.classId);
                    return <ActivityCard key={activity.id} activity={activity} classInfo={classInfo} />
                })}
            </div>
        </div>
    );
};

const ActivitiesPage = () => {
    const { user } = useContext(UserContext);

    if (user?.role === Role.Teacher || user?.role === Role.InstitutionAdmin) {
        return <TeacherActivities />;
    }

    if (user?.role === Role.Parent || user?.role === Role.Student) {
        return <StudentParentActivities />;
    }
    
    return <p>No tiene acceso a esta sección.</p>;
};

export default ActivitiesPage;