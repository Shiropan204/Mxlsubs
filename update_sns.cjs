const fs = require('fs');

const mdContent = fs.readFileSync('C:/Users/excel/.gemini/antigravity-ide/brain/ba1ddee0-f951-4189-b359-dac8db9e6153/.system_generated/steps/31/content.md', 'utf-8');
const membersPath = 'c:/Users/excel/OneDrive/Dokumen/Mxlsubs/src/data/members.ts';
let membersTsContent = fs.readFileSync(membersPath, 'utf-8');

// A quick and dirty regex-based parser
const liRegex = /<li>[\s\S]*?<div class="txtSide">[\s\S]*?<p class="name">([^<]+)[\s\S]*?<ul class="snsList">([\s\S]*?)<\/ul>/g;

const extractedSns = {};

let match;
while ((match = liRegex.exec(mdContent)) !== null) {
  let name = match[1].trim().replace(/\s+/g, ' ');
  // In the HTML it's formatted like "大谷 映美里\n<span class="yomi">OTANI EMIRI</span>"
  // so the first capture group matches "大谷 映美里\n" which trims to "大谷 映美里"
  
  const snsHtml = match[2];
  const sns = {};
  
  const twitterMatch = snsHtml.match(/<li class="x_twitter"><a href="([^"]+)"/);
  if (twitterMatch) sns.twitter = twitterMatch[1];
  
  const instaMatch = snsHtml.match(/<li class="instagram"><a href="([^"]+)"/);
  if (instaMatch) sns.instagram = instaMatch[1];
  
  const tiktokMatch = snsHtml.match(/<li class="tiktok"><a href="([^"]+)"/);
  if (tiktokMatch) sns.tiktok = tiktokMatch[1];
  
  const showroomMatch = snsHtml.match(/<li class="showroom"><a href="([^"]+)"/);
  if (showroomMatch) sns.showroom = showroomMatch[1];
  
  const blogMatch = snsHtml.match(/<li class="ab"><a href="([^"]+)"/);
  if (blogMatch) sns.blog = blogMatch[1];

  // Map to the format we have in members.ts: '大谷 映美里'
  extractedSns[name] = sns;
}

// Now replace in members.ts
for (const [name, sns] of Object.entries(extractedSns)) {
  const memberObjRegex = new RegExp(`name:\\s*'${name}'[\\s\\S]*?imageUrl:\\s*'[^']+'\\s*`, 'g');
  
  membersTsContent = membersTsContent.replace(memberObjRegex, (match) => {
    let newMatch = match;
    if (Object.keys(sns).length > 0) {
      newMatch += `,\n    sns: ${JSON.stringify(sns, null, 6).replace(/}/g, '    }')}`;
    }
    return newMatch;
  });
}

fs.writeFileSync(membersPath, membersTsContent);
console.log('Updated members.ts');
