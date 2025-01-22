import '@fontsource/questrial';
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

export const ElephantoScreen = ({
  isPlayable = true,
}: {
  isPlayable?: boolean;
}): JSX.Element => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  const handleVideoClick = () => {
    if (!isPlayable) return;
    if (!videoRef.current || !isVideoLoaded) return;

    setIsPlaying((prevState) => {
      if (prevState) {
        videoRef.current?.pause();
      } else {
        videoRef.current?.play();
      }
      return !prevState;
    });
  };

  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
  };

  return (
    <div
      className="h-lvh w-full relative select-none cursor-pointer"
      onClick={handleVideoClick}
    >
      <div className="absolute bottom-0 left-0 m-5 z-10">
        <Logo />
      </div>

      <video
        ref={videoRef}
        src="src/assets/elephanto_1.mp4"
        className={`h-lvh w-full object-cover absolute top-0 left-0 transition-opacity duration-300 ${
          isPlaying && isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        autoPlay={isPlaying}
        loop
        muted
        controls={false}
        preload="auto"
        onLoadedData={handleVideoLoaded}
      />

      <img
        src="src/assets/elephanto_1.webp"
        alt="Home Screen"
        className={`h-lvh w-full object-cover absolute top-0 left-0 transition-opacity duration-300 ${
          isPlaying && isVideoLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};

export default Logo;
