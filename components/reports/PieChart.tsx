import React from 'react';

interface PieChartProps {
    data: {
        label: string;
        value: number;
        color: string;
    }[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-gray-500">No hay datos para mostrar.</p>;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    let cumulativePercentage = 0;
    const gradientParts = data.map(item => {
        const percentage = (item.value / total) * 100;
        const start = cumulativePercentage;
        cumulativePercentage += percentage;
        const end = cumulativePercentage;
        return `${item.color} ${start}% ${end}%`;
    });

    const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;

    return (
        <div className="flex flex-col md:flex-row items-center gap-8 p-4">
            <div 
                className="w-48 h-48 rounded-full border-4 border-gray-100 shadow-md"
                style={{
                    backgroundImage: conicGradient,
                }}
                role="img"
                aria-label="Gráfico de tarta de asistencia"
            ></div>
            <div className="flex-shrink-0 w-full md:w-auto">
                <h4 className="font-semibold text-gray-700 mb-2 text-center md:text-left">Leyenda</h4>
                <ul className="space-y-2 text-sm">
                    {data.map((item, index) => (
                        <li key={index} className="flex items-center">
                            <span 
                                className="w-4 h-4 rounded-sm mr-3 flex-shrink-0" 
                                style={{ backgroundColor: item.color }}
                            ></span>
                            <span className="text-gray-600 font-medium">{item.label}:</span>
                            <span className="text-gray-800 ml-2 font-semibold">{item.value}</span>
                            <span className="text-gray-500 ml-1">({((item.value / total) * 100).toFixed(1)}%)</span>
                        </li>
                    ))}
                     <li className="flex items-center pt-2 border-t mt-2">
                        <span 
                            className="w-4 h-4 rounded-sm mr-3 flex-shrink-0 bg-gray-700"
                        ></span>
                        <span className="text-gray-600 font-bold">Total:</span>
                        <span className="text-gray-800 ml-2 font-bold">{total}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default PieChart;
