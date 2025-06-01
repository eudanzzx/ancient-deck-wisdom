
import React from "react";
import Logo from "@/components/Logo";

const DashboardTitle: React.FC = () => {
  return (
    <div className="mb-12 flex items-center justify-center">
      <div className="flex items-center gap-6">
        <div className="bg-white rounded-full p-3 shadow-md">
          <Logo height={60} width={60} />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-blue-700">
            Dashboard
          </h1>
          <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTitle;
