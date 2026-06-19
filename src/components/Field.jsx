import React from "react";

const Field = ({
  icon: Icon,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  rightSlot,
  disabled = false,
  required = false,
}) => {
  return (
    <div className="flex items-center gap-3 border border-[#0A0A0A]/15 rounded-md px-4 py-3 focus-within:border-indigo-500 transition-colors bg-white">
      {Icon && (
        <Icon className="w-4 h-4 text-[#0A0A0A]/40 shrink-0" />
      )}

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="sans flex-1 outline-none text-sm placeholder:text-[#0A0A0A]/35 bg-transparent disabled:cursor-not-allowed"
      />

      {rightSlot}
    </div>
  );
};

export default Field;