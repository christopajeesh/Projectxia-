import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Code,
  Cpu,
  Layers,
  FileText,
  CheckCircle2,
  Bookmark,
  Shield,
  Zap,
  Terminal,
  FolderTree,
  FileCode,
  HardDrive,
  Copy,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSound } from '../../context/SoundContext';

const ArchitecturePeekModal = ({ project, onClose }) => {
  const { addToCart, handleCheckout } = useCart();
  const { playClick, playSuccess, playShield } = useSound();
  const [activeTab, setActiveTab] = useState('code'); // 'code', 'circuit', 'files', 'readme'
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const sampleFiles = [
    { name: 'main.py / firmware.ino', size: '14.2 KB', type: 'code' },
    { name: 'schematics.kicad_sch', size: '84.6 KB', type: 'circuit' },
    { name: 'circuit_bom.csv', size: '3.8 KB', type: 'data' },
    { name: 'model_weights.safetensors', size: '124.5 MB', type: 'model' },
    { name: 'architecture_diagram.pdf', size: '2.1 MB', type: 'doc' },
    { name: 'README_SETUP.md', size: '5.4 KB', type: 'doc' },
  ];

  const handleCopySnippet = () => {
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-gray-950/95 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Top Bar */}
          <div className="p-5 bg-gradient-to-r from-gray-950 via-cyan-950/50 to-gray-950 border-b border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300">
                <Terminal className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                  Architecture & Code Inspect
                </span>
                <h3 className="text-base sm:text-lg font-display font-black text-white line-clamp-1">
                  {project.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 pt-4 border-b border-slate-800 flex gap-2 bg-gray-900/40 overflow-x-auto text-xs font-mono">
            <button
              onClick={() => {
                playClick();
                setActiveTab('code');
              }}
              className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-cyan-500/20 text-cyan-300 border-t-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4 text-cyan-400" />
              <span>Firmware / Source Code</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setActiveTab('circuit');
              }}
              className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'circuit'
                  ? 'bg-purple-500/20 text-purple-300 border-t-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Circuit & Pinout BOM</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setActiveTab('files');
              }}
              className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'files'
                  ? 'bg-emerald-500/20 text-emerald-300 border-t-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span>Project File Tree ({sampleFiles.length} Artifacts)</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto font-mono text-xs">
            {activeTab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>entrypoint.py • Production Clean Code</span>
                  </span>
                  <button
                    onClick={handleCopySnippet}
                    className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Sample'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-gray-900 border border-slate-800 text-cyan-200/90 overflow-x-auto leading-relaxed">
                  <code>{`# ${project.title} - Architecture Entrypoint
import time
import asyncio
from projectxia_core import SecurePipeline, HardwareInterface

class EngineeringSystem:
    def __init__(self, node_id="${project._id || 'PX-NODE-2026'}"):
        self.node_id = node_id
        self.pipeline = SecurePipeline(verified=True)
        self.hardware = HardwareInterface(baud_rate=115200)

    async def execute_simulation(self):
        print("[ProjectXia]: Initializing high-speed sensor stream...")
        await self.hardware.calibrate_sensors()
        telemetry = await self.hardware.read_telemetry()
        result = self.pipeline.process_features(telemetry)
        return {"status": "SUCCESS", "verdict": "OPTIMAL", "data": result}

if __name__ == "__main__":
    app = EngineeringSystem()
    asyncio.run(app.execute_simulation())`}</code>
                </pre>
              </div>
            )}

            {activeTab === 'circuit' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-gray-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] text-purple-400 uppercase font-bold">Microcontroller & IO</span>
                    <p className="text-white font-bold text-sm">ESP32-S3 / STM32F4 / Raspberry Pi Pico</p>
                    <p className="text-slate-400 text-[11px]">Dual-Core 240MHz, Integrated Wi-Fi & BLE Mesh</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold">Sensor & Actuator Matrix</span>
                    <p className="text-white font-bold text-sm">I2C / SPI Low-Latency Bus</p>
                    <p className="text-slate-400 text-[11px]">BME680, MPU6050, 0.96 OLED, Relay Actuators</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-purple-200">
                  <span className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    Complete KiCAD & Gerber Blueprints Included
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Includes 2-layer PCB layout files, ready-to-order Gerber archives for JLCPCB/PCBWay, component BOM with exact Mouser/LCSC part numbers, and wiring schematics.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-2">
                {sampleFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-gray-900/80 border border-slate-800 flex items-center justify-between text-slate-300 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono text-xs text-white">{file.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{file.size}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Instant Checkout & Cart Actions */}
          <div className="p-6 bg-gray-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400">Fixed Transparent Price:</span>
              <p className="text-2xl font-display font-black text-cyan-300">
                ₹{project.price?.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  playSuccess();
                  addToCart(project, true);
                  onClose();
                }}
                className="flex-1 sm:flex-none py-3 px-5 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Bookmark className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart(project, false);
                  onClose();
                  handleCheckout();
                }}
                className="flex-1 sm:flex-none py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-display font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-500/25 cursor-pointer"
              >
                <span>Instant Buy & Download</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ArchitecturePeekModal;
