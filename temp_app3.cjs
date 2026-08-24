const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

content = content.replace(/            onUpdateCronogramaEvents=\{handleUpdateCronogramaEvents\}/, "            onUpdateCronogramaEvents={handleUpdateCronogramaEvents}\n            absenceRequests={absenceRequests}\n            onUpdateAbsenceRequests={setAbsenceRequests}");

fs.writeFileSync('App.tsx', content);
