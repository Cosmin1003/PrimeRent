"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function HostDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-6">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <LayoutDashboard className="text-white size-6" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {t('dashboard.title')}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Reservations */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
            <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
              <ClipboardList className="text-emerald-600 size-7 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">
              {t('dashboard.reservationsTitle')}
            </h2>
            <p className="text-slate-500 mb-8">
              {t('dashboard.reservationsDesc')}
            </p>
            <Button
              onClick={() => navigate("/host/reservations")}
              className="w-full bg-black hover:bg-emerald-600 h-12 rounded-xl font-bold transition-colors mt-auto"
            >
              {t('dashboard.viewRequests')}
            </Button>
          </div>

          {/* Card 2: Create Listing */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
            <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
              <PlusCircle className="text-emerald-600 size-7 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">
              {t('dashboard.createListingTitle')}
            </h2>
            <p className="text-slate-500 mb-8">
              {t('dashboard.createListingDesc')}
            </p>
            <Button
              onClick={() => navigate("/host/create-listing")}
              className="w-full bg-black hover:bg-emerald-600 h-12 rounded-xl font-bold transition-colors mt-auto"
            >
              {t('dashboard.addProperty')}
            </Button>
          </div>

          {/* Card 3: Manage Listings */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
            <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
              <LayoutDashboard className="text-emerald-600 size-7 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">
              {t('dashboard.manageTitle')}
            </h2>
            <p className="text-slate-500 mb-8">
              {t('dashboard.manageDesc')}
            </p>
            <Button
              onClick={() => navigate("/host/manage-listings")}
              className="w-full bg-black hover:bg-emerald-600 h-12 rounded-xl font-bold transition-colors mt-auto"
            >
              {t('dashboard.manageProperties')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
