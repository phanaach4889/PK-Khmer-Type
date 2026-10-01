const fs = require('fs');
for (const course of ['english', 'standard', 'nida']) {
  const path = `data/curriculum/${course}/lessons.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  for (const lesson of data.lessons) {
    if (lesson.level.endsWith('L12')) lesson.timeLimit = 60;
    if (lesson.level.endsWith('L13')) lesson.timeLimit = 180;
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}
