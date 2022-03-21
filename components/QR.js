import { useState, useEffect, useRef } from "react";
import createQRConfig from "./qrCodeConfig";
import styles from "./QRCode.module.css";

export default function QRCode({
  data,
  color,
  expired,
  animationDuration,
  onClick,
}) {
  const ref = useRef();
  const [qrCodeConfig] = useState(createQRConfig())

  useEffect(() => {
    qrCodeConfig.append(ref.current);
  }, []);

  useEffect(() => {
    qrCodeConfig.update({ data });
  }, [data]);

  return (
    <div className={styles.root}>
      {!expired &&
        <div className={styles.svgBorderContainer} onClick={onClick}>
          <svg width="240px" height="240px" viewBox="0 0 240 240">
            <rect
              x="2"
              y="2"
              width="236"
              height="236"
              fill="none"
              stroke={color}
              strokeWidth="4"
              rx="28"
            />
          </svg>
          <svg width="240px" height="240px" viewBox="0 0 240 240">
            <rect
              x="2"
              y="2"
              width="236"
              height="236"
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="6"
              strokeDashoffset={960}
              strokeDasharray={960}
              rx="28"
              style={{ animationDuration: expired ? 0 : `${animationDuration}s` }}
            />
          </svg>
        </div>
      }
      <div
        className={`${styles.qrCodeContainer} ${
          expired ? styles.expired : undefined
        }`}
        ref={ref}
      />
    </div>
  );
}
