import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  X,
  Trash2,
  ShieldCheck,
  Download,
  ArrowRight,
  Sparkles,
  Lock,
  Cpu,
  Code,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSound } from '../../context/SoundContext';

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    clearCart,
    cartSubtotal,
    platformFee,
    cartTotal,
    handleCheckout,
  } = useCart();
  const { playClick } = useSound();

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden font-mono">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCart}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Slide-over Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10"
        >
          <div className="w-screen max-w-md bg-gray-950/95 border-l border-cyan-500/30 shadow-2xl shadow-cyan-950/50 flex flex-col backdrop-blur-2xl text-slate-100">
            {/* Drawer Header */}
            <div className="p-6 border-b border-cyan-500/20 bg-gradient-to-r from-gray-950 via-cyan-950/40 to-gray-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-black text-white flex items-center gap-2">
                    <span>Engineering Cart</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Hardware Schematics & Software Delivery
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClick();
                  closeCart();
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Your Cart is Empty</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Browse verified hardware blueprints, AI models, and full-stack software across all engineering departments.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl bg-gray-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 inline-block mb-1">
                          {item.category || 'Engineering'}
                        </span>
                        <h4 className="text-xs font-bold font-display text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          Stack: {Array.isArray(item.techStack) ? item.techStack.slice(0, 4).join(', ') : 'Hardware & Code'}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Blueprint</span>
                      </div>
                      <span className="font-display font-black text-sm text-cyan-300">
                        ₹{Number(item.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Checkout Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-cyan-500/20 bg-gradient-to-b from-gray-950 to-black space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Engineering Subtotal</span>
                    <span className="text-white font-bold">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <span>Escrow Verification Shield</span>
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    </span>
                    <span className="text-emerald-400 font-bold">₹{platformFee}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-bold">
                    <span className="text-white font-display">Total Investment</span>
                    <span className="text-cyan-300 font-display font-black text-lg">
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Verified Checkout (1-Click Delivery)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Instant ZIP Download</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span>Commercial License</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CartDrawer;
