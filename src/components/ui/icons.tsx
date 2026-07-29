export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M2 7H12M12 7L8 3M12 7L8 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CourtIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2.5" width="12" height="11" rx="1" />
      <path d="M8 2.5v11M2 8h12" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M2.5 7.5 5.5 10.5 11.5 3.5" />
    </svg>
  );
}

/** Right-pointing chevron; rotate with a class for the other directions. */
export function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

/** Shuttlecock, marking who holds serve in the point-by-point history. */
export function ShuttleIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M6 1 3.1 7.2h5.8L6 1Z" />
      <path d="M4.6 4h2.8M3.9 5.6h4.2M6 1v6.2" />
      <path
        d="M4.4 7.2h3.2l-.5 2.3a1.2 1.2 0 0 1-2.2 0l-.5-2.3Z"
        fill="currentColor"
        fillOpacity="0.35"
      />
    </svg>
  );
}

/** Stadium/scoreboard mark used by the match information rows. */
export function StadiumIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
      <path d="M4.5 6v4M8 6v4M11.5 6v4" />
    </svg>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  );
}

export function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="15"
      viewBox="0 0 24 15"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
    >
      <g clipPath="url(#clip0_260_14620)">
        <g clipPath="url(#clip1_260_14620)">
          <path
            d="M0 1.5C0 0.671573 0.671573 0 1.5 0H22.5C23.3284 0 24 0.671573 24 1.5C24 2.32843 23.3284 3 22.5 3H1.5C0.671573 3 0 2.32843 0 1.5Z"
          />
          <path
            d="M5 7.5C5 6.67157 5.67157 6 6.5 6H17.5C18.3284 6 19 6.67157 19 7.5C19 8.32843 18.3284 9 17.5 9H6.5C5.67157 9 5 8.32843 5 7.5Z"
          />
          <path
            d="M2 13.5C2 12.6716 2.67157 12 3.5 12H20.5C21.3284 12 22 12.6716 22 13.5C22 14.3284 21.3284 15 20.5 15H3.5C2.67157 15 2 14.3284 2 13.5Z"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_260_14620">
          <rect width="24" height="15" fill="white" />
        </clipPath>
        <clipPath id="clip1_260_14620">
          <rect width="24" height="15" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
    >
      <g clip-path="url(#clip0_359_5411)">
        <path
          d="M12.5822 23.2602L12.5932 23.2582C12.6018 23.2595 12.6075 23.2655 12.6102 23.2762L12.6272 23.7032L12.6232 23.7202L12.6112 23.7362L12.5072 23.8102L12.4952 23.8142L12.4802 23.8102L12.3762 23.7362L12.3662 23.7232L12.3612 23.7032L12.3782 23.2752L12.3822 23.2652C12.3875 23.2585 12.3955 23.2568 12.4062 23.2602L12.4772 23.2952L12.4912 23.2992L12.5112 23.2952L12.5822 23.2602Z"
        />
        <path
          d="M12.8452 23.1472L12.8582 23.1452C12.8682 23.1478 12.8748 23.1552 12.8782 23.1672L12.9122 23.7812L12.9082 23.7952C12.9015 23.8038 12.8918 23.8065 12.8792 23.8032L12.6782 23.7102L12.6702 23.7032L12.6652 23.6912L12.6472 23.2612L12.6502 23.2502L12.6602 23.2402L12.8452 23.1472Z"
        />
        <path
          d="M12.1285 23.1448C12.1335 23.1436 12.1388 23.1445 12.1432 23.1472L12.3272 23.2392L12.3372 23.2492L12.3402 23.2612L12.3232 23.6912L12.3192 23.7022L12.3092 23.7102L12.1082 23.8032L12.0932 23.8052C12.0825 23.8012 12.0768 23.7932 12.0762 23.7812L12.1102 23.1672L12.1162 23.1532C12.119 23.1489 12.1234 23.1459 12.1285 23.1448Z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.0001 14.1219L17.3031 19.4249C17.5845 19.7063 17.9661 19.8643 18.3641 19.8643C18.762 19.8643 19.1437 19.7063 19.4251 19.4249C19.7065 19.1435 19.8646 18.7618 19.8646 18.3639C19.8646 17.9659 19.7065 17.5843 19.4251 17.3029L14.1201 11.9999L19.4241 6.69687C19.5634 6.55753 19.6738 6.39213 19.7492 6.21011C19.8245 6.02809 19.8633 5.83301 19.8632 5.63601C19.8632 5.43901 19.8243 5.24395 19.7489 5.06197C19.6735 4.87998 19.5629 4.71463 19.4236 4.57537C19.2843 4.4361 19.1189 4.32564 18.9368 4.25029C18.7548 4.17495 18.5597 4.13619 18.3627 4.13624C18.1657 4.13629 17.9707 4.17513 17.7887 4.25056C17.6067 4.326 17.4414 4.43653 17.3021 4.57587L12.0001 9.87887L6.69709 4.57587C6.55879 4.43254 6.39333 4.31819 6.21036 4.23949C6.02739 4.16079 5.83058 4.11932 5.63141 4.11749C5.43224 4.11567 5.23471 4.15353 5.05033 4.22886C4.86595 4.3042 4.69842 4.4155 4.55752 4.55627C4.41661 4.69704 4.30515 4.86447 4.22964 5.04878C4.15414 5.23308 4.11609 5.43059 4.11773 5.62975C4.11936 5.82892 4.16065 6.02577 4.23917 6.20881C4.3177 6.39186 4.43189 6.55743 4.57509 6.69587L9.88009 11.9999L4.57609 17.3039C4.43289 17.4423 4.3187 17.6079 4.24017 17.7909C4.16165 17.974 4.12036 18.1708 4.11873 18.37C4.11709 18.5691 4.15514 18.7666 4.23064 18.951C4.30615 19.1353 4.41761 19.3027 4.55852 19.4435C4.69942 19.5842 4.86695 19.6955 5.05133 19.7709C5.23571 19.8462 5.43324 19.8841 5.63241 19.8822C5.83158 19.8804 6.02839 19.8389 6.21136 19.7602C6.39433 19.6815 6.55979 19.5672 6.69809 19.4239L12.0001 14.1219Z"
        />
      </g>
      <defs>
        <clipPath id="clip0_359_5411">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  );
}

export function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="25"
      viewBox="0 0 15 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* currentColor, not a fixed white: the mobile menu draws it on white */}
      <path
        d="M11.4033 2.585C10.7769 1.86957 10.4316 0.950949 10.4317 0H7.59917V11.3667C7.57777 11.9819 7.31823 12.5648 6.87528 12.9924C6.43234 13.4199 5.84063 13.6587 5.225 13.6583C3.92333 13.6583 2.84167 12.595 2.84167 11.275C2.84167 9.69833 4.36333 8.51583 5.93083 9.00167V6.105C2.76833 5.68333 0 8.14 0 11.275C0 14.3275 2.53 16.5 5.21583 16.5C8.09417 16.5 10.4317 14.1625 10.4317 11.275V5.50917C11.5802 6.33403 12.9593 6.77659 14.3733 6.77417V3.94167C14.3733 3.94167 12.65 4.02417 11.4033 2.585Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
