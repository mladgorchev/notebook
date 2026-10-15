import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const translations = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/translations' }),
	schema: z.object({
		title: z.string(),
		subtitle: z.string().optional(),
		date: z.coerce.date(),
		teacher: reference('teachers').optional(),
		translator: z.string(),
		tradition: z.string().optional(),
		original_language: z.string().optional(),
		source: z.string().optional(),
		tags: z.array(z.string()).default([]),
		excerpt: z.string().optional(),
		cover: z.string().optional(),
		featured: z.boolean().default(false),
		draft: z.boolean().default(false),
	}),
});

const teachers = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/teachers' }),
	schema: z.object({
		name: z.string(),
		dates: z.string().optional(),
		tradition: z.string().optional(),
		region: z.string().optional(),
		summary: z.string(),
		portrait: z.string().optional(),
	}),
});

export const collections = { translations, teachers };
