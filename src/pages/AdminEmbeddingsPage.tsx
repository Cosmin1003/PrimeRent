"use client";

import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Button } from "@/components/ui/button";
import { Sparkles, Database, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminEmbeddingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | null; text: string }>({
    type: null,
    text: ""
  });

  const runBackfill = async () => {
    setLoading(true);
    setMessage({ type: 'info', text: "Processing batch... Please wait." });

    try {
      // Calls your Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-embeddings');
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: data.message });
    } catch (error: any) {
      console.error("Embedding Error:", error);
      setMessage({ type: 'error', text: error.message || "Failed to generate embeddings." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="text-emerald-600 size-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Vector Sync</h1>
          <p className="text-sm text-gray-500 mt-2">
            Generate vector embeddings for properties that don't have them yet. This powers the smart semantic search.
          </p>
        </div>

        {/* Status Message Area */}
        {message.type && (
          <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.type === 'success' && <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />}
            {message.type === 'error' && <AlertCircle className="size-5 shrink-0 text-red-600" />}
            {message.type === 'info' && <Loader2 className="size-5 shrink-0 animate-spin text-blue-600" />}
            <span className="font-medium leading-relaxed">{message.text}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <Button 
            onClick={runBackfill} 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl text-md font-semibold transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Processing 50 properties...
              </>
            ) : (
              <>
                <Database className="mr-2 size-5" />
                Run Batch (50 properties)
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-400">
            Note: This processes a maximum of 50 properties at a time to prevent server timeouts. Keep clicking until it says all properties are embedded.
          </p>
        </div>

      </div>
    </div>
  );
}