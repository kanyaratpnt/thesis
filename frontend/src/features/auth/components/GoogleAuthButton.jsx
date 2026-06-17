import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

export default function GoogleAuthButton({
  onSuccess,
  onError,
  text = "signin_with",
  locale = "th",
  maxWidth = 400,
}) {
  const wrapperRef = useRef(null);
  const [width, setWidth] = useState(null);

  useEffect(() => {
    const measure = () => {
      const rawWidth = wrapperRef.current?.offsetWidth || 0;
      if (!rawWidth) return;
      const nextWidth = Math.min(Math.max(Math.floor(rawWidth), 140), maxWidth);
      setWidth((prev) => (prev === nextWidth ? prev : nextWidth));
    };

    measure();

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (observer && wrapperRef.current) observer.observe(wrapperRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [maxWidth]);

  return (
    <div className="lgGoogleWrapper" ref={wrapperRef}>
      {width ? (
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          width={width}
          text={text}
          locale={locale}
        />
      ) : (
        <div style={{ height: 40 }} />
      )}
    </div>
  );
}
