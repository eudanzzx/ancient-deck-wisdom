
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BirthdayNotifications from "@/components/BirthdayNotifications";
import PlanoNotifications from "@/components/PlanoNotifications";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50 relative overflow-hidden">
      {/* Elegant background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-float opacity-60"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/15 to-cyan-400/15 rounded-full blur-3xl animate-float opacity-60" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gradient-to-r from-violet-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <DashboardHeader />
      <BirthdayNotifications />
      
      <div className="container mx-auto px-4 py-6 mt-20 relative z-10">
        <div className="mb-8 animate-slide-up">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
              Dashboard
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Tenha uma visão completa e elegante dos seus atendimentos em tempo real
            </p>
          </div>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <PlanoNotifications />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
