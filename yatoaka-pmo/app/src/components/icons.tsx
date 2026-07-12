import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const base = (path: React.ReactNode) =>
  function Icon(props: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        width={20}
        height={20}
        {...props}
      >
        {path}
      </svg>
    );
  };

export const IconHome = base(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-6h6v6" />
  </>
);
export const IconFolder = base(
  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
);
export const IconList = base(
  <>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="3.5" cy="6" r="1" />
    <circle cx="3.5" cy="12" r="1" />
    <circle cx="3.5" cy="18" r="1" />
  </>
);
export const IconCalendar = base(
  <>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v3M16 3v3" />
  </>
);
export const IconChat = base(
  <path d="M4 5h16v11H8l-4 4z" />
);
export const IconUsers = base(
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 5.5a3 3 0 0 1 0 5.5M21 20a6 6 0 0 0-4-5.6" />
  </>
);
export const IconDoc = base(
  <>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4M9 13h6M9 17h6" />
  </>
);
export const IconChart = base(
  <>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <rect x="7" y="12" width="3" height="6" />
    <rect x="12" y="8" width="3" height="10" />
    <rect x="17" y="14" width="3" height="4" />
  </>
);
export const IconSparkles = base(
  <>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
    <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" />
  </>
);
export const IconGauge = base(
  <>
    <path d="M4 18a8 8 0 1 1 16 0" />
    <path d="M12 18l4-5" />
  </>
);
export const IconSettings = base(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
  </>
);
export const IconBell = base(
  <>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>
);
export const IconSearch = base(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>
);
export const IconHelp = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3M12 17h.01" />
  </>
);
export const IconMenu = base(<path d="M4 6h16M4 12h16M4 18h16" />);
export const IconChevronDown = base(<path d="m6 9 6 6 6-6" />);
export const IconChevronRight = base(<path d="m9 6 6 6-6 6" />);
export const IconChevronLeft = base(<path d="m15 6-6 6 6 6" />);
export const IconPlus = base(<path d="M12 5v14M5 12h14" />);
export const IconAlert = base(
  <>
    <path d="M12 3 2 20h20z" />
    <path d="M12 10v4M12 17h.01" />
  </>
);
export const IconClock = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>
);
export const IconCheck = base(<path d="M20 6 9 17l-5-5" />);
export const IconDownload = base(
  <>
    <path d="M12 3v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M5 21h14" />
  </>
);
export const IconUpload = base(
  <>
    <path d="M12 21V9" />
    <path d="m7 13 5-5 5 5" />
    <path d="M5 3h14" />
  </>
);
export const IconFilter = base(<path d="M3 5h18l-7 8v6l-4-2v-4z" />);
export const IconShield = base(
  <>
    <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z" />
    <path d="m9.5 12 2 2 3.5-4" />
  </>
);
export const IconEdit = base(
  <>
    <path d="M4 20h4L18 10l-4-4L4 16z" />
    <path d="m14 6 4 4" />
  </>
);
export const IconCopy = base(
  <>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </>
);
export const IconTrash = base(
  <>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </>
);
export const IconDots = base(
  <>
    <circle cx="12" cy="5" r="1.4" />
    <circle cx="12" cy="12" r="1.4" />
    <circle cx="12" cy="19" r="1.4" />
  </>
);
export const IconTarget = base(
  <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" />
  </>
);
export const IconTrophy = base(
  <>
    <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
    <path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3" />
    <path d="M12 12v4M9 20h6M10 16h4l1 4H9z" />
  </>
);
export const IconLightbulb = base(
  <>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 1 4 10.5c-.8.7-1 1.2-1 2.5H9c0-1.3-.2-1.8-1-2.5A6 6 0 0 1 12 3z" />
  </>
);
export const IconLink = base(
  <>
    <path d="M9 15 15 9" />
    <path d="M10 6.5 12 4.5a4 4 0 0 1 6 6l-2 2" />
    <path d="M14 17.5 12 19.5a4 4 0 0 1-6-6l2-2" />
  </>
);
export const IconGrid = base(
  <>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </>
);
export const IconThumbUp = base(
  <path d="M7 10v10H4V10zM7 10l4-7a2 2 0 0 1 3 2l-1 5h5a2 2 0 0 1 2 2l-1.5 6a2 2 0 0 1-2 1.5H7" />
);
export const IconThumbDown = base(
  <path d="M17 14V4h3v10zM17 14l-4 7a2 2 0 0 1-3-2l1-5H6a2 2 0 0 1-2-2l1.5-6A2 2 0 0 1 7.5 4H17" />
);
