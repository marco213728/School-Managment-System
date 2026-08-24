const fs = require('fs');
let content = fs.readFileSync('components/inspection/InspectorSustituciones.tsx', 'utf8');

content = content.replace(/  docenteTitular: string;/, '  docenteTitular: string;\n  docenteTitularId: string;');

content = content.replace(/                docenteTitular: teacher\?\.name \|\| 'Desconocido',/, '                docenteTitular: teacher?.name || \'Desconocido\',\n                docenteTitularId: teacher?.id || \'\',');

fs.writeFileSync('components/inspection/InspectorSustituciones.tsx', content);
