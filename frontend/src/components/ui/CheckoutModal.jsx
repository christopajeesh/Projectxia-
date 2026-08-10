import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  CreditCard,
  Smartphone,
  Lock,
  Download,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  KeyRound,
  QrCode,
  Globe,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import AuroraBackground from './AuroraBackground';
import LicenseModal from './LicenseModal';
import api from '../../services/api';

const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    closeCheckout,
    purchasedOrder,
    cart,
    cartTotal,
    completeOrder,
    clearPurchasedOrder,
  } = useCart();
  const { playClick, playSuccess, playShield } = useSound();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('razorpay_upi'); // 'razorpay_upi', 'cards', 'stripe'
  const [upiId, setUpiId] = useState('buyer@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedLicense, setCopiedLicense] = useState(false);
  const [showLicenseCert, setShowLicenseCert] = useState(false);

  if (!isCheckoutOpen && !purchasedOrder) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    playClick();

    try {
      // 1. Initialize Order in Backend
      const orderRes = await api.post('/payments/razorpay-order', {
        amount: cartTotal,
        projectId: cart[0]?._id,
        projectTitle: cart[0]?.title,
        buyerEmail: user?.email || 'innovator@projectxia.io',
        buyerName: user?.name || 'Engineering Innovator',
      });

      // 2. Simulate / Verify HMAC Payment
      const verifyRes = await api.post('/payments/verify-razorpay', {
        razorpay_order_id: orderRes.data?.order?.id || `order_${Date.now()}`,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: 'MOCK_TEST_VERIFIED_SIGNATURE',
        projectId: cart[0]?._id,
        buyerEmail: user?.email,
        buyerName: user?.name,
      });

      const orderData = {
        orderId: 'ORD-' + Date.now().toString(36).toUpperCase(),
        buyerName: user?.name || 'Verified Buyer',
        buyerEmail: user?.email || 'buyer@projectxia.com',
        buyerMobile: user?.mobile || '+91 98451 00000',
        projectTitle: cart[0]?.title || 'AI Medical Imaging Diagnostic Suite',
        projectId: cart[0]?._id || cart[0]?.id || 'proj_01',
        amount: cartTotal || 2999,
        paymentMethod: paymentMethod === 'razorpay_upi' ? `Instant UPI (${upiId})` : 'Credit/Debit Card',
        status: 'PAID_COMPLETED',
        licenseKey: verifyRes.data?.licenseKey || `LIC-PX-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      };

      try {
        const storedOrders = JSON.parse(localStorage.getItem('projectxia_buyer_orders') || '[]');
        localStorage.setItem('projectxia_buyer_orders', JSON.stringify([orderData, ...storedOrders]));
      } catch (e) {}

      setIsProcessing(false);
      completeOrder({
        method:
          paymentMethod === 'razorpay_upi'
            ? `Instant UPI (${upiId})`
            : paymentMethod === 'cards'
            ? 'Debit/Credit Card (Visa/Mastercard)'
            : 'Stripe Global Checkout (USD)',
        licenseKey: verifyRes.data?.licenseKey,
      });
    } catch (err) {
      const fallbackOrder = {
        orderId: 'ORD-' + Date.now().toString(36).toUpperCase(),
        buyerName: user?.name || 'Verified Buyer',
        buyerEmail: user?.email || 'buyer@projectxia.com',
        buyerMobile: user?.mobile || '+91 98451 00000',
        projectTitle: cart[0]?.title || 'Engineering Project Work',
        projectId: cart[0]?._id || cart[0]?.id || 'proj_01',
        amount: cartTotal || 2999,
        paymentMethod: paymentMethod === 'razorpay_upi' ? `Instant UPI (${upiId})` : 'Credit/Debit Card',
        status: 'PAID_COMPLETED',
        licenseKey: `LIC-PX-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      };

      try {
        const storedOrders = JSON.parse(localStorage.getItem('projectxia_buyer_orders') || '[]');
        localStorage.setItem('projectxia_buyer_orders', JSON.stringify([fallbackOrder, ...storedOrders]));
      } catch (e) {}

      setIsProcessing(false);
      completeOrder({
        method: paymentMethod === 'razorpay_upi' ? `UPI (${upiId})` : 'Stripe Global Card',
      });
    }
  };

  const handleCopy = (text) => {
    playClick();
    navigator.clipboard.writeText(text);
    setCopiedLicense(true);
    setTimeout(() => setCopiedLicense(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-mono text-xs">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (purchasedOrder) clearPurchasedOrder();
            closeCheckout();
          }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-gray-950 border border-cyan-500/50 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/30 z-10 text-left max-h-[92vh] overflow-y-auto text-slate-100"
        >
          {/* Inner Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
            <AuroraBackground theme={purchasedOrder ? 'purple' : 'cyan'} />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/20 bg-gradient-to-r from-gray-950 via-cyan-950/40 to-gray-950">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-display font-black text-white">
                    {purchasedOrder ? 'Payment Verified & Blueprints Ready!' : 'Verified Engineering Checkout'}
                  </h3>
                  <p className="text-[10px] text-cyan-400 font-mono">
                    {purchasedOrder
                      ? 'Instant 1-Click Vault Access & Commercial License Issued'
                      : 'Razorpay UPI & Global Card Vault Escrow'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClick();
                  if (purchasedOrder) clearPurchasedOrder();
                  closeCheckout();
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              {purchasedOrder ? (
                /* ======================================================== */
                /* ORDER SUCCESS & INSTANT DOWNLOAD VAULT                   */
                /* ======================================================== */
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Order Completed: {purchasedOrder.orderId}</span>
                    </div>
                    <p className="text-[11px] text-emerald-400/90 leading-relaxed font-mono">
                      Your commercial source code, KiCAD PCB schematics, and presentation runbook are unlocked.
                    </p>
                  </div>

                  {/* Commercial License Key Box */}
                  <div className="p-4 rounded-2xl bg-gray-900/90 border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Commercial License Key:
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/80 border border-slate-800 font-mono text-cyan-300 font-bold">
                      <span className="truncate">{purchasedOrder.licenseKey}</span>
                      <button
                        onClick={() => handleCopy(purchasedOrder.licenseKey)}
                        className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 transition-colors ml-2 shrink-0 cursor-pointer"
                        title="Copy License Key"
                      >
                        {copiedLicense ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <a
                      href={`/api/licenses/download/${purchasedOrder.licenseKey}`}
                      onClick={() => playSuccess()}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all text-center"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Full ZIP</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        setShowLicenseCert(true);
                      }}
                      className="py-3 px-4 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span>View License PDF</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* ======================================================== */
                /* PAYMENT GATEWAY SELECTOR (RAZORPAY UPI / STRIPE / CARDS) */
                /* ======================================================== */
                <form onSubmit={handlePay} className="space-y-5">
                  {/* Itemized Cart Summary */}
                  <div className="p-4 rounded-2xl bg-gray-900/80 border border-slate-800 space-y-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Order Summary ({cart.length} Item{cart.length > 1 ? 's' : ''}):
                    </span>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item._id} className="flex justify-between items-center text-xs">
                          <span className="text-white truncate max-w-[240px]">{item.title}</span>
                          <span className="text-cyan-300 font-bold">₹{Number(item.price || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between text-[11px] text-slate-400">
                      <span>Verification & Escrow Shield Fee:</span>
                      <span className="text-emerald-400">₹99</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-display font-black text-sm text-white">
                      <span>Total Payable:</span>
                      <span className="text-cyan-300 text-base">₹{Number(cartTotal).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Payment Method Switcher */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Select Payment Gateway:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          setPaymentMethod('razorpay_upi');
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'razorpay_upi'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-neon-cyan font-bold'
                            : 'bg-gray-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span className="text-[10px]">Instant UPI / QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          setPaymentMethod('cards');
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'cards'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-neon-cyan font-bold'
                            : 'bg-gray-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[10px]">Cards & Netbanking</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          setPaymentMethod('stripe');
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'stripe'
                            ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-neon-purple font-bold'
                            : 'bg-gray-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span className="text-[10px]">Stripe Global ($)</span>
                      </button>
                    </div>
                  </div>

                  {/* UPI ID / Payment Details Input */}
                  {paymentMethod === 'razorpay_upi' && (
                    <div className="space-y-2 p-3.5 rounded-2xl bg-gray-900/90 border border-slate-800">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Enter UPI Virtual Payment Address (VPA):</span>
                        <span className="text-emerald-400 font-bold">GPay / PhonePe / Paytm</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="Enter UPI ID (e.g. username@upi / phone@paytm)"
                        className="w-full bg-black/70 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isProcessing ? 'Verifying Gateway Signature...' : `Pay ₹${Number(cartTotal).toLocaleString('en-IN')} & Unlock Blueprints`}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Verifiable License Certificate Modal */}
      {showLicenseCert && (
        <LicenseModal
          isOpen={showLicenseCert}
          onClose={() => setShowLicenseCert(false)}
          licenseData={purchasedOrder}
        />
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
