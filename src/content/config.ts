import { defineCollection, z } from 'astro:content';

const footnotes = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string().optional(),
  }),
});

const animals = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string().optional(),
  }),
});

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    order: z.number().optional(),
  }),
});

export const collections = {
  footnotes,
  animals,
  articles
};