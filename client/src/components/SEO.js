import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, keywords, image, type = 'website', date }) => {
    const { pathname } = useLocation();
    const siteUrl = 'http://youtools-br.com'; // Replace with actual domain
    const siteName = 'YouTools - Ferramentas e Equipamentos';
    const defaultDescription = 'Encontre as melhores ferramentas e equipamentos na YouTools. Qualidade e variedade para profissionais e entusiastas.';
    const defaultImage = `${siteUrl}/Loading_Screen.png`; // Ensure this exists or use a logo

    const metaTitle = title ? `${title} | YouTools` : siteName;
    const metaDescription = description || defaultDescription;
    const metaUrl = `${siteUrl}${pathname}`;
    const metaImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={metaUrl} />
            <meta name="robots" content="index, follow" />
            <meta name="author" content="YouTools" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:locale" content="pt_BR" />
            {date && <meta property="article:published_time" content={date} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
