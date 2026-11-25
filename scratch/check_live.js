const fs = require('fs');
fetch('https://botieuchidoan.io.vn/index.html?t=' + Date.now()).then(r => r.text()).then(html => {
  const m = html.match(/app\.js\?v=([^"]+)/);
  console.log('index.html script tag:', m ? m[0] : 'not found');
  const b = html.match(/CURRENT_BUILD_TS = (\d+)/);
  console.log('CURRENT_BUILD_TS:', b ? b[1] : 'not found');
});
fetch('https://botieuchidoan.io.vn/app.js?t=' + Date.now()).then(r => r.text()).then(code => {
  const hasAntiSpam = code.includes('_recentToasts');
  const hasComputeSha = code.includes('computeGitBlobSha');
  console.log('app.js has _recentToasts:', hasAntiSpam);
  console.log('app.js has computeGitBlobSha:', hasComputeSha);
});
