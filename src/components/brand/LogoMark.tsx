import { logoMark } from "./art";

type LogoMarkProps = Omit<React.SVGProps<SVGSVGElement>, "children"> & {
  className?: string;
  /** "color" is the primary logo; "mono" uses currentColor; "inverse" is cream for teal or dark grounds. */
  variant?: "color" | "mono" | "inverse";
  /** Accessible name. Leave out when the English name sits next to the mark. */
  label?: string;
};

/** The geometric Urdu mark, دیکھ کھاؤ, traced from the brand sheet. */
export function LogoMark({ className = "", variant = "color", label, ...rest }: LogoMarkProps) {
  // Paint order keeps the overlaps the sheet shows: yellow under orange, teal over both.
  const order = ["yellow", "orange", "teal", "pink"];
  const layers = [...logoMark.layers].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  return (
    <svg
      viewBox={logoMark.viewBox}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      {layers.map((layer) => (
        <path
          key={layer.name}
          data-layer={layer.name}
          d={layer.d}
          // The traced paths carry their cut-outs (the pizza slices, the star) as inner sub-paths.
          fillRule="evenodd"
          fill={variant === "color" ? layer.fill : variant === "inverse" ? "#faf9f4" : "currentColor"}
        />
      ))}
    </svg>
  );
}
