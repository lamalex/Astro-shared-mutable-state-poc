import { defineCollection, z } from 'astro:content';

const footnotes = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string().optional(),
  }),
});

export const collections = {
  footnotes,
};