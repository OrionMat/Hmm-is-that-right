import React from "react";

export const PageContainer = ({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) => {
  return (
    <div id={id} className="flex flex-col items-center w-full p-12">
      {children}
    </div>
  );
};
