import { chromium, type Browser, type Page } from 'playwright';
import { ExtractedContent } from '@/types';

// Elementos que no aportan contenido útil al texto
const REMOVE_SELECTORS = 'script, style, nav, footer, header, iframe, noscript, aside, .ad, .advertisement, [role="complementary"]';

// Recursos que no necesitamos para extraer texto
const BLOCKED_RESOURCES = new Set(['image', 'font', 'media']);

let browser: Browser | undefined;
let browserInit: Promise<Browser> | undefined;

/** Singleton: un solo Chromium reutilizado entre extracciones. */
const getBrowser = async (): Promise<Browser> => {
	if (browser) return browser;

	browserInit ??= chromium.launch({ headless: true }).then((instance) => {
		browser = instance;
		return instance;
	});

	return browserInit;
};

/** Precalienta el navegador antes de la primera extracción. */
export const warmupBrowser = async (): Promise<void> => {
	await getBrowser();
};

const createPage = async (): Promise<Page> => {
	const page = await (await getBrowser()).newPage();

	// Acelera la carga bloqueando recursos no textuales
	await page.route('**/*', (route) => {
		if (BLOCKED_RESOURCES.has(route.request().resourceType())) {
			return route.abort();
		}

		route.continue();
	});

	return page;
};

export const extractWebContent = async (url: string): Promise<ExtractedContent> => {
	const page = await createPage();

	try {
		// networkidle: espera a que el JS termine de cargar el contenido (CSR/SPA)
		await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

		// Limpia el DOM renderizado antes de leer el texto
		await page.locator(REMOVE_SELECTORS).evaluateAll((elements) => {
			elements.forEach((el) => el.remove());
		});

		const title = (await page.title()) || (await page.locator('h1').first().textContent())?.trim() || 'No title';
		const textContent = (await page.locator('body').textContent() ?? '').replace(/\s+/g, ' ').trim();

		return {
			url,
			title,
			textContent,
		};
	} finally {
		await page.close(); // Cierra la pestaña, el browser sigue vivo
	}
};

