const fs = require('fs');
const file = 'src/components/TaskDetailModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// We need to filter userPool for the <select> mapping.
// Find the select element for assignee
const searchStr = '{userPool.map((user) => (';
const replaceStr = '{userPool.filter(u => {\n                        if (!taskProject) return true;\n                        return taskProject.ownerId === u.id || (taskProject.collaboratorIds || []).includes(u.id);\n                      }).map((user) => (';

if (content.includes(searchStr)) {
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log('TaskDetailModal updated');
} else {
  console.log('TaskDetailModal string not found');
}
