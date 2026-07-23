import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const articles = (await getCollection('articles')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: 'GuideCaméras',
    description: "Comparatifs, guides complets et astuces sur les caméras de vidéosurveillance.",
    site: context.site,
    items: articles.slice(0, 30).map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      link: `/articles/${entry.data.slug}/`,
    })),
  });
}
