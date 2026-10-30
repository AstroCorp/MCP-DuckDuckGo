import { searchDuckDuckGo } from '@/searchDuckDuckGo';
import { extractWebContent } from '@/extractWebContent';

const main = async () => {
	const results = await searchDuckDuckGo('W3Schools TypeScript Tutorial', 1);

	if (results.length === 0) {
		console.log('No results found');
		return;
	}

	const { title, url, description } = results[0];
	const { textContent } = await extractWebContent(url);

	console.log(`Title: ${title}`);
	console.log(`URL: ${url}`);
	console.log(`Description: ${description}\n`);
	console.log(textContent);
};

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});

