import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Video } from 'lucide-react';

interface Props {
  url: string;
  title?: string;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

type VideoType = 'youtube' | 'vimeo' | 'direct';

function detectType(url: string): VideoType {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'direct';
}

export function VideoPlayer({ url, title = 'Property Video' }: Props) {
  const [playing, setPlaying] = useState(false);
  const type = detectType(url);

  const ytId = type === 'youtube' ? getYouTubeId(url) : null;
  const vmId = type === 'vimeo' ? getVimeoId(url) : null;

  const embedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`
    : vmId
    ? `https://player.vimeo.com/video/${vmId}?autoplay=1&title=0&byline=0&portrait=0`
    : null;

  const thumbnailSrc = ytId
    ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
    : null;

  return (
    <div
      className="bg-white rounded-2xl border border-brand-gold/10 overflow-hidden"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100">
        <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center">
          <Video size={16} className="text-brand-gold" />
        </div>
        <h2 className="text-base font-bold text-brand-navy">Property Video Tour</h2>
      </div>

      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {/* YouTube / Vimeo embed */}
        {embedSrc && playing && (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {/* Direct video */}
        {type === 'direct' && playing && (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={url}
            controls
            autoPlay
            title={title}
          />
        )}

        {/* Poster / play overlay */}
        {!playing && (
          <div className="absolute inset-0 bg-brand-navy">
            {thumbnailSrc && (
              <img
                src={thumbnailSrc}
                alt="Video thumbnail"
                className="w-full h-full object-cover opacity-70"
              />
            )}
            {!thumbnailSrc && (
              <div className="absolute inset-0 flex items-center justify-center islamic-pattern opacity-20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 to-transparent" />

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.button
                onClick={() => setPlaying(true)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                aria-label="Play video"
                className="w-18 h-18 rounded-full bg-brand-gold flex items-center justify-center shadow-gold-lg"
                style={{ width: 72, height: 72 }}
              >
                <Play size={30} fill="white" className="text-white ml-1" />
              </motion.button>
              <span className="text-white/80 text-sm font-medium">{title}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
