const fs = require('fs');
let content = fs.readFileSync('pages/DashboardPage.tsx', 'utf8');

content = content.replace(/\{ absenceRequests, onUpdateAbsenceRequests, schedule,/, "{ absenceRequests = [], onUpdateAbsenceRequests = () => {}, schedule,");

fs.writeFileSync('pages/DashboardPage.tsx', content);
