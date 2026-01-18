
"use client";

import { useState, useEffect } from "react";
import PlantIdentifierPage from "@/components/plant-identifier-page";
import { HistorySheet } from "@/components/history-sheet";
import HomeHeader from "@/components/home-header";
import type { IdentifyPlantOutput } from "@/ai/flows/identify-plant";
import ClientOnly from "@/components/client-only";

export interface HistoryItem {
  id: string;
  image: string;
  result: IdentifyPlantOutput;
  timestamp: string;
}

export default function Home() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyPlantOutput | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("leafwise-history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("leafwise-history", JSON.stringify(history));
    }
  }, [history]);

  const addToHistory = (newItem: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setHistory(prev =>
      [{ ...newItem, id: Date.now().toString(), timestamp: new Date().toISOString() }, ...prev].slice(0, 5)
    );
  };

  const viewHistoryItem = (item: HistoryItem) => {
    setImage(item.image);
    setResult(item.result);
    setIsHistoryOpen(false);
  };

  const clearHistory = () => {
    localStorage.removeItem("leafwise-history");
    setHistory([]);
    setIsHistoryOpen(false);
  };
  
  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
      <HomeHeader onHistoryClick={() => setIsHistoryOpen(true)} />
      
      <ClientOnly>
        <PlantIdentifierPage 
          onNewIdentification={addToHistory}
          image={image}
          setImage={setImage}
          result={result}
          setResult={setResult}
        />
        
        <HistorySheet 
          open={isHistoryOpen} 
          onOpenChange={setIsHistoryOpen}
          history={history}
          onViewItem={viewHistoryItem}
          onClearHistory={clearHistory}
        />
      </ClientOnly>

      <footer className="text-center mt-16 py-4 border-t">
        <p className="text-sm text-muted-foreground">
          © 2025 LeafWise · Built by Niimesh
        </p>
      </footer>
    </main>
  );
}
