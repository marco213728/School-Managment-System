sed -i 's/records={staffAttendanceRecords}/records={staffAttendanceRecords.filter(r => institutionData.users.some(u => u.id === r.userId))}/g' pages/ManagePage.tsx
