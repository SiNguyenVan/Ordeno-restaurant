import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  UtensilsCrossed,
  CalendarCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  Building2,
  Users,
  Search,
} from 'lucide-react';
import { formatVND } from '../../utils';
import { useRestaurant } from '../../context';
import { spaceTypeAPI, itemMenuAPI, bookingAPI } from '../../services';
import { publicOrderBookingSchema } from '../../schemas';

const TIME_SLOTS = [
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
];

export default function CartPage() {
  const {
    storedCart,
    cartItems,
    hydrateCart,
    orderMode,
    setOrderMode,
    updateCartQuantity,
    removeItemFromCart,
    clearCart,
    addToCart,
    latestBooking,
    showToast,
  } = useRestaurant();

  const todayStr = new Date().toISOString().split('T')[0];

  const [loadingCart, setLoadingCart] = useState(
    () => Array.isArray(storedCart) && storedCart.length > 0
  );

  // API state for space types (rooms) and recommended dishes
  const [spaceTypes, setSpaceTypes] = useState([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [selectedSpaceId, setSelectedSpaceId] = useState(
    latestBooking?.space?.id || null
  );
  const [recommendedDishes, setRecommendedDishes] = useState([]);

  // Customer & Order Form state
  const [recipientName, setRecipientName] = useState(
    latestBooking?.customerName || ''
  );
  const [recipientPhone, setRecipientPhone] = useState(
    latestBooking?.customerPhone || ''
  );
  const [recipientEmail, setRecipientEmail] = useState(
    latestBooking?.customerEmail || ''
  );
  const [bookingDate, setBookingDate] = useState(
    latestBooking?.date || todayStr
  );
  const [bookingTime, setBookingTime] = useState(
    latestBooking?.time || '19:00'
  );
  const [guestAdults, setGuestAdults] = useState(
    latestBooking?.adults || 2
  );
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(
    orderMode === 'delivery' ? 'card' : 'at-table'
  );

  // Enforce electronic card payment when Delivery (Ship) is selected
  useEffect(() => {
    if (orderMode === 'delivery') {
      setPaymentMethod('card');
    }
  }, [orderMode]);

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // 1. Hydrate cart items from Backend API
  useEffect(() => {
    let isMounted = true;
    async function loadFreshCartDetails() {
      try {
        await hydrateCart();
      } catch (err) {
        console.error('Failed to load fresh dish details from API:', err);
      } finally {
        if (isMounted) {
          setLoadingCart(false);
        }
      }
    }
    loadFreshCartDetails();
    return () => {
      isMounted = false;
    };
  }, [hydrateCart]);

  // 2. Fetch active Space Types (Room types) & Recommended Dishes from Backend API
  useEffect(() => {
    let isMounted = true;
    async function loadReferenceData() {
      try {
        setLoadingSpaces(true);
        const [spacesData, drinksData] = await Promise.all([
          spaceTypeAPI.getAll(),
          itemMenuAPI.getAll({ category_id: 4, limit: 3 }),
        ]);

        if (!isMounted) return;

        const spacesList = Array.isArray(spacesData) ? spacesData : [];
        setSpaceTypes(spacesList);

        if (spacesList.length > 0) {
          setSelectedSpaceId((prev) => {
            if (prev && spacesList.some((s) => Number(s.id) === Number(prev))) {
              return Number(prev);
            }
            if (
              latestBooking?.space?.id &&
              spacesList.some((s) => Number(s.id) === Number(latestBooking.space.id))
            ) {
              return Number(latestBooking.space.id);
            }
            return Number(spacesList[0].id);
          });
        }

        const drinksList = Array.isArray(drinksData) ? drinksData : [];
        if (drinksList.length > 0) {
          setRecommendedDishes(drinksList.slice(0, 3));
        } else {
          const bestSellers = await itemMenuAPI.getTopBestSellers(3);
          if (isMounted) {
            setRecommendedDishes(Array.isArray(bestSellers) ? bestSellers.slice(0, 3) : []);
          }
        }
      } catch (err) {
        console.error('Failed to load space types or recommendations:', err);
      } finally {
        if (isMounted) {
          setLoadingSpaces(false);
        }
      }
    }

    loadReferenceData();
    return () => {
      isMounted = false;
    };
  }, [latestBooking]);

  const selectedSpace = useMemo(
    () =>
      spaceTypes.find((s) => Number(s.id) === Number(selectedSpaceId)) ||
      spaceTypes[0] ||
      null,
    [spaceTypes, selectedSpaceId]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0),
    [cartItems]
  );

  const roomSurchargeFee = useMemo(() => {
    if (orderMode === 'delivery' || !selectedSpace) return 0;
    return Number(selectedSpace.surcharge_fee) || 0;
  }, [orderMode, selectedSpace]);

  const finalTotal = Math.max(0, subtotal + roomSurchargeFee);

  const handleAddRecommended = (dish) => {
    const activePrice =
      dish.discount_price != null ? Number(dish.discount_price) : Number(dish.original_price);
    addToCart({
      dish: {
        id: dish.id,
        name: dish.name,
        price: activePrice,
        original_price: dish.original_price,
        discount_price: dish.discount_price,
        image: dish.image_url,
        image_url: dish.image_url,
        unit: 'Portion',
      },
      quantity: 1,
      note: '',
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!recipientName.trim() || !recipientPhone.trim()) {
      setSubmitError('Please enter your Full Name and Contact Phone Number.');
      return;
    }

    if (orderMode === 'delivery') {
      if (!deliveryAddress.trim()) {
        setSubmitError('Please enter a detailed delivery address.');
        return;
      }
      if (paymentMethod !== 'card') {
        setSubmitError('Delivery orders require electronic payment by card.');
        return;
      }
    } else {
      if (!selectedSpace) {
        setSubmitError('Please select a room / dining space type.');
        return;
      }
    }

    setSubmitError('');
    setSubmittingOrder(true);

    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const paymentMethodLabel =
      paymentMethod === 'card' || orderMode === 'delivery'
        ? 'Pay by Card (Electronic Payment)'
        : 'Pay at Table';

    const specialRequestsText =
      orderMode === 'delivery'
        ? [
            `Delivery Address: ${deliveryAddress.trim()}`,
            `Payment: ${paymentMethodLabel}`,
            orderNote.trim() ? `Note: ${orderNote.trim()}` : '',
          ]
            .filter(Boolean)
            .join(' | ')
        : [
            `Service Mode: Pre-ordered Table`,
            `Room Type: ${selectedSpace?.name}`,
            `Payment: ${paymentMethodLabel}`,
            orderNote.trim() ? `Note: ${orderNote.trim()}` : '',
          ]
            .filter(Boolean)
            .join(' | ');

    const itemsPayload = cartItems.map((item) => ({
      menu_item_id: Number(item.dish?.id || item.id),
      quantity: Number(item.quantity) || 1,
      note: item.note || null,
    }));

    const apiPayload = {
      booking_type: orderMode === 'delivery' ? 'DELIVERY' : 'REGULAR_TABLE',
      space_type_id: orderMode === 'delivery' ? null : Number(selectedSpace.id),
      rooms_requested: 1,
      customer_name: recipientName.trim(),
      customer_phone: recipientPhone.trim(),
      customer_email: recipientEmail.trim() || null,
      booking_date: orderMode === 'delivery' ? todayStr : bookingDate,
      booking_time: orderMode === 'delivery' ? currentTimeStr : bookingTime,
      duration_minutes: 120,
      guest_adults: orderMode === 'delivery' ? 1 : Math.max(1, Number(guestAdults) || 2),
      guest_children: 0,
      event_type:
        orderMode === 'delivery'
          ? 'Haute Cuisine Delivery'
          : 'Pre-order with Table',
      special_requests: specialRequestsText,
      items: itemsPayload,
    };

    try {
      const createdRes = await bookingAPI.createPublic(apiPayload);
      const createdBooking = createdRes?.data || createdRes;

      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f5d77f', '#10b981', '#ffffff'],
      });

      const orderReceipt = {
        orderId:
          createdBooking?.booking_code ||
          'BK-' + Math.floor(10000 + Math.random() * 90000),
        mode: orderMode,
        spaceName: orderMode === 'delivery' ? null : selectedSpace?.name,
        bookingDate: apiPayload.booking_date,
        bookingTime: apiPayload.booking_time,
        guestAdults: apiPayload.guest_adults,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        recipientEmail: recipientEmail.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items: [...cartItems],
        subtotal: createdBooking?.preorder_total !== undefined ? Number(createdBooking.preorder_total) : subtotal,
        roomSurchargeFee: createdBooking?.room_surcharge_total !== undefined ? Number(createdBooking.room_surcharge_total) : roomSurchargeFee,
        finalTotal: createdBooking?.estimated_budget !== undefined ? Number(createdBooking.estimated_budget) : finalTotal,
        paymentMethodLabel,
        createdAt: new Date().toLocaleString('en-US'),
      };

      setCompletedOrder(orderReceipt);
      showToast(
        `Order #${orderReceipt.orderId} submitted! The restaurant will contact you shortly to verify and confirm your order.`
      );
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting order to server:', err);
      setSubmitError(
        err.message || 'Unable to submit your order. Please verify your details and try again.'
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-[#d4af37]/50 bg-[#14110e] p-6 shadow-2xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <span className="mt-4 rounded-full bg-[#d4af37]/15 px-4 py-1 text-xs font-bold text-[#d4af37]">
              Booking / Order Code #{completedOrder.orderId} • Pending Verification
            </span>
            <h1 className="mt-3 font-serif-luxury text-3xl font-bold text-white sm:text-4xl">
              Order Submitted Successfully!
            </h1>
            <p className="mt-2 max-w-lg text-sm text-stone-300">
              Thank you for choosing Ordeno. Your order has been recorded and will be verified & confirmed shortly by our restaurant concierge team.
            </p>
          </div>

          {/* Restaurant Verification Notice */}
          <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-center text-xs leading-relaxed text-amber-200">
            <strong className="font-bold text-[#f5d77f]">
              Verification Notice:
            </strong>{' '}
            Our concierge team will contact you shortly via phone (
            <strong>{completedOrder.recipientPhone}</strong>) or email (
            <strong>{completedOrder.recipientEmail}</strong>) to verify and confirm your order details.
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <span className="text-xs text-stone-400">Service Format & Space:</span>
                <div className="font-semibold text-[#d4af37]">
                  {completedOrder.mode === 'delivery'
                    ? `Delivery to: ${completedOrder.deliveryAddress}`
                    : `Pre-order (${completedOrder.bookingDate} ${completedOrder.bookingTime}) • ${completedOrder.spaceName}`}
                </div>
              </div>
              <div>
                <span className="text-xs text-stone-400">Guest / Recipient:</span>
                <div className="font-medium text-white">
                  {completedOrder.recipientName} ({completedOrder.recipientPhone})
                </div>
                {completedOrder.recipientEmail && (
                  <div className="text-xs text-stone-400">
                    {completedOrder.recipientEmail}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
                Order Item Details
              </div>
              <div className="mt-3 space-y-2.5">
                {completedOrder.items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-start justify-between text-xs sm:text-sm"
                  >
                    <div>
                      <span className="font-semibold text-white">
                        {item.quantity}x {item.dish.name}
                      </span>
                      {item.note && (
                        <p className="text-[11px] italic text-stone-400">
                          Note: {item.note}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-[#d4af37]">
                      {formatVND(item.dish.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-1.5 border-t border-white/10 pt-4 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Dishes Subtotal:</span>
                <span>{formatVND(completedOrder.subtotal)}</span>
              </div>
              {completedOrder.roomSurchargeFee > 0 && (
                <div className="flex justify-between text-stone-300">
                  <span>Room Surcharge ({completedOrder.spaceName}):</span>
                  <span>+{formatVND(completedOrder.roomSurchargeFee)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-base font-bold text-white">
                <span>Total Due ({completedOrder.paymentMethodLabel}):</span>
                <span className="text-[#d4af37]">
                  {formatVND(completedOrder.finalTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to={`/tra-cuu?code=${encodeURIComponent(completedOrder.orderId)}`}
              className="flex items-center gap-2 rounded-full border border-[#d4af37]/60 bg-[#d4af37]/15 px-7 py-3.5 text-xs font-bold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0c0a09]"
            >
              <Search className="h-4 w-4" />
              <span>Track Order Status</span>
            </Link>
            <Link
              to="/menu"
              onClick={() => setCompletedOrder(null)}
              className="rounded-full bg-[#d4af37] px-7 py-3.5 text-xs font-bold text-[#0c0a09] shadow-lg transition hover:bg-[#e5c349]"
            >
              Order More Dishes
            </Link>
            <Link
              to="/"
              onClick={() => setCompletedOrder(null)}
              className="rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-xs font-semibold text-stone-200 hover:bg-white/10"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loadingCart) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#d4af37]" />
          <h2 className="font-serif-luxury text-2xl font-bold text-white">
            Retrieving Live Culinary Details...
          </h2>
          <p className="max-w-md text-xs text-stone-400">
            Fetching real-time prices, ingredients, and chef availability from the Ordeno database.
          </p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-[#14110e] p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#d4af37]">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h1 className="mt-6 font-serif-luxury text-3xl font-bold text-white">
            Your Dining Cart is Empty
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-400">
            You have not selected any dishes yet. Discover our Imperial Sashimi Boat, Wagyu A5 Hotpot, or signature Haute Banquets at Ordeno.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/menu"
              className="flex items-center gap-2 rounded-full bg-[#d4af37] px-7 py-3.5 text-sm font-bold text-[#0c0a09] shadow-lg shadow-[#d4af37]/20 transition hover:bg-[#e5c349]"
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span>Explore Culinary Menu</span>
            </Link>
            <Link
              to="/booking"
              className="flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-[#d4af37]"
            >
              <CalendarCheck className="h-4 w-4 text-[#d4af37]" />
              <span>Book Table & VIP Suite</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold tracking-widest text-[#d4af37] uppercase">
            Cart & Order Confirmation
          </span>
          <h1 className="mt-1 font-serif-luxury text-3xl font-bold text-white sm:text-4xl">
            Selected Menu ({cartItems.reduce((s, i) => s + i.quantity, 0)} portions)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/menu"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-stone-200 hover:border-[#d4af37]"
          >
            + Add more dishes
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear cart</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 7 Columns: Cart Items & Live API Recommendations */}
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#14110e] p-4 sm:flex-row sm:items-center"
              >
                <img
                  src={item.dish.image}
                  alt={item.dish.name}
                  decoding="async"
                  className="h-28 w-full shrink-0 rounded-2xl object-cover sm:w-32"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] text-stone-400">
                        {item.dish.unit}
                      </span>
                      <h3 className="font-serif-luxury text-lg font-bold text-white">
                        {item.dish.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItemFromCart(item.cartItemId)}
                      className="text-stone-500 transition hover:text-rose-400"
                      title="Remove dish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {item.note && (
                    <p className="text-xs italic text-stone-400">
                      Chef note: “{item.note}”
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center rounded-full border border-white/15 bg-black/40 p-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(item.cartItemId, item.quantity - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full text-stone-300 hover:bg-white/10"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(item.cartItemId, item.quantity + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full text-stone-300 hover:bg-white/10"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-[#d4af37]">
                        {formatVND(item.dish.price * item.quantity)}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {formatVND(item.dish.price)} / portion
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Recommended Beverages & Desserts from Backend API */}
          {recommendedDishes.length > 0 && (
            <div className="rounded-3xl border border-[#d4af37]/25 bg-[#14110e] p-6">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
                <Sparkles className="h-4 w-4" />
                Recommended Beverages & Desserts for Your Feast
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {recommendedDishes.map((rec) => {
                  const recPrice =
                    rec.discount_price != null
                      ? Number(rec.discount_price)
                      : Number(rec.original_price);
                  return (
                    <div
                      key={rec.id}
                      className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/30 p-3"
                    >
                      <div>
                        <img
                          src={
                            rec.image_url ||
                            'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={rec.name}
                          decoding="async"
                          className="h-24 w-full rounded-xl object-cover"
                        />
                        <div className="mt-2 text-[10px] text-stone-400">
                          {rec.category_name || 'Beverages & Desserts'}
                        </div>
                        <h4 className="mt-0.5 line-clamp-2 text-xs font-bold text-white">
                          {rec.name}
                        </h4>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
                        <span className="text-xs font-bold text-[#d4af37]">
                          {formatVND(recPrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddRecommended(rec)}
                          className="flex items-center gap-1 rounded-full bg-[#d4af37]/20 px-2.5 py-1 text-[11px] font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0c0a09]"
                        >
                          <Plus className="h-3 w-3" />
                          Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Service Format, Room Selection, Customer Info & Checkout */}
        <form onSubmit={handleCheckout} className="space-y-6 lg:col-span-5">
          <div className="space-y-6 rounded-3xl border border-[#d4af37]/40 bg-gradient-to-b from-[#1b1611] to-[#120f0c] p-6 shadow-2xl transform-gpu">
            {/* 1. Service Format (Only 2 options: Pre-order Table & Delivery) */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
                1. Service Format
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setOrderMode('pre-order')}
                  className={`flex flex-col items-center rounded-xl border p-3.5 text-center text-xs transition ${
                    orderMode !== 'delivery'
                      ? 'border-[#d4af37] bg-[#d4af37]/20 font-bold text-white shadow-sm'
                      : 'border-white/10 bg-black/30 text-stone-400 hover:border-white/20'
                  }`}
                >
                  <CalendarCheck className="mb-1 h-4 w-4 text-[#d4af37]" />
                  Pre-order Table
                </button>
                <button
                  type="button"
                  onClick={() => setOrderMode('delivery')}
                  className={`flex flex-col items-center rounded-xl border p-3.5 text-center text-xs transition ${
                    orderMode === 'delivery'
                      ? 'border-[#d4af37] bg-[#d4af37]/20 font-bold text-white shadow-sm'
                      : 'border-white/10 bg-black/30 text-stone-400 hover:border-white/20'
                  }`}
                >
                  <Truck className="mb-1 h-4 w-4 text-[#d4af37]" />
                  Delivery (Ship)
                </button>
              </div>
            </div>

            {/* 2. Room Selection (For Pre-order ONLY; hidden when Delivery) */}
            {orderMode !== 'delivery' && (
              <div className="border-t border-white/10 pt-5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
                    <Building2 className="h-4 w-4" />
                    2. Select Room / Space Type
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {spaceTypes.length} space types
                  </span>
                </div>

                {loadingSpaces ? (
                  <div className="mt-3 space-y-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-16 animate-pulse rounded-xl bg-white/5"
                      />
                    ))}
                  </div>
                ) : spaceTypes.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-4 text-center text-xs text-stone-400">
                    No room types available.
                  </div>
                ) : (
                  <div className="mt-3 space-y-2.5">
                    {spaceTypes.map((space) => {
                      const active = Number(selectedSpaceId) === Number(space.id);
                      const surcharge = Number(space.surcharge_fee) || 0;
                      return (
                        <div
                          key={space.id}
                          onClick={() => setSelectedSpaceId(Number(space.id))}
                          className={`cursor-pointer rounded-xl border p-3 transition ${
                            active
                              ? 'border-[#d4af37] bg-[#d4af37]/15 shadow-sm'
                              : 'border-white/10 bg-black/25 hover:border-white/25'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white">
                              {space.name}
                            </span>
                            <span className="shrink-0 text-[11px] font-semibold text-[#d4af37]">
                              {surcharge > 0
                                ? `+${formatVND(surcharge)}`
                                : 'Free room fee'}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-stone-400">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-stone-500" />
                              {space.capacity ||
                                `${space.min_capacity}–${space.max_capacity} guests`}
                            </span>
                            {active && (
                              <span className="font-bold text-[#d4af37]">
                                ✓ Selected
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Date, Time & Guests for Pre-order */}
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-stone-400">
                      Date *
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-2.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-400">
                      Time *
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-2.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t} className="bg-[#14110e]">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-400">
                      Guests *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={guestAdults}
                      onChange={(e) => setGuestAdults(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-2.5 py-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Customer / Recipient Information */}
            <div className="border-t border-white/10 pt-5">
              <label className="block text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
                {orderMode === 'delivery'
                  ? '2. Delivery Recipient & Address'
                  : '3. Guest Contact Information'}
              </label>

              <div className="mt-3 space-y-2.5">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Full name *"
                    className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Phone number *"
                    className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Customer email (e.g. guest@email.com) *"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                />

                {orderMode === 'delivery' && (
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Detailed delivery address in Ho Chi Minh City *"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                  />
                )}

                <input
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder={
                    orderMode === 'delivery'
                      ? 'Delivery note (e.g. Call upon arrival at lobby)...'
                      : 'Table / special requests (optional)...'
                  }
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method (Only 2 options: Pay at Table & Pay by Card; Delivery requires Card) */}
            <div className="border-t border-white/10 pt-5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold tracking-wider text-[#d4af37] uppercase">
                  {orderMode === 'delivery'
                    ? '3. Payment Method'
                    : '4. Payment Method'}
                </label>
                {orderMode === 'delivery' && (
                  <span className="text-[11px] font-medium text-amber-300">
                    Electronic card payment required for delivery
                  </span>
                )}
              </div>
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {[
                  {
                    id: 'at-table',
                    label: 'Pay at Table',
                    icon: UtensilsCrossed,
                    disabled: orderMode === 'delivery',
                  },
                  {
                    id: 'card',
                    label: 'Pay by Card',
                    icon: CreditCard,
                    disabled: false,
                  },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      type="button"
                      key={pm.id}
                      disabled={pm.disabled}
                      onClick={() => !pm.disabled && setPaymentMethod(pm.id)}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                        pm.disabled
                          ? 'cursor-not-allowed border-white/5 bg-black/15 text-stone-600 opacity-50'
                          : isSelected
                            ? 'border-[#d4af37] bg-[#d4af37]/15 text-white shadow-sm'
                            : 'border-white/10 bg-black/25 text-stone-400 hover:border-white/25 hover:text-stone-200'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          pm.disabled ? 'text-stone-600' : 'text-[#d4af37]'
                        }`}
                      />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 border-t border-white/10 pt-5 text-sm">
              <div className="flex justify-between text-stone-300">
                <span>Dishes Subtotal ({cartItems.length} items):</span>
                <span className="font-semibold">{formatVND(subtotal)}</span>
              </div>

              {orderMode !== 'delivery' && selectedSpace && (
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Space ({selectedSpace.name}):</span>
                  <span className="font-semibold text-[#d4af37]">
                    {roomSurchargeFee > 0
                      ? `+${formatVND(roomSurchargeFee)}`
                      : 'Free room fee'}
                  </span>
                </div>
              )}

              <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                <span className="font-serif-luxury text-lg font-bold text-white">
                  Total Due:
                </span>
                <span className="font-serif-luxury text-2xl font-bold text-[#d4af37]">
                  {formatVND(finalTotal)}
                </span>
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingOrder}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] py-4 text-sm font-bold text-[#0c0a09] shadow-xl shadow-[#d4af37]/25 transition hover:scale-[1.01] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingOrder ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <span>Confirm Order Now</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
