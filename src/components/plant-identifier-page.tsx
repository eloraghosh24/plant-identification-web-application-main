
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { identifyPlant, type IdentifyPlantOutput } from "@/ai/flows/identify-plant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ResultSkeleton } from "@/components/result-skeleton";
import {
  Upload,
  Camera,
  RefreshCw,
  Copy,
  Download,
  Volume2,
  VolumeX,
  X,
  Loader2,
  Leaf,
  Info,
  Thermometer,
  Cloud,
  Sprout,
  AlertTriangle,
  Sun,
  Droplets,
  MapPin,
  HeartPulse
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import type { HistoryItem } from "@/app/page";

interface PlantIdentifierPageProps {
  onNewIdentification: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  image: string | null;
  setImage: (image: string | null) => void;
  result: IdentifyPlantOutput | null;
  setResult: (result: IdentifyPlantOutput | null) => void;
}

export default function PlantIdentifierPage({ onNewIdentification, image, setImage, result, setResult }: PlantIdentifierPageProps) {
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (mode: "user" | "environment") => {
    stopCamera();
    setCameraError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Could not access camera. Please check permissions.");
      }
    } else {
        setCameraError("Camera access is not supported by your browser.");
    }
  }, [stopCamera]);
  
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, facingMode, startCamera, stopCamera]);


  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    // Voices may load asynchronously.
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices(); // Initial attempt
    }


    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL("image/png");
        setImage(dataUrl);
        setResult(null);
        setActiveTab("upload");
        stopCamera();
      }
    }
  };
  
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleSubmit = async () => {
    if (!image) {
      toast({
        variant: "destructive",
        title: "No Image Provided",
        description: "Please upload or capture an image first.",
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const plantInfo = await identifyPlant({ photoDataUri: image });
      setResult(plantInfo);
      onNewIdentification({ image, result: plantInfo });
    } catch (error) {
      console.error("Error identifying plant:", error);
      toast({
        variant: "destructive",
        title: "Identification Failed",
        description: "Could not identify the plant. The image might be unclear or an API error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const clearImage = () => {
    setImage(null);
    setResult(null);
  }

  const handlePdfExport = () => {
    if (!result || !image) return;
    toast({ title: "Generating your beautiful PDF..." });

    const doc = new jsPDF();
    let finalY = 0; // We'll manage this carefully.
    const pageMargin = 14;
    const pageContentWidth = doc.internal.pageSize.getWidth() - (pageMargin * 2);

    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor('#388E3C'); // Forest Green
    doc.text(result.commonName, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(14);
    doc.setTextColor('#795548'); // Earthy Brown
    doc.text(result.scientificName, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    finalY = 35; // Start position after headers
    
    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(9);
          doc.setTextColor('#795548');
          doc.text(
              `Built by Niimesh`,
              doc.internal.pageSize.getWidth() / 2,
              doc.internal.pageSize.getHeight() - 10,
              { align: 'center' }
          );
      }
    };
    
    const plantImage = new window.Image();
    plantImage.src = image;
    plantImage.onload = function() {
        const imgProps = doc.getImageProperties(plantImage);
        const aspectRatio = imgProps.width / imgProps.height;
        let imgWidth = 80; // A smaller, more manageable size
        let imgHeight = imgWidth / aspectRatio;
        const x = (doc.internal.pageSize.getWidth() - imgWidth) / 2;

        finalY += 10;
        doc.addImage(plantImage, 'PNG', x, finalY, imgWidth, imgHeight);
        finalY += imgHeight;
        
        const addSection = (title: string, text: string) => {
            if (finalY + 20 > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                finalY = pageMargin;
            }
            finalY += 10;

            doc.setFont('times', 'bold');
            doc.setFontSize(14);
            doc.setTextColor('#388E3C');
            doc.text(title, pageMargin, finalY);
            finalY += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor('#000000');
            const splitText = doc.splitTextToSize(text, pageContentWidth);
            doc.text(splitText, pageMargin, finalY);
            finalY += (splitText.length * 5); // Approximate height of the text block
        };

        const tableData = [
            ['Growth Habit', result.growthHabit],
            ['Ideal Climate', result.idealClimate],
            ['Light Requirement', result.lightRequirement],
            ['Water Needs', result.waterNeeds],
            ['Toxicity to Pets', result.toxicityToPets],
            ['Native Region', result.nativeRegion],
            ['Maintenance Level', result.maintenanceLevel],
        ].filter(row => row[1]); // Filter out rows with no data

        if (finalY + 20 > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            finalY = pageMargin;
        }

        finalY += 5;

        autoTable(doc, {
            startY: finalY,
            head: [['Attribute', 'Value']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: '#388E3C' },
            styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 'auto' } },
            margin: { left: pageMargin, right: pageMargin },
        });

        finalY = (doc as any).lastAutoTable.finalY || finalY;
        
        addSection('Description', result.description);
        addSection('Care Tips', result.careTips);
        
        addFooter();
        doc.save(`${result.commonName.replace(/\s+/g, "_") || "plant"}_report.pdf`);
    };
  };

  const handleSpeak = () => {
    if (!result) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const textToSpeak = `
      Plant: ${result.commonName}. Scientific Name: ${result.scientificName}.
      Description: ${result.description}.
      Care Tips: ${result.careTips}.
    `;
    const utterance = new SpeechSynthesisUtterance(textToSpeak.trim());
    
    // Find an Indian English female voice
    const indianFemaleVoice = voices.find(
      (voice) => voice.lang === 'en-IN' && voice.name.toLowerCase().includes('female')
    );
    
    const indianVoice = indianFemaleVoice || voices.find((voice) => voice.lang === 'en-IN');

    if (indianVoice) {
      utterance.voice = indianVoice;
    } else {
      toast({
        title: "Indian voice not available",
        description: "Using your browser's default voice.",
      });
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({ variant: "destructive", title: "Speech synthesis failed." });
    };
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };
  
  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `
Plant: ${result.commonName} (${result.scientificName})
Description: ${result.description}
Care: ${result.careTips}
    `.trim();
    navigator.clipboard.writeText(textToCopy);
    toast({ title: "Copied to clipboard!" });
  }

  const renderInfoItem = (Icon: React.ElementType, title: string, content: string | undefined) => (
    content ? (
        <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
        <div>
            <h3 className="font-semibold text-base">{title}</h3>
            <p className="text-sm text-muted-foreground">{content}</p>
        </div>
        </div>
    ) : null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card className="shadow-md hover:shadow-xl transition-shadow w-full max-w-md mx-auto">
        <CardHeader className="p-4">
          <CardTitle className="text-xl">Upload or Capture an Image</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" /> Upload</TabsTrigger>
              <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4" /> Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4">
                <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg h-48 cursor-pointer hover:bg-accent transition-all">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Click or Drag & drop</p>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange}/>
                </label>
            </TabsContent>
            <TabsContent value="camera" className="mt-4">
              <div className="relative bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                {cameraError && <p className="absolute text-white bg-black/50 p-2 rounded text-xs">{cameraError}</p>}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                  <Button variant="secondary" size="icon" onClick={captureImage} className="rounded-full">
                    <Camera className="h-5 w-5" />
                  </Button>
                   <Button variant="secondary" size="icon" onClick={toggleCamera} className="rounded-full">
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {image && (
            <div className="mt-4 relative">
              <p className="text-sm font-semibold mb-2">Preview:</p>
              <Image src={image} alt="Plant preview" width={400} height={400} className="rounded-lg w-full h-auto object-contain max-h-64" data-ai-hint="plant leaf" />
              <Button variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8" onClick={clearImage}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4">
            <Button onClick={handleSubmit} disabled={!image || loading} className="w-full rounded-xl gap-2" size="lg">
                {loading ? ( <><Loader2 className="animate-spin h-5 w-5" />Identifying...</> ) : ( <><Leaf className="h-5 w-5" /> Identify Plant</> )}
            </Button>
        </CardFooter>
      </Card>
      
      <div className="flex flex-col items-center justify-center">
        {loading && <ResultSkeleton />}
        
        {result && !loading && (
          <Card className="w-full max-w-md mx-auto shadow-md hover:shadow-xl transition-shadow animate-in fade-in-50 duration-500">
            <CardHeader className="text-center p-4 items-center">
                {image && <Image src={image} alt={result.commonName} width={128} height={128} className="rounded-full mx-auto mb-4 border-4 border-background shadow-lg" data-ai-hint="plant" />}
              <CardTitle className="text-2xl font-bold text-primary font-headline">{result.commonName}</CardTitle>
              <CardDescription className="text-base italic">{result.scientificName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
                {renderInfoItem(Info, "Description", result.description)}
                {renderInfoItem(Sprout, "Growth Habit", result.growthHabit)}
                {renderInfoItem(Cloud, "Ideal Climate", result.idealClimate)}
                {renderInfoItem(Sun, "Light Requirement", result.lightRequirement)}
                {renderInfoItem(Droplets, "Water Needs", result.waterNeeds)}
                {renderInfoItem(MapPin, "Native Region", result.nativeRegion)}
                {renderInfoItem(HeartPulse, "Maintenance Level", result.maintenanceLevel)}
                {renderInfoItem(AlertTriangle, "Toxicity to Pets", result.toxicityToPets)}
                {renderInfoItem(Thermometer, "Care Tips", result.careTips)}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 p-4 justify-center">
                <Button variant="secondary" onClick={handleCopy} className="rounded-xl flex-1 gap-2"><Copy className="h-4 w-4"/>Copy</Button>
                <Button variant="secondary" onClick={handlePdfExport} className="rounded-xl flex-1 gap-2"><Download className="h-4 w-4"/>PDF</Button>
                <Button variant="secondary" onClick={handleSpeak} className={cn("rounded-xl flex-1 gap-2", isSpeaking && "animate-pulse ring-2 ring-primary")}>
                    {isSpeaking ? <VolumeX className="h-4 w-4"/> : <Volume2 className="h-4 w-4"/>}
                    {isSpeaking ? 'Stop' : 'Speak'}
                </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
