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
    <div
      className="
        w-full
        min-w-0
        flex
        items-center
        gap-2 md:gap-3
        border
        border-[#0A0A0A]/15
        rounded-md
        px-3 md:px-4
        py-3
        bg-white
        focus-within:border-indigo-500
        transition-colors
      "
    >
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
        className="
          flex-1
          min-w-0
          outline-none
          bg-transparent
          text-sm
          placeholder:text-[#0A0A0A]/35
          disabled:cursor-not-allowed
        "
      />

      {rightSlot && (
        <div className="shrink-0 flex items-center">
          {rightSlot}
        </div>
      )}
    </div>
  );
};

export default Field;