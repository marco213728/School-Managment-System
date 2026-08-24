sed -i 's/MOCK_PERFORMANCE_EVALUATIONS,/MOCK_PERFORMANCE_EVALUATIONS,\n  MOCK_ABSENCE_REQUESTS,/g' App.tsx
sed -i 's/const \[performanceEvaluations, setPerformanceEvaluations\] = useState/const \[absenceRequests, setAbsenceRequests\] = useState(MOCK_ABSENCE_REQUESTS);\n  const \[performanceEvaluations, setPerformanceEvaluations\] = useState/g' App.tsx
sed -i 's/performanceEvaluations={performanceEvaluations}/performanceEvaluations={performanceEvaluations}\n            absenceRequests={absenceRequests}\n            onUpdateAbsenceRequests={setAbsenceRequests}/g' App.tsx
