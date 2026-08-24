sed -i 's/export interface DashboardLayoutProps {/export interface DashboardLayoutProps {\n  absenceRequests: any\[\];\n  onUpdateAbsenceRequests: (r: any\[\]) => void;/g' components/layout/DashboardLayout.tsx
sed -i 's/<InspectionPage/<InspectionPage absenceRequests={props.absenceRequests} onUpdateAbsenceRequests={props.onUpdateAbsenceRequests}/g' components/layout/DashboardLayout.tsx
sed -i 's/<DashboardPage/<DashboardPage absenceRequests={props.absenceRequests} onUpdateAbsenceRequests={props.onUpdateAbsenceRequests}/g' components/layout/DashboardLayout.tsx
