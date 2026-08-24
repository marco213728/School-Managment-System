sed -i '/const \[evaluations\] = useState<PerformanceEvaluation\[\]>(MOCK_PERFORMANCE_EVALUATIONS);/a\
\    const { institution } = useContext(InstitutionContext);\
\    const filteredUsers = users.filter(u => u.institutionId === institution?.id);\
\    const filteredVacancies = vacancies.filter(v => v.institutionId === institution?.id);\
\    const filteredCandidates = candidates.filter(c => filteredVacancies.some(v => v.id === c.vacancyId));\
\    const filteredEvaluations = evaluations.filter(e => e.institutionId === institution?.id);\
\    const filteredAttendance = staffAttendanceRecords.filter(r => filteredUsers.some(u => u.id === r.userId));' components/management/HRISDashboard.tsx

sed -i 's/users\.filter/filteredUsers.filter/g' components/management/HRISDashboard.tsx
sed -i 's/users\.find/filteredUsers.find/g' components/management/HRISDashboard.tsx
sed -i 's/vacancies\.map/filteredVacancies.map/g' components/management/HRISDashboard.tsx
sed -i 's/vacancies\.find/filteredVacancies.find/g' components/management/HRISDashboard.tsx
sed -i 's/candidates\.filter/filteredCandidates.filter/g' components/management/HRISDashboard.tsx
sed -i 's/evaluations\.map/filteredEvaluations.map/g' components/management/HRISDashboard.tsx
sed -i 's/staffAttendanceRecords\.map/filteredAttendance.map/g' components/management/HRISDashboard.tsx
sed -i 's/staffAttendanceRecords\.length/filteredAttendance.length/g' components/management/HRISDashboard.tsx

