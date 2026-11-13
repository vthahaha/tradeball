"use client";

// Small set marks for the binder's group headers. The cards themselves draw no scenes:
// each set is a photo treatment plus type (Card.tsx, InsertCard.tsx, globals.css).
import type { ReactNode } from "react";

export function SetIcon({ type }: { type: string }) {
  const s = (d: ReactNode) => (
    <svg viewBox="0 0 24 24" className="tb-card__seticon" aria-hidden>
      {d}
    </svg>
  );
  switch (type) {
    case "newblood":
      return s(
        <>
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M10 4 V20" stroke="currentColor" strokeWidth="2" />
          <rect
            x="3"
            y="4"
            width="7"
            height="16"
            fill="currentColor"
            opacity="0.45"
          />
        </>,
      );
    case "goodbyes":
      return s(
        <rect
          x="4"
          y="3"
          width="16"
          height="18"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />,
      );
    case "goldenboy":
      return s(
        <>
          <rect
            x="4"
            y="3"
            width="16"
            height="18"
            rx="1.5"
            fill="currentColor"
            opacity="0.3"
          />
          <path d="M7 17 H17" stroke="currentColor" strokeWidth="2.4" />
        </>,
      );
    case "generational":
      return s(
        <text
          x="12"
          y="17"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          83
        </text>,
      );
    case "stardom":
      return s(
        <path
          d="M4 20 L12 4 L20 20 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />,
      );
    case "light":
      return s(
        <circle
          cx="12"
          cy="12"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />,
      );
    case "shadow":
      return s(<circle cx="12" cy="12" r="8" fill="currentColor" />);
    case "fortress":
      return s(
        <>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
        </>,
      );
    case "cult":
      return s(
        <rect
          x="5"
          y="4"
          width="13"
          height="16"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          transform="rotate(-6 12 12)"
        />,
      );
    case "botb":
      return s(
        <>
          <path d="M5 21 V3" stroke="currentColor" strokeWidth="2.6" />
          <rect
            x="9"
            y="5"
            width="11"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </>,
      );
    case "rivalries":
      return s(
        <>
          <rect x="2" y="5" width="9" height="14" fill="currentColor" />
          <rect
            x="13"
            y="5"
            width="9"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </>,
      );
    case "flash":
      return s(
        <path d="M13 2 L5 13 H11 L9 22 L19 9 H13 Z" fill="currentColor" />,
      );
    case "wizards":
      return s(
        <>
          <circle cx="16" cy="12" r="5" fill="currentColor" />
          <circle cx="10" cy="12" r="5" fill="currentColor" opacity="0.45" />
          <circle cx="5" cy="12" r="4" fill="currentColor" opacity="0.2" />
        </>,
      );
    case "founders":
      return s(
        <rect
          x="4"
          y="3"
          width="16"
          height="18"
          rx="1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3 1.5"
        />,
      );
    case "dreamteam":
      return s(
        <>
          <path
            d="M3 15 H21 M3 19 H21"
            stroke="currentColor"
            strokeWidth="2.4"
          />
          <circle cx="7" cy="7" r="1.6" fill="currentColor" />
          <circle cx="12" cy="7" r="1.6" fill="currentColor" />
          <circle cx="17" cy="7" r="1.6" fill="currentColor" />
        </>,
      );
    default:
      return null;
  }
}
