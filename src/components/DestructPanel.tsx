
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Target, Bomb, AlertCircle, Send } from 'lucide-react';

const DestructPanel: React.FC = () => {
  const [targetId, setTargetId] = useState('');
  const [destructType, setDestructType] = useState('crash');
  const [customMessage, setCustomMessage] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleDestruct = async () => {
    setIsExecuting(true);
    
    // Simulate destruct process
    setTimeout(() => {
      setIsExecuting(false);
      // Reset form
      setTargetId('');
      setCustomMessage('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2 font-slime">Destruct Panel</h3>
        <p className="text-gray-400">Execute destruct commands on target players</p>
      </div>

      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-400 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-semibold">WARNING</span>
        </div>
        <p className="text-red-300 text-sm">
          Use destruct features responsibly. Misuse may result in permanent bans.
        </p>
      </div>

      <Card className="bg-gray-700/50 border-blue-500/30">
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor="target-id" className="text-white font-slime">Target Player ID</Label>
            <Input
              id="target-id"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Enter player ID (1-128)"
              className="bg-gray-800 border-blue-500/30 text-white"
              type="number"
              min="1"
              max="128"
            />
          </div>

          <div>
            <Label className="text-white font-slime">Destruct Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant={destructType === 'crash' ? 'default' : 'outline'}
                onClick={() => setDestructType('crash')}
                className="font-slime"
              >
                <Bomb className="h-4 w-4 mr-2" />
                Crash
              </Button>
              <Button
                variant={destructType === 'kick' ? 'default' : 'outline'}
                onClick={() => setDestructType('kick')}
                className="font-slime"
              >
                <Target className="h-4 w-4 mr-2" />
                Kick
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="custom-message" className="text-white font-slime">Custom Message (Optional)</Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter custom message..."
              className="bg-gray-800 border-blue-500/30 text-white"
              rows={3}
            />
          </div>

          <Button
            onClick={handleDestruct}
            disabled={isExecuting || !targetId}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-slime"
          >
            <Send className="h-4 w-4 mr-2" />
            {isExecuting ? 'Executing...' : `Execute ${destructType.toUpperCase()}`}
          </Button>
        </CardContent>
      </Card>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/30">
        <h4 className="text-white font-semibold mb-2 font-slime">Destruct Log:</h4>
        <div className="bg-black/50 rounded p-3 text-red-400 font-mono text-sm h-32 overflow-y-auto">
          <div>[INFO] Destruct panel initialized</div>
          <div>[INFO] Waiting for target selection...</div>
          {isExecuting && (
            <>
              <div>[EXEC] Targeting player ID: {targetId}</div>
              <div>[EXEC] Executing {destructType} command...</div>
              <div>[SUCCESS] Command executed successfully</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestructPanel;
