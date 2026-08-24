sed -i 's/conflictMediations\.filter(c => c\.derivedToDece)/conflictMediations.filter(c => c.derivedToDece \&\& c.institutionId === user?.institutionId)/g' pages/DecePage.tsx
