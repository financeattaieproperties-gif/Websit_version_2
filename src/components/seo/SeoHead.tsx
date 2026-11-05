import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  SEO_CONFIG,
  getRuntimeSeoSettings,
  setRuntimeSeoSettings,
  type SeoMetadata,
} from '../../lib/seoConfig';
import {
  buildHeadTagDescriptors,
  generateMetaTagsByPath,
  syncDocumentMetaTags,
  type MetaTagContext,
} from '../../lib/metaTagService';
import { getSeoSettings, type SiteSeoSettings } from '../../lib/dbService';

interface SeoContextValue {
  settings: SiteSeoSettings | null;
}

const SeoContext = createContext<SeoContextValue>({ settings: null });

export const SeoSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSeoSettings | null>(() => getRuntimeSeoSettings());

  useEffect(() => {
    let active = true;
    getSeoSettings().then(data => {
      if (!active || !data) return;
      setRuntimeSeoSettings(data);
      setSettings(data);
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'attaie_seo_settings_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as SiteSeoSettings;
          setRuntimeSeoSettings(parsed);
          setSettings(parsed);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      active = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return <SeoContext.Provider value={{ settings }}>{children}</SeoContext.Provider>;
};

export function useSiteSeoSettings(): SiteSeoSettings | null {
  return useContext(SeoContext).settings;
}

export interface SeoHeadProps {
  /** Optional explicit SEO metadata override */
  seo?: Partial<SeoMetadata>;
  /** Optional dynamic route context (property, project, agent, careerJob, filters) */
  context?: MetaTagContext;
  /** Optional explicit path override (defaults to current router pathname + search) */
  path?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ seo, context, path }) => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const siteSettings = useSiteSeoSettings();

  const currentPath = path || `${location.pathname}${location.search}`;
  const language = context?.language || i18n.language || 'en';

  const resolvedSeo = useMemo(() => {
    return generateMetaTagsByPath(currentPath, {
      ...context,
      language,
      overrides: seo,
    });
  }, [currentPath, context, language, seo]);

  const siteName = siteSettings?.site_name?.trim() || SEO_CONFIG.siteName;
  const globalNoIndex =
    siteSettings?.robots_index !== undefined ? !siteSettings.robots_index : !SEO_CONFIG.robotsIndex;

  const globalKeywords = useMemo(() => {
    return siteSettings?.keywords
      ? siteSettings.keywords
          .split(',')
          .map(k => k.trim())
          .filter(Boolean)
      : [];
  }, [siteSettings?.keywords]);

  const headTags = useMemo(() => {
    return buildHeadTagDescriptors(resolvedSeo, {
      language,
      siteName,
      twitterCard: siteSettings?.twitter_card || SEO_CONFIG.twitterCard,
      twitterSite: siteSettings?.twitter_site?.trim() || SEO_CONFIG.twitterSite,
      globalKeywords,
      globalNoIndex,
    });
  }, [resolvedSeo, language, siteName, siteSettings, globalKeywords, globalNoIndex]);

  useEffect(() => {
    syncDocumentMetaTags(headTags);
  }, [headTags]);

  return (
    <Helmet prioritizeSeoTags>
      <html lang={headTags.htmlLang} dir={headTags.htmlDir} />
      <title>{headTags.title}</title>
      <link rel="canonical" href={headTags.canonicalUrl} />

      {headTags.metaTags.map(tag =>
        tag.property ? (
          <meta key={tag.key} property={tag.property} content={tag.content} />
        ) : (
          <meta key={tag.key} name={tag.name} content={tag.content} />
        )
      )}

      {/* Schema.org Structured Data (JSON-LD) */}
      {headTags.jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(headTags.jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
