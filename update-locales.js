const fs = require('fs')
for (const file of ['frontend/src/i18n/locales/en.json', 'frontend/src/i18n/locales/vi.json']) {
  const data = JSON.parse(fs.readFileSync(file))
  if (file.includes('en.json')) {
    data.survey.notOpen = "Survey Not Open Yet"
    data.survey.notOpenSub = "This survey is not accepting responses at this time."
    data.survey.opensAt = "Opens at"
  } else {
    data.survey.notOpen = "Khảo sát chưa mở"
    data.survey.notOpenSub = "Bài khảo sát này hiện tại chưa nhận phản hồi."
    data.survey.opensAt = "Mở lúc"
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}
