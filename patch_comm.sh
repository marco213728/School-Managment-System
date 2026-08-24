sed -i 's/props\.formalRequests\.filter/props.formalRequests.filter(r => r.institutionId === user?.institutionId).filter/g' pages/CommunicationsPage.tsx
