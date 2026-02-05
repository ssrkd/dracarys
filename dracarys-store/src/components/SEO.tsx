import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
    description = 'Откройте для себя коллекцию Dracarys — одежда, которая заявляет о себе качеством и стилем. Минимализм в каждой детали.',
    image = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200',
    url = window.location.href,
    type = 'website',
    noindex = false,
}) => {
    const siteName = 'dracarys.kz';
    const fullTitle = siteName;

    return (
        <Helmet>
            {/* Base Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};
