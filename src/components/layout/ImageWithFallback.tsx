//ImageWithFallback.tsx
import React, { useState } from 'react';


type Props = React.ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc: string };


export function ImageWithFallback({ src, fallbackSrc, onError, ...rest }: Props) {
  const [currentSrc, setCurrentSrc] = useState(src);


  return (
    <img
      {...rest}
      src={currentSrc}
      onError={(e) => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        onError?.(e as any);
      }}
    />
  );
}


