cat << 'INNER_EOF' > temp_app.cjs
const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace(/import \{ DashboardLayout \} from '\.\/components\/layout\/DashboardLayout';/, "import { DashboardLayout } from './components/layout/DashboardLayout';\nimport { AbsenceRequest } from './types';");
content = content.replace(/  const \[performanceEvaluations, setPerformanceEvaluations\] = useState/, "  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);\n  const [performanceEvaluations, setPerformanceEvaluations] = useState");
content = content.replace(/performanceEvaluations=\{performanceEvaluations\}/, "performanceEvaluations={performanceEvaluations}\n            absenceRequests={absenceRequests}\n            onUpdateAbsenceRequests={setAbsenceRequests}");

fs.writeFileSync('App.tsx', content);
INNER_EOF
node temp_app.cjs
