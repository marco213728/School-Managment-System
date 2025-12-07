import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { User, TrainingCourse } from '../../types';

interface TrainingCertificatePrintableProps {
    teacher: User;
    course: TrainingCourse;
    planTitle: string;
}

const TrainingCertificatePrintable: React.FC<TrainingCertificatePrintableProps> = ({ teacher, course, planTitle }) => {
    const { institution } = useContext(InstitutionContext);

    if (!institution) return null;

    return (
        <div className="bg-white p-12 font-serif text-gray-800 text-center border-8 border-double border-primary-800 h-full flex flex-col justify-between">
            <header>
                <div className="flex justify-center mb-6">
                    <img src={institution.logoUrl} alt="Logo" className="h-32 w-32 object-contain" />
                </div>
                <h1 className="text-3xl font-bold uppercase tracking-wide text-primary-900">{institution.name}</h1>
                <p className="text-lg text-gray-600 mt-2">confiere el presente</p>
            </header>

            <main className="flex-grow flex flex-col justify-center py-10">
                <h2 className="text-5xl font-black text-primary-700 uppercase mb-8 tracking-widest">CERTIFICADO</h2>
                
                <p className="text-xl text-gray-700 mb-2">a:</p>
                <h3 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-400 inline-block px-8 pb-2 mb-8 mx-auto">
                    {teacher.name}
                </h3>

                <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
                    Por haber aprobado satisfactoriamente el curso de capacitación profesional:
                </p>
                
                <h4 className="text-2xl font-bold text-primary-800 mt-4 mb-2">"{course.title}"</h4>
                
                <p className="text-lg text-gray-600 mb-8">
                    Con una duración de <strong>{course.durationHours} horas</strong>, realizado desde el {new Date(course.startDate).toLocaleDateString()} hasta el {new Date(course.endDate).toLocaleDateString()}.
                </p>

                <p className="text-sm text-gray-500 italic">
                    Este curso forma parte del <strong>{planTitle}</strong>.
                </p>
            </main>

            <footer className="mt-12">
                <div className="flex justify-center gap-32">
                    <div className="text-center">
                        <div className="border-t-2 border-gray-800 w-64 mx-auto pt-2 mb-1"></div>
                        <p className="font-bold text-lg">Rector/a</p>
                    </div>
                    <div className="text-center">
                        <div className="border-t-2 border-gray-800 w-64 mx-auto pt-2 mb-1"></div>
                        <p className="font-bold text-lg">Vicerrector/a</p>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-12">
                    Fecha de emisión: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </footer>
        </div>
    );
};

export default TrainingCertificatePrintable;