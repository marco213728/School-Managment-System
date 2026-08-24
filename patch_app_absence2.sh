cat << 'INNER_EOF' > temp_app2.cjs
const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Add state
content = content.replace(/  const \[cronogramaEvents, setCronogramaEvents\] = useState<CronogramaEvent\[\]>\(MOCK_CRONOGRAMA_EVENTS \|\| \[\]\);/, "  const [cronogramaEvents, setCronogramaEvents] = useState<CronogramaEvent[]>(MOCK_CRONOGRAMA_EVENTS || []);\n  const [absenceRequests, setAbsenceRequests] = useState<any[]>([]);");

// Add props
content = content.replace(/            cronogramaEvents=\{cronogramaEvents\}\n            onUpdateCronogramaEvents=\{setCronogramaEvents\}/, "            cronogramaEvents={cronogramaEvents}\n            onUpdateCronogramaEvents={setCronogramaEvents}\n            absenceRequests={absenceRequests}\n            onUpdateAbsenceRequests={setAbsenceRequests}");

fs.writeFileSync('App.tsx', content);
INNER_EOF
node temp_app2.cjs
