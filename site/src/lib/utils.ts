import { getCollection, type CollectionEntry } from 'astro:content';

export type Translation = CollectionEntry<'translations'>;

export async function getTranslations(): Promise<Translation[]> {
	const all = await getCollection('translations', ({ data }) => !data.draft);
	return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

const dateFormat = new Intl.DateTimeFormat('bg-BG', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

export function formatDate(date: Date): string {
	return dateFormat.format(date);
}

export function readingTime(body = ''): number {
	const words = body.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
}

// Streamlined Bulgarian transliteration, so tag URLs stay readable when shared.
const translit: Record<string, string> = {
	а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
	к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
	ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht', ъ: 'a', ь: 'y', ю: 'yu', я: 'ya',
};

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.split('')
		.map((ch) => translit[ch] ?? ch)
		.join('')
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function excerptOf(entry: Translation, length = 180): string {
	if (entry.data.excerpt) return entry.data.excerpt;
	const plain = (entry.body ?? '')
		.replace(/^#+\s.*$/gm, '')
		.replace(/[*_>`#\[\]()]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	return plain.length > length ? plain.slice(0, length).replace(/\s+\S*$/, '') + '…' : plain;
}
