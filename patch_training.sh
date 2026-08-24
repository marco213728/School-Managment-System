sed -i 's/const { user } = useContext(UserContext);/const { user } = useContext(UserContext);\n    const institution = user?.institutionId;\n    const filteredPlans = trainingPlans.filter(p => p.institutionId === institution);/g' pages/TeacherTrainingPage.tsx
sed -i 's/trainingPlans\.map/filteredPlans.map/g' pages/TeacherTrainingPage.tsx
sed -i 's/trainingPlans\.map/filteredPlans.map/g' pages/TeacherTrainingPage.tsx
