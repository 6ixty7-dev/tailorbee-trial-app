
import React, { useState, useEffect } from 'react';
import { User, UserRole, ServiceType, Order, OrderStatus, TailorShop, CatalogueItem, CatalogueCategory, AISuggestion } from './types';
import { storageService } from './services/storageService';
import { SERVICES, STATUS_MAP } from './constants';
import { Layout } from './components/Layout';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Scissors, Shirt, Sparkles, Wind, Footprints, UtilityPole,
  Plus, ChevronRight, Clock, MapPin, Package, History,
  TrendingUp, Users, ShoppingBag, CheckCircle2, ChevronLeft,
  Camera, Map as MapIcon, Calendar, ArrowRight, Store, Upload,
  Star, Truck, Zap, Info, Wand2, RefreshCw, Layers, Brain,
  User as UserIcon,
  ShoppingBasket
} from 'lucide-react';

// Design System Constants
const COLORS = {
  primary: '#FBD23F', // TailorBee Yellow
  secondary: '#000000', // Black
  accent: '#FBD23F',
  surface: '#FFFFFF',
  background: '#F8FAFC'
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'LOGIN' | 'CUSTOMER_DASH' | 'CUSTOMER_ORDER_FLOW' | 'TAILOR_DASH' | 'DELIVERY_DASH'>('LOGIN');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Customer Order Flow States
  const [orderStep, setOrderStep] = useState(1);
  const [draftOrder, setDraftOrder] = useState<Partial<Order>>({});
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  
  // AI Flow States
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Banner State
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('tailorbee_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      navigateByUserRole(user.role);
    }
  }, []);

  // Banner rotation logic
  useEffect(() => {
    if (view === 'CUSTOMER_DASH') {
      const timer = setInterval(() => {
        setActiveSlide(prev => (prev + 1) % 3);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [view]);

  const navigateByUserRole = (role: UserRole) => {
    if (role === UserRole.CUSTOMER) setView('CUSTOMER_DASH');
    if (role === UserRole.TAILOR) setView('TAILOR_DASH');
    if (role === UserRole.DELIVERY) setView('DELIVERY_DASH');
  };

  const handleLogin = (role: UserRole) => {
    const db = storageService.getDB();
    const user = db.users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('tailorbee_user', JSON.stringify(user));
      navigateByUserRole(role);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tailorbee_user');
    setView('LOGIN');
    setOrderStep(1);
    setDraftOrder({});
  };

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  // AI Service Logic
  const runAiAnalysis = async (base64Image: string) => {
    setIsAiLoading(true);
    try {
      const prompt = `You are a professional fashion designer and upcycling expert at Tailor Bee. 
      Analyze this garment and provide 3 creative upcycling or redesign suggestions. 
      Format your response strictly as valid JSON in the following schema:
      {
        "suggestions": [
          {"title": "Suggestion Name", "description": "Short explanation", "redesignStyle": "Style keywords"}
        ]
      }`;

      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image.split(',')[1] || base64Image,
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text);
      setAiSuggestions(result.suggestions);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      // Fallback
      setAiSuggestions([
        { title: "Convert to Crop Top", description: "Shorten the length and add elastic banding.", redesignStyle: "Modern & Chic" },
        { title: "Boho Vest Redesign", description: "Remove sleeves and add fringe details.", redesignStyle: "Bohemian" }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, forAi: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (forAi) {
          setAiImage(base64);
          runAiAnalysis(base64);
        } else {
          setDraftOrder({ ...draftOrder, referenceImageUrl: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- UI Components ---

  const ProgressHeader = ({ current, total, onBack }: any) => (
    <div className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
      <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-50 rounded-full">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="flex-1">
        <div className="h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
          <div 
            className="h-full transition-all duration-500" 
            style={{ width: `${(current / total) * 100}%`, backgroundColor: COLORS.primary }}
          ></div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">Step {current} of {total}</p>
      </div>
    </div>
  );

  // --- Views ---

  if (view === 'LOGIN') {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col items-center justify-center p-8 text-slate-900">
        <div className="mb-12 text-center">
          <div className="flex items-center gap-1 text-5xl font-black mb-1">
            <span>Tailor</span>
            <span style={{ color: COLORS.primary }}>Bee</span>
            <span style={{ color: COLORS.primary }}>.</span>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Logistics for your lifestyle</p>
        </div>
        <div className="w-full space-y-3">
          <button 
            onClick={() => handleLogin(UserRole.CUSTOMER)} 
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            I'm a Customer
          </button>
          <button 
            onClick={() => handleLogin(UserRole.TAILOR)} 
            className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl border-2 border-slate-900/5 active:scale-[0.98] transition-transform"
          >
            Partner Shop
          </button>
          <button 
            onClick={() => handleLogin(UserRole.DELIVERY)} 
            className="w-full bg-slate-50 text-slate-400 font-black py-4 rounded-2xl active:scale-[0.98] transition-transform"
          >
            Bee Logistics
          </button>
        </div>
      </div>
    );
  }

  // --- CUSTOMER DASHBOARD ---
  if (view === 'CUSTOMER_DASH') {
    const myOrders = storageService.getOrdersByCustomer(currentUser?.id || '');
    const orderWaitingPickup = myOrders.find(o => o.status === OrderStatus.TAILOR_ACCEPTED);
    
    return (
      <Layout user={currentUser} onLogout={handleLogout}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black">Hello, {currentUser?.name.split(' ')[0]}</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-tight">Kochi, Kerala</p>
            </div>
            <div className="bg-slate-900 p-2 rounded-2xl text-white shadow-lg">
              <Zap className="w-6 h-6" fill={COLORS.primary} color={COLORS.primary} />
            </div>
          </div>

          {orderWaitingPickup && (
            <div className="mb-8 bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[32px] animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-emerald-900">Tailor Accepted!</h4>
                  <p className="text-xs font-bold text-emerald-700/70 uppercase tracking-tight mb-4">Choose a pickup slot to start the request.</p>
                  <button 
                    onClick={() => {
                      setTrackingOrder(orderWaitingPickup);
                      setOrderStep(10);
                      setView('CUSTOMER_ORDER_FLOW');
                    }}
                    className="bg-emerald-500 text-white text-xs font-black px-6 py-3 rounded-xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-transform"
                  >
                    Schedule Pickup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SLIDING BANNER */}
          <div className="mb-8 relative h-[180px] w-full overflow-hidden rounded-[32px] shadow-2xl bg-slate-900">
            <div className="h-full w-full transition-all duration-700 ease-in-out">
              {activeSlide === 0 && (
                <div className="absolute inset-0 p-8 flex flex-col justify-center bg-slate-900 animate-in fade-in duration-1000">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-black text-2xl tracking-tighter">Tailor</span>
                    <span className="text-amber-400 font-black text-2xl tracking-tighter">Bee.</span>
                  </div>
                  <h3 className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Premium Craftsmanship</h3>
                  <p className="text-white text-sm font-medium mt-2 max-w-[240px]">Connecting Kochi's elite boutiques with seamless logistics for your lifestyle.</p>
                </div>
              )}
              {activeSlide === 1 && (
                <div className="absolute inset-0 p-8 flex flex-col justify-center bg-slate-900 animate-in fade-in duration-1000">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-amber-400 p-2 rounded-xl text-slate-900">
                      <Truck className="w-5 h-5" />
                    </div>
                    <h3 className="text-white font-black text-lg">How it works</h3>
                  </div>
                  <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span> Request Service
                  </p>
                  <p className="text-white/80 text-sm font-bold flex items-center gap-2 mt-1">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">2</span> Partner Crafts
                  </p>
                  <p className="text-white/80 text-sm font-bold flex items-center gap-2 mt-1">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">3</span> Bee Delivers
                  </p>
                </div>
              )}
              {activeSlide === 2 && (
                <div className="absolute inset-0 p-8 flex flex-col justify-center bg-slate-900 animate-in fade-in duration-1000">
                   <div className="bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Featured Partner</div>
                   <h3 className="text-white font-black text-xl">Vogue Stitch Kochi</h3>
                   <p className="text-white/60 text-xs mt-1">Specialists in Designer Blouses & Bridal Wear.</p>
                   <div className="flex items-center gap-2 mt-4">
                     <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                     <span className="text-white font-black text-sm">4.8 Rating</span>
                   </div>
                </div>
              )}
            </div>
            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-8 flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/20'}`}></div>
              ))}
            </div>
          </div>

          <h3 className="font-black text-lg mb-4 flex items-center justify-between">
            <span>New Order</span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Select Category</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-10">
            {SERVICES.map(s => {
              const Icon = { Shirt, Scissors, Sparkles, Wind }[s.icon] as any;
              return (
                <button 
                  key={s.id}
                  onClick={() => {
                    setDraftOrder({ serviceId: s.id });
                    setOrderStep(2);
                    setView('CUSTOMER_ORDER_FLOW');
                  }}
                  className="bg-white border-2 border-slate-50 p-5 rounded-3xl text-left hover:border-amber-400 transition-all active:scale-[0.98] shadow-sm"
                >
                  <div className="p-3 rounded-2xl w-fit mb-4" style={{ backgroundColor: `${COLORS.primary}20`, color: COLORS.secondary }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="font-black text-slate-900 leading-tight">{s.name}</p>
                </button>
              );
            })}
          </div>

          {/* AI ASSISTANT SECTION - MOVED BELOW SERVICES */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <button 
              onClick={() => { setOrderStep(8); setView('CUSTOMER_ORDER_FLOW'); }} 
              className="relative overflow-hidden group bg-slate-900 p-6 rounded-[32px] text-left shadow-2xl"
            >
              <div className="relative z-10">
                <div className="bg-white/10 p-2 rounded-xl w-fit mb-4">
                  <Wand2 className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-white text-xl font-black mb-1">Design with AI</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-tight">Upcycle & Redesign with Assistant</p>
              </div>
              <div className="absolute right-0 bottom-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                <Brain className="w-24 h-24 text-white" />
              </div>
            </button>
          </div>

          {myOrders.length > 0 && (
            <div>
              <h3 className="font-black text-lg mb-4">Active Bee-line</h3>
              <div className="space-y-3">
                {myOrders.map(o => (
                  <button 
                    key={o.id}
                    onClick={() => { setTrackingOrder(o); setOrderStep(99); setView('CUSTOMER_ORDER_FLOW'); }}
                    className="w-full flex items-center justify-between p-5 bg-white border-2 border-slate-50 rounded-3xl shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-900 text-white">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-sm">{o.subService}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{STATUS_MAP[o.status].label}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-200" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // --- CUSTOMER ORDER FLOW ---
  if (view === 'CUSTOMER_ORDER_FLOW') {
    const service = SERVICES.find(s => s.id === draftOrder.serviceId);
    const tailors = storageService.getDB().tailors.filter(t => t.specialization.includes(draftOrder.serviceId || ''));

    const finishOrder = () => {
      const final: Order = {
        ...draftOrder as Order,
        id: Math.random().toString(36).substr(2, 9),
        customerId: currentUser!.id,
        status: OrderStatus.PENDING_TAILOR_APPROVAL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pickupAddress: 'Vennala, Kochi' // Simulation
      };
      storageService.saveOrder(final);
      setView('CUSTOMER_DASH');
      setOrderStep(1);
      setDraftOrder({});
    };

    return (
      <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col">
        {orderStep < 8 && orderStep !== 10 && <ProgressHeader current={orderStep} total={7} onBack={() => {
          if (orderStep === 2) setView('CUSTOMER_DASH');
          else setOrderStep(orderStep - 1);
        }} />}

        {/* STEP 2: SUB-SERVICE */}
        {orderStep === 2 && (
          <div className="p-8 flex-1">
            <h2 className="text-3xl font-black mb-2">Refine Service</h2>
            <p className="text-slate-400 font-bold text-sm uppercase mb-10">What are we {service?.name.toLowerCase()}?</p>
            <div className="space-y-3">
              {service?.subServices?.map(sub => (
                <button 
                  key={sub}
                  onClick={() => { setDraftOrder({ ...draftOrder, subService: sub }); setOrderStep(3); }}
                  className="w-full p-6 bg-slate-50 rounded-3xl text-left font-black flex items-center justify-between hover:bg-amber-50 transition-colors"
                >
                  {sub}
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: TAILOR LIST */}
        {orderStep === 3 && (
          <div className="p-8 flex-1">
            <h2 className="text-3xl font-black mb-2">Pick your Partner</h2>
            <p className="text-slate-400 font-bold text-sm uppercase mb-10">Top rated shops in Kochi</p>
            <div className="space-y-4">
              {tailors.map(t => (
                <button 
                  key={t.id}
                  onClick={() => { setDraftOrder({ ...draftOrder, tailorId: t.id }); setOrderStep(4); }}
                  className="w-full p-5 border-2 border-slate-50 rounded-[32px] text-left hover:border-amber-400 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <Store className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900">{t.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-amber-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black">★ {t.rating}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{t.address}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: DESIGN SOURCE */}
        {orderStep === 4 && (
          <div className="p-8 flex-1">
            <h2 className="text-3xl font-black mb-2">Design Path</h2>
            <p className="text-slate-400 font-bold text-sm uppercase mb-10">How would you like to design?</p>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setOrderStep(11)} // Catalogue step
                className="w-full p-6 bg-slate-900 text-white rounded-3xl text-left flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-black text-lg">Shop Catalogue</h4>
                  <p className="text-white/40 text-[10px] font-bold uppercase">Browse tailor's own designs</p>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors">
                  <Layers className="w-6 h-6" />
                </div>
              </button>
              <button 
                onClick={() => setOrderStep(8)} // AI step
                className="w-full p-6 bg-amber-400 text-slate-900 rounded-3xl text-left flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-black text-lg">AI Assistant</h4>
                  <p className="text-slate-900/40 text-[10px] font-bold uppercase">Upcycle with Design Intelligence</p>
                </div>
                <div className="p-3 bg-slate-900 text-white rounded-2xl">
                  <Brain className="w-6 h-6" />
                </div>
              </button>
              <button 
                onClick={() => setOrderStep(12)} // Manual Upload step
                className="w-full p-6 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-3xl text-left flex items-center justify-between"
              >
                <div>
                  <h4 className="font-black text-lg">Manual Upload</h4>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Upload your own reference photo</p>
                </div>
                <Camera className="w-6 h-6 text-slate-300" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: AI FLOW */}
        {orderStep === 8 && (
          <div className="p-8 flex-1 flex flex-col">
            <button onClick={() => setOrderStep(4)} className="mb-6 p-2 -ml-2 hover:bg-slate-50 rounded-full w-fit">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-black mb-2">AI Assistant</h2>
            <p className="text-slate-400 font-bold text-sm uppercase mb-10">Upload a photo to start designing</p>
            
            {!aiImage ? (
              <label className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[48px] bg-slate-50 cursor-pointer hover:border-amber-400 transition-colors">
                <div className="bg-amber-400 p-6 rounded-[32px] shadow-2xl mb-4">
                  <Camera className="w-10 h-10 text-slate-900" />
                </div>
                <span className="font-black text-slate-400">Tap to Upload Photo</span>
                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, true)} />
              </label>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-6">
                <div className="relative rounded-[32px] overflow-hidden aspect-video bg-slate-100 shadow-lg">
                  <img src={aiImage} className="w-full h-full object-cover" />
                  {isAiLoading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center text-white p-10 text-center">
                      <RefreshCw className="w-10 h-10 animate-spin text-amber-400 mb-4" />
                      <p className="font-black text-lg">Beeing Intelligent...</p>
                      <p className="text-xs font-bold text-white/50 uppercase mt-2 tracking-widest">Analyzing fabric & structure</p>
                    </div>
                  )}
                </div>
                
                {aiSuggestions.length > 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest px-2">Suggestions for you</h3>
                    {aiSuggestions.map((s, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          setDraftOrder({ ...draftOrder, designSource: 'AI', aiSuggestion: s });
                          setOrderStep(5);
                        }}
                        className="w-full p-6 bg-slate-900 rounded-[32px] text-left group hover:scale-[1.02] transition-transform"
                      >
                        <h4 className="text-amber-400 font-black mb-1">{s.title}</h4>
                        <p className="text-white/60 text-xs font-medium leading-relaxed">{s.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{s.redesignStyle}</span>
                          <ArrowRight className="w-4 h-4 text-amber-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 11: CATALOGUE FLOW */}
        {orderStep === 11 && draftOrder.tailorId && (
          <div className="p-8 flex-1 flex flex-col">
            <button onClick={() => setOrderStep(4)} className="mb-6 p-2 -ml-2 hover:bg-slate-50 rounded-full w-fit">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-black mb-2">Shop Menu</h2>
            <p className="text-slate-400 font-bold text-sm uppercase mb-10">Select from Abraham's Collection</p>
            
            <div className="flex-1 overflow-y-auto space-y-8">
              {storageService.getCatalogueByTailor(draftOrder.tailorId).categories.map(cat => (
                <div key={cat.id}>
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-300 mb-4 ml-1">{cat.name}</h3>
                  <div className="space-y-4">
                    {storageService.getCatalogueByTailor(draftOrder.tailorId!).items.filter(i => i.categoryId === cat.id).map(item => (
                      <button 
                        key={item.id}
                        onClick={() => {
                          setDraftOrder({ ...draftOrder, designSource: 'CATALOGUE', catalogueItemId: item.id });
                          setOrderStep(5);
                        }}
                        className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-[32px] text-left hover:bg-amber-50 transition-colors"
                      >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-md">
                          <img src={item.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-slate-900">{item.name}</h4>
                          <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-1">{item.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: FABRIC & MEASUREMENTS (Unified Customization) */}
        {orderStep === 5 && (
          <div className="p-8 flex-1 flex flex-col overflow-y-auto">
            <h2 className="text-3xl font-black mb-2">Customization</h2>
            <p className="text-slate-400 font-bold text-sm uppercase mb-10">Final technical details</p>
            
            <div className="space-y-8 flex-1">
              <section>
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-300 mb-4 px-2">Fabric Selection</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Cotton', 'Silk', 'Linen', 'Polyester'].map(f => (
                    <button 
                      key={f}
                      onClick={() => setDraftOrder({ ...draftOrder, fabricType: f })}
                      className={`p-4 rounded-2xl font-black text-sm border-2 transition-all ${draftOrder.fabricType === f ? 'border-amber-400 bg-amber-50' : 'border-slate-50 bg-white'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-300 mb-4 px-2">Measurement Mode</h4>
                <div className="space-y-3">
                  {[
                    { id: 'SAMPLE', title: 'Pick up sample cloth', icon: <Shirt className="w-5 h-5" /> },
                    { id: 'AT_PICKUP', title: 'Measure me at pickup', icon: <MapPin className="w-5 h-5" /> },
                    { id: 'SAVED', title: 'Use saved profile', icon: <UserIcon className="w-5 h-5" /> }
                  ].map(m => (
                    <button 
                      key={m.id}
                      onClick={() => setDraftOrder({ ...draftOrder, measurementMode: m.id as any })}
                      className={`w-full p-5 rounded-[24px] text-left font-black flex items-center gap-4 border-2 transition-all ${draftOrder.measurementMode === m.id ? 'border-amber-400 bg-amber-50' : 'border-slate-50 bg-white'}`}
                    >
                      <div className="bg-slate-100 p-2 rounded-xl text-slate-400">{m.icon}</div>
                      <span>{m.title}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <button 
              disabled={!draftOrder.fabricType || !draftOrder.measurementMode}
              onClick={() => setOrderStep(7)}
              className={`w-full py-5 rounded-[32px] font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-2 mt-8 ${(!draftOrder.fabricType || !draftOrder.measurementMode) ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white'}`}
            >
              Review Request
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* STEP 7: REVIEW */}
        {orderStep === 7 && (
          <div className="p-8 flex-1 flex flex-col">
            <h2 className="text-3xl font-black mb-2">Final Summary</h2>
            <p className="text-slate-400 font-bold text-sm uppercase mb-10">Check your Bee Request</p>
            
            <div className="flex-1 bg-slate-50 rounded-[48px] p-8 space-y-6 shadow-inner overflow-y-auto mb-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</span>
                <span className="font-black">{draftOrder.subService}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design</span>
                <span className="font-black text-right">{draftOrder.designSource} {draftOrder.aiSuggestion?.title || ''}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fabric</span>
                <span className="font-black">{draftOrder.fabricType}</span>
              </div>
              <div className="bg-white p-6 rounded-[32px] flex items-center gap-4">
                 <div className="p-3 bg-amber-400 rounded-2xl"><Zap className="w-6 h-6 text-slate-900" /></div>
                 <div>
                   <p className="text-xs font-black">Tailor Bee Guarantee</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">100% Fit or Free Alteration</p>
                 </div>
              </div>
            </div>

            <button 
              onClick={finishOrder}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-[32px] shadow-2xl active:scale-[0.98] transition-transform"
            >
              Send Bee to Tailor
            </button>
          </div>
        )}

        {/* STEP 10: SCHEDULE PICKUP (AFTER APPROVAL) */}
        {orderStep === 10 && trackingOrder && (
          <div className="p-8 flex-1 flex flex-col">
            <button onClick={() => setView('CUSTOMER_DASH')} className="mb-6 p-2 -ml-2 hover:bg-slate-100 rounded-full w-fit">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-black mb-2">Pickup Slot</h2>
            <p className="text-slate-400 font-bold text-sm uppercase mb-10">When should we collect your items?</p>
            <div className="space-y-6 flex-1">
               <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {['Today', 'Tomorrow', 'Thu, 26', 'Fri, 27'].map(d => (
                  <button key={d} className="px-6 py-3 bg-slate-100 rounded-full font-black text-sm whitespace-nowrap focus:bg-slate-900 focus:text-white transition-colors">{d}</button>
                ))}
               </div>
               <div className="grid grid-cols-1 gap-3">
                {['09:00 AM - 12:00 PM', '12:00 PM - 03:00 PM', '03:00 PM - 06:00 PM', '06:00 PM - 09:00 PM'].map(t => (
                  <button 
                    key={t}
                    onClick={() => {
                      storageService.updateOrderStatus(trackingOrder.id, OrderStatus.PICKUP_SCHEDULED, { pickupDate: 'Today', pickupTime: t });
                      setView('CUSTOMER_DASH');
                      refreshData();
                    }}
                    className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[32px] text-left font-black hover:border-amber-400 transition-all flex items-center justify-between group"
                  >
                    <span>{t}</span>
                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-amber-400" />
                  </button>
                ))}
               </div>
            </div>
          </div>
        )}

        {/* TRACKING STEP (99) */}
        {orderStep === 99 && trackingOrder && (
          <div className="p-8 flex-1 flex flex-col bg-slate-900 text-white">
            <button onClick={() => setView('CUSTOMER_DASH')} className="mb-6 p-2 -ml-2 hover:bg-white/10 rounded-full w-fit">
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Order #{trackingOrder.id.slice(0,5)}</p>
                <h2 className="text-3xl font-black">{trackingOrder.subService}</h2>
              </div>
              <div className="bg-amber-400 p-4 rounded-[32px] text-slate-900 shadow-xl shadow-amber-400/20">
                <Package className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-8 flex-1 relative overflow-y-auto px-4">
              <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-white/10"></div>
              {Object.values(OrderStatus).filter(s => s !== OrderStatus.TAILOR_REJECTED).map((s, idx) => {
                 const isCompleted = Object.values(OrderStatus).indexOf(s) <= Object.values(OrderStatus).indexOf(trackingOrder.status);
                 const isCurrent = s === trackingOrder.status;
                 if (idx > Object.values(OrderStatus).indexOf(trackingOrder.status) + 1) return null;
                 
                 return (
                   <div key={s} className="flex gap-8 relative z-10">
                     <div className={`w-6 h-6 rounded-full border-4 border-slate-900 flex items-center justify-center shrink-0 ${isCompleted ? 'bg-amber-400 scale-125 shadow-lg' : 'bg-white/10'}`}>
                        {isCompleted && <div className="w-2 h-2 bg-slate-900 rounded-full" />}
                     </div>
                     <div>
                       <h4 className={`text-sm font-black transition-colors ${isCompleted ? 'text-white' : 'text-white/20'}`}>{STATUS_MAP[s]?.label || s}</h4>
                       {isCurrent && <p className="text-[10px] text-white/40 font-bold mt-1 uppercase tracking-tight">{STATUS_MAP[s]?.description}</p>}
                     </div>
                   </div>
                 );
              })}
            </div>
            
            <div className="mt-8 p-6 bg-white/5 rounded-[40px] border border-white/10 flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg">
                 <Truck className="w-6 h-6" />
               </div>
               <div className="flex-1">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Bee Logistics Partner</p>
                 <p className="text-sm font-black">Ashiq K. (Rider u3)</p>
               </div>
               <button className="bg-white text-slate-900 px-5 py-2 rounded-2xl text-xs font-black shadow-lg">Call</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // TAILOR DASHBOARD
  if (view === 'TAILOR_DASH') {
    const myOrders = storageService.getOrdersByTailor(currentUser?.id || '');
    const incoming = myOrders.filter(o => o.status === OrderStatus.PENDING_TAILOR_APPROVAL);
    const active = myOrders.filter(o => ![OrderStatus.PENDING_TAILOR_APPROVAL, OrderStatus.TAILOR_REJECTED, OrderStatus.DELIVERED].includes(o.status));

    return (
      <Layout user={currentUser} onLogout={handleLogout} title="Workshop Hub">
        <div className="p-6">
          <div className="mb-10">
            <h3 className="font-black text-xl mb-4 flex items-center justify-between">
              <span>Incoming ( {incoming.length} )</span>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Live</span>
            </h3>
            {incoming.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-100 rounded-[32px] text-center text-slate-300 font-black">
                Waiting for the swarm...
              </div>
            ) : (
              <div className="space-y-4">
                {incoming.map(order => (
                  <div key={order.id} className="bg-white border-2 border-slate-50 p-6 rounded-[40px] shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Request #{order.id.slice(0,5)}</p>
                        <h4 className="font-black text-xl">{order.subService}</h4>
                      </div>
                      <div className="p-3 bg-amber-400 rounded-2xl text-slate-900">
                        <Shirt className="w-6 h-6" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-8">
                      <div className="bg-slate-50 p-3 rounded-2xl flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Design Path</span>
                        <span className="text-xs font-black">{order.designSource}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Fabric</span>
                        <span className="text-xs font-black">{order.fabricType}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                       <button 
                        onClick={() => { storageService.updateOrderStatus(order.id, OrderStatus.TAILOR_ACCEPTED); refreshData(); }}
                        className="flex-1 bg-slate-900 text-white font-black py-4 rounded-[24px] text-sm shadow-xl"
                       >
                         Accept Order
                       </button>
                       <button 
                        onClick={() => { storageService.updateOrderStatus(order.id, OrderStatus.TAILOR_REJECTED); refreshData(); }}
                        className="px-6 bg-slate-50 text-slate-400 font-black py-4 rounded-[24px] text-sm"
                       >
                         Ignore
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h3 className="font-black text-xl mb-6">Active Pipeline</h3>
          <div className="space-y-4">
            {active.map(order => (
              <div key={order.id} className="bg-white border-2 border-slate-50 p-6 rounded-[32px] flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900">{order.subService}</h4>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${STATUS_MAP[order.status].color} px-3 py-1 rounded-full inline-block mt-2`}>
                    {STATUS_MAP[order.status].label}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {order.status === OrderStatus.DELIVERED_TO_TAILOR && (
                    <button onClick={() => { storageService.updateOrderStatus(order.id, OrderStatus.RECEIVED_BY_TAILOR); refreshData(); }} className="bg-amber-400 p-3 rounded-2xl shadow-lg"><CheckCircle2 className="w-6 h-6" /></button>
                  )}
                  {order.status === OrderStatus.RECEIVED_BY_TAILOR && (
                    <button onClick={() => { storageService.updateOrderStatus(order.id, OrderStatus.IN_PROGRESS); refreshData(); }} className="bg-slate-900 text-white p-3 rounded-2xl shadow-lg"><Zap className="w-6 h-6" /></button>
                  )}
                  {order.status === OrderStatus.IN_PROGRESS && (
                    <button onClick={() => { storageService.updateOrderStatus(order.id, OrderStatus.READY_FOR_DELIVERY); refreshData(); }} className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg"><Package className="w-6 h-6" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // DELIVERY DASHBOARD
  if (view === 'DELIVERY_DASH') {
    const pickupTasks = storageService.getOrdersByStatus([
      OrderStatus.PICKUP_SCHEDULED,
      OrderStatus.DELIVERY_EN_ROUTE_TO_CUSTOMER,
      OrderStatus.PICKED_UP_FROM_CUSTOMER
    ]);

    const returnTasks = storageService.getOrdersByStatus([
      OrderStatus.READY_FOR_DELIVERY,
      OrderStatus.PICKED_UP_FROM_TAILOR,
      OrderStatus.OUT_FOR_DELIVERY
    ]);

    return (
      <Layout user={currentUser} onLogout={handleLogout} title="Bee Rider Hub">
        <div className="p-6">
          <div className="bg-slate-900 text-white p-8 rounded-[48px] shadow-2xl mb-12 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-black mb-1">Rider Online</h3>
              <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Kochi District Zone</p>
            </div>
            <div className="p-4 bg-amber-400 rounded-[32px] text-slate-900 shadow-xl shadow-amber-400/20">
              <Truck className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h3 className="font-black text-xl mb-6 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                Pickups Available
              </h3>
              <div className="space-y-4">
                {pickupTasks.length === 0 && <p className="text-slate-300 font-black p-8 text-center border-2 border-dashed border-slate-50 rounded-[32px]">Clear Skies</p>}
                {pickupTasks.map(order => (
                  <div key={order.id} className="bg-white border-2 border-slate-50 p-6 rounded-[40px] shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><MapPin className="w-6 h-6" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{order.id.slice(0,5)}</p>
                        <p className="font-black text-slate-900">{order.pickupAddress}</p>
                      </div>
                    </div>
                    {order.status === OrderStatus.PICKUP_SCHEDULED && (
                      <button onClick={() => { storageService.updateOrderStatus(order.id, OrderStatus.DELIVERY_EN_ROUTE_TO_CUSTOMER); refreshData(); }} className="w-full bg-amber-400 text-slate-900 font-black py-4 rounded-[24px] shadow-lg">Start Pickup Journey</button>
                    )}
                    {order.status === OrderStatus.DELIVERY_EN_ROUTE_TO_CUSTOMER && (
                      <button onClick={() => { storageService.updateOrderStatus(order.id, OrderStatus.PICKED_UP_FROM_CUSTOMER); refreshData(); }} className="w-full bg-slate-900 text-white font-black py-4 rounded-[24px] shadow-lg">Confirm Item Collected</button>
                    )}
                    {order.status === OrderStatus.PICKED_UP_FROM_CUSTOMER && (
                      <button onClick={() => { storageService.updateOrderStatus(order.id, OrderStatus.DELIVERED_TO_TAILOR); refreshData(); }} className="w-full bg-slate-900 text-white font-black py-4 rounded-[24px] shadow-lg">Drop off at Tailor</button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-black text-xl mb-6 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                Returns Pipeline
              </h3>
              <div className="space-y-4">
                {returnTasks.length === 0 && <p className="text-slate-300 font-black p-8 text-center border-2 border-dashed border-slate-50 rounded-[32px]">No Returns Ready</p>}
                {returnTasks.map(order => (
                  <div key={order.id} className="bg-slate-50 border-2 border-emerald-50 p-6 rounded-[40px]">
                    <h4 className="font-black mb-4 uppercase text-xs text-emerald-900">Return to Customer</h4>
                    {order.status === OrderStatus.READY_FOR_DELIVERY && (
                      <button onClick={() => { storageService.updateOrderStatus(order.id, OrderStatus.PICKED_UP_FROM_TAILOR); refreshData(); }} className="w-full bg-emerald-500 text-white font-black py-4 rounded-[24px] shadow-lg">Pick up from Tailor</button>
                    )}
                    {order.status === OrderStatus.PICKED_UP_FROM_TAILOR && (
                      <button onClick={() => { storageService.updateOrderStatus(order.id, OrderStatus.OUT_FOR_DELIVERY); refreshData(); }} className="w-full bg-emerald-600 text-white font-black py-4 rounded-[24px] shadow-lg">Start Return Journey</button>
                    )}
                    {order.status === OrderStatus.OUT_FOR_DELIVERY && (
                      <button onClick={() => { storageService.updateOrderStatus(order.id, OrderStatus.DELIVERED); refreshData(); }} className="w-full bg-slate-900 text-white font-black py-4 rounded-[24px] shadow-2xl">Confirm Return Delivery</button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </Layout>
    );
  }

  return <div className="p-10 text-center font-black animate-pulse">TailorBee Kochi is Buzzing...</div>;
};

export default App;
