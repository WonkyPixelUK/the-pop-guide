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
    {/* Favicons and manifest */}
    <link rel="icon" type="image/png" href="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Favicon/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Favicon/favicon.svg" />
    <link rel="shortcut icon" href="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Favicon/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Favicon/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="The Pop Guide" />
    <link rel="manifest" href="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Favicon/site.webmanifest" />
    <meta name="theme-color" content="#18181b" />
    <link rel="icon" type="image/png" sizes="192x192" href="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Favicon/web-app-manifest-192x192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="https://Maintainhq-pull-zone.b-cdn.net/02_the_pop_guide/Favicon/web-app-manifest-512x512.png" />
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