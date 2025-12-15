import React from "react";

const CardDescription = ({ children, className = "" }) => {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
};

export default CardDescription;
