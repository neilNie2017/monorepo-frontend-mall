/**
 * 通用按钮组件(MUI 封装)
 * variant: primary | ghost | text | danger
 * size: md | sm | lg
 */
import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

const VARIANT_MAP = {
  primary: "contained",
  ghost: "outlined",
  text: "text",
  danger: "outlined",
};

const SIZE_MAP = {
  sm: "small",
  md: "medium",
  lg: "large",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  block = false,
  color,
  ...rest
}) {
  return (
    <MuiButton
      variant={VARIANT_MAP[variant] || "contained"}
      size={SIZE_MAP[size] || "medium"}
      fullWidth={block}
      color={color || (variant === "danger" ? "error" : "primary")}
      disabled={disabled || loading}
      startIcon={
        loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : undefined
      }
      {...rest}
    >
      {children}
    </MuiButton>
  );
}
