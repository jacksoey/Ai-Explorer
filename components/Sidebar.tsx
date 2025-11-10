
import React, { useState } from 'react';
import { TOOLS } from '../constants';
import type { Tool } from '../types';

interface SidebarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectTool = (tool: Tool) => {
        setActiveTool(tool);
        setIsOpen(false);
    }
    
  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-gray-800/80 backdrop-blur-sm text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:relative z-20 h-full bg-gray-900/70 backdrop-blur-lg border-r border-gray-700/50 w-64 md:w-72 flex-shrink-0 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 0C22.386 0 0 22.386 0 50s22.386 50 50 50 50-22.386 50-50S77.614 0 50 0zm0 8.333c22.99 0 41.667 18.677 41.667 41.667S72.99 91.667 50 91.667 8.333 72.99 8.333 50 27.01 8.333 50 8.333zM50 20.833c-16.108 0-29.167 13.058-29.167 29.167S33.892 79.167 50 79.167s29.167-13.058 29.167-29.167S66.108 20.833 50 20.833z" fill="currentColor"/></svg>
                <span>AI Explorer</span>
            </h2>
        </div>
        <nav className="mt-4 px-4 overflow-y-auto h-[calc(100%-80px)]">
          <ul>
            {TOOLS.map((tool) => (
              <li key={tool.id} className="mb-2">
                <button
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                    activeTool.id === tool.id
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="mr-4">{tool.icon}</div>
                  <span className="font-medium text-sm text-left">{tool.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
       {/* Overlay for mobile */}
       {isOpen && <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};
