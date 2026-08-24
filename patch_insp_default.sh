cat << 'INNER_EOF' > temp_insp.cjs
const fs = require('fs');
let content = fs.readFileSync('pages/InspectionPage.tsx', 'utf8');

content = content.replace(/absenceRequests, onUpdateAbsenceRequests \/\/ Defaults/, "absenceRequests = [], onUpdateAbsenceRequests = () => {} // Defaults");

fs.writeFileSync('pages/InspectionPage.tsx', content);
INNER_EOF
node temp_insp.cjs
