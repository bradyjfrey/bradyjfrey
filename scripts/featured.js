const pool = [
    { slug: 'o-saint-confucius', title: 'O Saint Confucius', doi: '10.33774/coe-2026-m1pzr', text: 'The culmination of the Jesuit mission in China was works of philosophy reimagined and infused with contemporary Christian thought. These publications would chill Sino-European relations and serve as a “Confucius” enchiridion to a non-Chinese speaking world. I compare the Confucius Sinarum Philosophus against its...' },
    { slug: 'robots-in-disguise', title: 'Robots in Disguise', doi: '10.33774/coe-2026-4sk3k', text: 'The proliferation and public fascination for large language models (LLMs) using natural language understanding (NLU) have upended corporate investment, labor dynamics, and reinvigorated the term artificial...' },
    { slug: 'on-denoting-mandarin', title: 'On Denoting Mandarin', doi: '10.5281/zenodo.18488918', text: 'Bertrand Russell’s seminal On Denoting has played a central role in philosophical debates for over 100 years–asserting that phrases beginning with “the” are included in the same semantic classification as...' },
    { slug: 'ai-socially-constructed-kinds', title: 'AI\'s Influence on Socially Constructed Kinds', doi: '10.33774/coe-2026-2jtsw', text: 'The proliferation of long language models (LLMs) using natural language understanding (NLU) to engage human interaction with computer programs has captured the public’s imagination. The results have been a...' },
    { slug: 'ai-freedom-of-speech', title: 'AI & Freedom of Speech', doi: '10.33774/coe-2026-kjp5t', text: 'In their 2016 paper, Siri-Ously? Free Speech Rights and Artificial Intelligence,1 and its 2017 follow-up, SIRI-OUSLY 2.0: What Artificial Intelligence Reveals About the First Amendment,2 Massaro & Norton argue...' },
    { slug: 'intercultural-hermeneutics', title: 'Intercultural Hermeneutics and the Limits of Corporate Cross-Cultural Training', doi: '10.5281/zenodo.18489390', text: 'Although an adaptation mindset of the individual enables significant cultural bridging across diverse viewpoints, roadblocks develop related to actionable intercultural growth and intolerance in group settings...' }
];
const featured = document.querySelector('.paper');
if (featured) {
    const today = new Date();
    const monthIndex = (today.getFullYear() * 12 + today.getMonth()) % pool.length;
    const paper = pool[monthIndex];
    featured.querySelector('h3').textContent = paper.title;
    featured.querySelector('p').textContent = paper.text;
    featured.querySelector('.more').href = 'research/' + paper.slug + '.html';
    featured.querySelector('.doi').textContent = 'DOI: ' + paper.doi;
    const rowList = document.querySelector('.rows');
    const allRow = rowList.querySelector('.all');
    const paperRows = [...rowList.querySelectorAll('li[data-paper]')];
    paperRows.forEach(row => row.remove());
    paperRows.filter(row => row.dataset.paper !== paper.slug).slice(0, 5).forEach(row => {
        row.hidden = false;
        rowList.insertBefore(row, allRow);
    });
}
