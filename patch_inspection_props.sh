sed -i '/users: User\[\];/a\
    schedule: ScheduleEntry\[\];\
    subjects: Subject\[\];\
    staffAttendanceRecords: StaffAttendanceRecord\[\];' pages/InspectionPage.tsx

sed -i 's/        gradebooks = \[\], subjects = \[\] \/\/ Defaults/        gradebooks = \[\], subjects = \[\], schedule = \[\], staffAttendanceRecords = \[\] \/\/ Defaults/g' pages/InspectionPage.tsx
