"use client";

import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Eye } from "lucide-react";
import type { HistoryItem } from "@/app/page";

interface HistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: HistoryItem[];
  onViewItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export function HistorySheet({ open, onOpenChange, history, onViewItem, onClearHistory }: HistorySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Identification History</SheetTitle>
          <SheetDescription>
            Here are your last 5 plant identifications.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4">
          <div className="space-y-4 pr-6">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-2 rounded-lg border bg-card transition-colors hover:bg-accent">
                  <Image
                    src={item.image}
                    alt={item.result.commonName}
                    width={64}
                    height={64}
                    className="rounded-md object-cover h-16 w-16"
                  />
                  <div className="flex-grow overflow-hidden">
                    <p className="font-semibold truncate">{item.result.commonName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onViewItem(item)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View Item</span>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10 h-full flex flex-col justify-center items-center">
                <p>No history yet.</p>
                <p className="text-sm">Identify a plant to get started!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        {history.length > 0 && (
          <SheetFooter>
            <Button variant="destructive" className="w-full" onClick={onClearHistory}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
