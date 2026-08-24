cat << 'INNER_EOF' > temp_layout.cjs
const fs = require('fs');
let content = fs.readFileSync('components/layout/DashboardLayout.tsx', 'utf8');

content = content.replace(/interface DashboardLayoutProps \{/, "interface DashboardLayoutProps {\n  absenceRequests: any[];\n  onUpdateAbsenceRequests: (r: any[]) => void;");

fs.writeFileSync('components/layout/DashboardLayout.tsx', content);
INNER_EOF
node temp_layout.cjs
