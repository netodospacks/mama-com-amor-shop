import React from "react";

interface PixIconProps {
  className?: string;
  size?: number;
}

export const PixIcon: React.FC<PixIconProps> = ({ className = "w-5 h-5", size = 20 }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-109.9-109.9 107.03-107.03h-12.231c-20.056 0-38.928 7.808-53.12 22l-76.693 76.693c-5.385 5.404-14.765 5.384-20.15 0l-76.989-76.989c-14.191-14.172-33.045-21.98-53.12-21.98H90.243l107.03 107.03-109.9 109.9h15.197z"
      />
    </svg>
  );
};

export default PixIcon;
