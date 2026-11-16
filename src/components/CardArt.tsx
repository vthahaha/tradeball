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
    case "lunar":
      return s(
        <>
          <ellipse cx="12" cy="12" rx="7.5" ry="6.5" fill="currentColor" />
          <rect x="9" y="3.5" width="6" height="2" fill="currentColor" />
          <rect x="9" y="18.5" width="6" height="2" fill="currentColor" />
          <path d="M12 20.5V23" stroke="currentColor" strokeWidth="1.6" />
        </>,
      );
    case "dotd":
      return s(
        <path
          fillRule="evenodd"
          d="M12 2.5a8 8 0 0 0-8 8c0 3 1.6 5.4 4 6.6v4.4h8v-4.4c2.4-1.2 4-3.6 4-6.6a8 8 0 0 0-8-8ZM7.2 11a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0-3.8 0ZM13 11a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0-3.8 0Z"
          fill="currentColor"
        />,
      );
    case "thirdeye":
      return s(
        <>
          <path
            d="M12 2.5Q19 12 12 21.5Q5 12 12 2.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="2.6" fill="currentColor" />
        </>,
      );
    case "iconic":
      return s(
        <>
          <path d="M5 21C3 15 6 9 4 3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M19 21c2-6-1-12 1-18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
          <path d="M12 8.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="currentColor" />
        </>,
      );
    case "passports":
      return s(
        <>
          <rect x="5" y="2.5" width="14" height="19" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="10.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8.5 17h7" stroke="currentColor" strokeWidth="1.6" />
        </>,
      );
    case "snipers":
      return s(
        <path d="M3 21v-4a9 9 0 0 1 18 0v4" fill="none" stroke="currentColor" strokeWidth="2.2" />,
      );
    case "dimers":
      return s(
        <>
          <path d="M3 18L10 9l5 6 6-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M21 4l-4.6 1.4 3.4 2.8z" fill="currentColor" />
        </>,
      );
    case "snatchers":
      return s(
        <>
          <rect x="5" y="3" width="14" height="8" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M7.5 13h9M8.5 13l1.5 7M15.5 13l-1.5 7M12 13v7" stroke="currentColor" strokeWidth="1.8" />
        </>,
      );
    case "thanksgiving":
      return s(<path d="M12 2l1.6 4.4 3.8-2.2-.9 4.6 4.5.5-3.4 3 3 3.5-4.6.3.4 4.7L12 18l-4.4 2.8.4-4.7-4.6-.3 3-3.5-3.4-3 4.5-.5-.9-4.6 3.8 2.2z" fill="currentColor" />);
    case "sparkplug":
      return s(<path d="M13 2L4 14h7l-2 8 9-12h-7z" fill="currentColor" />);
    case "villains":
      return s(
        <>
          <path d="M5 21C2 15 3 7 7 3c0 6 2 10 6 12zM19 21c3-6 2-14-2-18 0 6-2 10-6 12z" fill="currentColor" />
        </>,
      );
    case "circus":
      return s(
        <>
          <path d="M12 2L3 10h18z" fill="currentColor" />
          <path d="M5 10v11h14V10M12 10v11M8.5 10l-1 11M15.5 10l1 11" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </>,
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
