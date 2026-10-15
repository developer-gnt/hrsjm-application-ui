const fs = require('fs');
const imgPath = 'src/assets/id_card_bg.png';
const data = fs.readFileSync(imgPath);
const b64 = data.toString('base64');
console.log('Base64 size:', b64.length, 'chars');
const output = `export const ID_CARD_BG_BASE64 = 'data:image/png;base64,${b64}';`;
fs.writeFileSync('src/assets/idCardBgBase64.ts', output);
console.log('Written to src/assets/idCardBgBase64.ts successfully');
