/**
 * 通用输入框组件(MUI TextField 封装)
 * 支持 label、error(显示为 error + helperText)、hint(提示文本)
 */
import TextField from "@mui/material/TextField";

export default function Input({
  label,
  error,
  hint,
  type = "text",
  placeholder,
  value,
  onChange,
  fullWidth = true,
  margin = "normal",
  ...rest
}) {
  return (
    <TextField
      label={label}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      fullWidth={fullWidth}
      margin={margin}
      error={!!error}
      helperText={error || hint}
      {...rest}
    />
  );
}
