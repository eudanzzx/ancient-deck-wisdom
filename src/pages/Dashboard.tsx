
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Target, Activity, Users, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import InjectPanel from '@/components/InjectPanel';
import DestructPanel from '@/components/DestructPanel';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inject');
  const [isInjected, setIsInjected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    navigate('/');
  };

  const stats = [
    { label: 'Successful Injections', value: '127', icon: Target, color: 'text-[#0EA5E9]' },
    { label: 'Active Sessions', value: '3', icon: Activity, color: 'text-[#0EA5E9]' },
    { label: 'Total Users', value: '1,234', icon: Users, color: 'text-[#0EA5E9]' },
    { label: 'Server Uptime', value: '99.9%', icon: Shield, color: 'text-[#0EA5E9]' },
  ];

  return (
    <div className="min-h-screen bg-[#F1F7FF]">
      <Navbar username={username} onLogout={handleLogout} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0EA5E9] mb-2">
            Welcome back, {username}
          </h1>
          <p className="text-slate-600">Ready to bypass the matrix?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="bg-white/80 border-slate-200 backdrop-blur-sm hover:border-[#0EA5E9]/50 transition-all duration-300 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} hover:scale-110 transition-transform duration-300`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 border-slate-200 backdrop-blur-sm">
              <CardHeader>
                <div className="flex space-x-1 border-b border-slate-200">
                  <Button
                    variant={activeTab === 'inject' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('inject')}
                    className={`rounded-b-none transition-all duration-200 ${
                      activeTab === 'inject' 
                        ? 'bg-[#0EA5E9] text-white border-b-2 border-[#0EA5E9] hover:bg-[#0EA5E9]/90' 
                        : 'text-slate-600 hover:text-[#0EA5E9] hover:bg-slate-50'
                    }`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Inject
                  </Button>
                  <Button
                    variant={activeTab === 'destruct' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('destruct')}
                    className={`rounded-b-none transition-all duration-200 ${
                      activeTab === 'destruct' 
                        ? 'bg-[#0EA5E9] text-white border-b-2 border-[#0EA5E9] hover:bg-[#0EA5E9]/90' 
                        : 'text-slate-600 hover:text-[#0EA5E9] hover:bg-slate-50'
                    }`}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Destruct
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {activeTab === 'inject' && (
                  <InjectPanel 
                    isInjected={isInjected}
                    setIsInjected={setIsInjected}
                    connectionStatus={connectionStatus}
                    setConnectionStatus={setConnectionStatus}
                  />
                )}
                {activeTab === 'destruct' && (
                  <DestructPanel />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            <Card className="bg-white/80 border-slate-200 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#0EA5E9] flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">FiveM Server</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      connectionStatus === 'connected' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : connectionStatus === 'connecting'
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {connectionStatus === 'connected' ? 'Connected' : 
                       connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Bypass Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      isInjected 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {isInjected ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Anti-Cheat</span>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-[#0EA5E9] border border-blue-200">
                      Bypassed
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-slate-200 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-[#0EA5E9] flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 hover:border-[#0EA5E9] transition-all duration-200"
                  >
                    Clear Logs
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 hover:border-[#0EA5E9] transition-all duration-200"
                  >
                    Reset Session
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 hover:border-[#0EA5E9] transition-all duration-200"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
