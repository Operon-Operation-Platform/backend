"use client";

import React from "react";

export default function OperonLogo({ size = 28, showWordmark = true, variant = "dark" }) {
  const isLight = variant === "light";
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        style={{ width: size, height: size }}
        className="rounded-lg bg-blue-600 flex items-center justify-center p-1.5 shadow-sm shadow-blue-500/20 shrink-0"
      >
        <svg
          viewBox="0 0 48 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          <path
            fill="currentColor"
            d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
          />
        </svg>
      </div>
      {showWordmark && (
        <span
          className={`font-extrabold tracking-tight text-base font-sans ${
            isLight ? "text-white" : "text-slate-900"
          }`}
        >
          OPERON
        </span>
      )}
    </div>
  );
}
