export type ArticleListItem = {
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  datePublished: string;
  dateModified?: string;
};

export type ArticleDetail = ArticleListItem & {
  bodyHtml: string;
};
