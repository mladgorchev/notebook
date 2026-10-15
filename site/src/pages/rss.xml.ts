import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { excerptOf, getTranslations } from '../lib/utils';

export async function GET(context: APIContext) {
	const translations = await getTranslations();
	return rss({
		title: 'Дхарма Слово',
		description: 'Преводи на будистки текстове и учения на български език.',
		site: context.site!,
		items: translations.map((t) => ({
			title: t.data.title,
			pubDate: t.data.date,
			description: excerptOf(t, 300),
			link: `/${t.id}/`,
		})),
		customData: '<language>bg</language>',
	});
}
