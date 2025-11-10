
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TOOLS, DEFAULT_TOOL } from './constants';
import type { Tool } from './types';

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>(DEFAULT_TOOL);

  const ActiveComponent = activeTool.component;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="text-indigo-400">{activeTool.icon}</div>
                        <div>
                           <h1 className="text-2xl font-bold text-white">{activeTool.name}</h1>
                           <p className="text-sm text-gray-400">{activeTool.description}</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 pt-6">
                        <ActiveComponent />
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
