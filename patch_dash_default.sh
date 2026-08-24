cat << 'INNER_EOF' > temp_dash_d.cjs
const fs = require('fs');
let content = fs.readFileSync('pages/DashboardPage.tsx', 'utf8');

content = content.replace(/\{ absenceRequests, onUpdateAbsenceRequests, schedule,/, "{ absenceRequests = [], onUpdateAbsenceRequests = () => {}, schedule,");

fs.writeFileSync('pages/DashboardPage.tsx', content);
INNER_EOF
node temp_dash_d.cjs
