
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Play, Square, AlertTriangle } from 'lucide-react';

interface InjectPanelProps {
  isInjected: boolean;
  setIsInjected: (value: boolean) => void;
  connectionStatus: string;
  setConnectionStatus: (status: string) => void;
}

const InjectPanel: React.FC<InjectPanelProps> = ({
  isInjected,
  setIsInjected,
  connectionStatus,
  setConnectionStatus
}) => {
  const [serverIp, setServerIp] = useState('127.0.0.1:30120');
  const [isInjecting, setIsInjecting] = useState(false);

  const handleInject = async () => {
    setIsInjecting(true);
    setConnectionStatus('connecting');
    
    // Simulate injection process
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsInjected(true);
      setIsInjecting(false);
    }, 3000);
  };

  const handleStop = () => {
    setIsInjected(false);
    setConnectionStatus('disconnected');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Zap className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2 font-slime">Injection Panel</h3>
        <p className="text-gray-400">Connect to FiveM server and inject bypass</p>
      </div>

      <Card className="bg-gray-700/50 border-blue-500/30">
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor="server-ip" className="text-white font-slime">Server IP:Port</Label>
            <Input
              id="server-ip"
              value={serverIp}
              onChange={(e) => setServerIp(e.target.value)}
              placeholder="127.0.0.1:30120"
              className="bg-gray-800 border-blue-500/30 text-white"
              disabled={isInjected}
            />
          </div>

          <div className="flex space-x-3">
            {!isInjected ? (
              <Button
                onClick={handleInject}
                disabled={isInjecting || !serverIp}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-slime"
              >
                <Play className="h-4 w-4 mr-2" />
                {isInjecting ? 'Injecting...' : 'Start Injection'}
              </Button>
            ) : (
              <Button
                onClick={handleStop}
                variant="destructive"
                className="flex-1 font-slime"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Injection
              </Button>
            )}
          </div>

          {connectionStatus === 'connecting' && (
            <div className="flex items-center space-x-2 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Connecting to server...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/30">
        <h4 className="text-white font-semibold mb-2 font-slime">Console Output:</h4>
        <div className="bg-black/50 rounded p-3 text-green-400 font-mono text-sm h-32 overflow-y-auto">
          <div>[INFO] SlimeBypass v2.0 initialized</div>
          <div>[INFO] Checking anti-cheat systems...</div>
          {connectionStatus === 'connecting' && (
            <div>[INFO] Connecting to {serverIp}...</div>
          )}
          {connectionStatus === 'connected' && (
            <>
              <div>[SUCCESS] Connected to server</div>
              <div>[SUCCESS] Bypass injection completed</div>
              <div>[INFO] All anti-cheat systems bypassed</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InjectPanel;
