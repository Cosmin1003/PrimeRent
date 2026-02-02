"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Calendar, Image as ImageIcon, ShieldCheck, Rocket } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    phone_number: "",
    birth_date: "",
    avatar_url: "",
    role: "guest",
  });

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setProfile({
            full_name: data.full_name || "",
            phone_number: data.phone_number || "",
            birth_date: data.birth_date || "",
            avatar_url: data.avatar_url || "",
            role: data.role || "guest",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    setUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        birth_date: profile.birth_date,
        avatar_url: profile.avatar_url,
      })
      .eq("id", user?.id);

    if (error) alert(error.message);
    else alert("Profile updated successfully!");
    setUpdating(false);
  }

  async function handleBecomeHost() {
    if (!confirm("Are you sure you want to become a host? This will allow you to list properties.")) return;
    
    setUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("profiles")
      .update({ role: 'host' })
      .eq("id", user?.id);

    if (error) {
      alert(error.message);
    } else {
      setProfile(prev => ({ ...prev, role: 'host' }));
      alert("Congratulations! You are now a host.");
    }
    setUpdating(false);
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-emerald-600 font-medium">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-16">
      <div className="container max-w-3xl mx-auto px-4">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Personal Info</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage your PrimeRent identity and preferences.</p>
          </div>
          <Badge variant="outline" className={`py-1.5 px-4 text-sm font-semibold capitalize border-2 shadow-sm ${
            profile.role === 'host' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 
            profile.role === 'admin' ? 'border-purple-100 bg-purple-50 text-purple-700' : 
            'border-slate-200 bg-white text-slate-700'
          }`}>
            <ShieldCheck className="size-4 mr-2" />
            {profile.role} Account
          </Badge>
        </div>

        <div className="grid gap-8">
          {/* --- AVATAR CARD --- */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100">
                <img 
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name || 'User'}&background=10b981&color=fff`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-full shadow-lg">
                <ImageIcon size={16} />
              </div>
            </div>
            <div className="flex-1 w-full space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-900 font-semibold flex items-center gap-2">
                  <ImageIcon size={14} className="text-slate-400" /> Avatar Image URL
                </Label>
                <Input 
                  placeholder="Paste your image link here..."
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  value={profile.avatar_url} 
                  onChange={e => setProfile({...profile, avatar_url: e.target.value})} 
                />
                <p className="text-[11px] text-slate-400">Recommended: Square image, minimum 400x400px.</p>
              </div>
            </div>
          </div>

          {/* --- DETAILS CARD --- */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-slate-900 font-semibold flex items-center gap-2">
                  <User size={14} className="text-slate-400" /> Full Name
                </Label>
                <Input 
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  value={profile.full_name} 
                  onChange={e => setProfile({...profile, full_name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-900 font-semibold flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" /> Phone Number
                </Label>
                <Input 
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  value={profile.phone_number} 
                  onChange={e => setProfile({...profile, phone_number: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <Label className="text-slate-900 font-semibold flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" /> Birth Date
              </Label>
              <Input 
                type="date"
                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                value={profile.birth_date} 
                onChange={e => setProfile({...profile, birth_date: e.target.value})} 
              />
            </div>

            <div className="pt-4">
              <Button 
                onClick={updateProfile} 
                disabled={updating} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-6 rounded-xl text-lg font-bold transition-all active:scale-[0.98] w-full md:w-auto"
              >
                {updating ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* --- BECOME HOST CARD --- */}
          {profile.role === 'guest' && (
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group border border-slate-800">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-3">
                    <Rocket className="text-emerald-500" /> List your space on PrimeRent
                  </h3>
                  <p className="text-slate-400 mt-2">Transform your home into a thriving business and earn more income.</p>
                </div>
                <Button 
                  onClick={handleBecomeHost}
                  disabled={updating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-6 rounded-xl transition-all"
                >
                  Become a Host
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}