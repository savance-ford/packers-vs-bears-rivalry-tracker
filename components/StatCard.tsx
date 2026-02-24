import React from "react";

// 1. Extract props and extend native div attributes
interface StatCardProps extends React.ComponentPropsWithoutRef<"div"> {
  icon: React.ReactNode;
  label: string;
  value: string | number; // Added 'number' just in case you pass raw digits
  description: string;
  className?: any;
}

const StatCard = ({
  icon,
  label,
  value,
  description,
  className = "",
  ...rest
}: StatCardProps) => {
  return (
    <div
      className={`group p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:border-transparent transition-all duration-300 ${className}`}
      {...rest}
    >
      {/* Icon Container */}
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>

      {/* Label */}
      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        {label}
      </span>

      {/* Value */}
      <h3 className="text-3xl font-black text-blue-950 mb-3">{value}</h3>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
};

export default StatCard;
