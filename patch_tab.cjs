const fs = require('fs');
let content = fs.readFileSync('pages/InspectionPage.tsx', 'utf8');
content = content.replace(
    `<button\n                        onClick={() => setActiveTab('coexistence')}`,
    `<button\n                        onClick={() => setActiveTab('substitutions')}\n                        className={\`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors \${activeTab === 'substitutions' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}\`}\n                    >\n                        <div className="flex items-center gap-2"><ClipboardListIcon className="h-5 w-5"/> Sustituciones y Ausentismo</div>\n                    </button>\n                    <button\n                        onClick={() => setActiveTab('coexistence')}`
);
fs.writeFileSync('pages/InspectionPage.tsx', content);
