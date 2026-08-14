type IconArrowProps = {
  size?: number;
};

export function IconArrow({ size = 13 }: IconArrowProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 7h10M8.2 3.2 12 7l-3.8 3.8"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function IconArrowLeft({ size = 15 }: IconArrowProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 7H2m3.8-3.8L2 7l3.8 3.8"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
