const fs = require('fs');
let content = fs.readFileSync('components/inspection/InspectorSustituciones.tsx', 'utf8');

content = content.replace(/    <\/div>\n\n    \{isFormOpen && \(/, '    </div></>\n  );\n};\n/*    {isFormOpen && (');
content = content.replace(/  \);\n\};\n$/, '*/');

fs.writeFileSync('components/inspection/InspectorSustituciones.tsx', content);
