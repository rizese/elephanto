import '@fontsource/questrial'; // Imports Questrial font
import { useState, useRef, useEffect } from 'react';

const Logo = ({
  className = 'w-full',
}: {
  className?: string;
}): JSX.Element => {
  return (
    <div
      className={`flex flex-col tracking-tight text-neutral-950 font-questrial drop-shadow-logo ${className}`}
    >
      <h1 className="text-4xl">elephanto</h1>
      <p className="text-md text-neutral-950">alpha release</p>
    </div>
  );
};

export default Logo;

interface ElephantoScreenProps {
  playVideo?: boolean;
}

export const ElephantoScreen = ({
  playVideo = false,
}: ElephantoScreenProps): JSX.Element => {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playVideo) return;

    // Preload the video
    if (videoRef.current) {
      videoRef.current.load();
    }

    // Switch to video after a short delay to ensure loading
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [playVideo]);

  return (
    <div className="h-lvh w-full object-cover p-0 relative select-none">
      {!showVideo && (
        <img
          src="src/assets/elephanto_1.webp"
          alt="Home Screen"
          className="h-lvh w-full object-cover p-0"
        />
      )}
      <video
        ref={videoRef}
        src="src/assets/elephanto_1.mp4"
        className={`h-lvh w-full object-cover p-0 ${!showVideo ? 'hidden' : ''}`}
        autoPlay
        loop
        muted
        controls={false}
        preload="auto"
      />
    </div>
  );
};
