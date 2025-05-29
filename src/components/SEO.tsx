import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const DEFAULT_TITLE = 'The Pop Guide: Funko Collection Tracker for the UK';
const DEFAULT_DESCRIPTION = 'The Pop Guide (TPG) is for Funko collectors in the UK!';
const DEFAULT_IMAGE = 'https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/pop-guide-logo-trans-white.svg';
const DEFAULT_URL = 'https://popguide.co.uk/';

const SEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = DEFAULT_URL,
}: SEOProps) => (
  <Helmet>
    {/* SEO and social */}
    <title>{title}</title>
    <meta name="description" content={description} />
    {/* Open Graph */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:url" content={url} />
    <meta property="og:type" content="website" />
    {/* Twitter Card */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
    <meta name="twitter:url" content={url} />
  </Helmet>
);

export default SEO; 