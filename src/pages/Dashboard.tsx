import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import PlanoNotifications from "@/components/PlanoNotifications";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#F1F7FF]">
      <DashboardHeader />
      <BirthdayNotifications />
      
      <div className="container mx-auto px-4 py-6 mt-20">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#0EA5E9] mb-2">Dashboard</h1>
          <p className="text-slate-600">Visão geral dos seus atendimentos</p>
        </div>

        <PlanoNotifications />
      </div>
    </div>
  );
};

export default Dashboard;
