import React from "react";

// 1. Extract props to an interface and extend standard HTML attributes
interface SectionHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const SectionHeading = ({
  children,
  id,
  className = "",
  ...rest // Allows passing aria-labels, data attributes, etc.
}: SectionHeadingProps) => {
  return (
    <h2
      id={id}
      className={`text-3xl md:text-4xl font-extrabold text-blue-950 mb-8 flex items-center gap-3 ${className}`}
      {...rest}
    >
      {/* 2. Use a span instead of a div, and hide it from screen readers */}
      <span
        className="block w-2 h-10 bg-green-700 rounded-full"
        aria-hidden="true"
      />

      {children}
    </h2>
  );
};

export default SectionHeading;
