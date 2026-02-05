import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Layout } from "@/components/layout/Layout";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuButton } from "@/components/ui/NeuButton";
import { attendanceDB, eventDB, userDB } from "@/lib/firebaseDB";
import { QRPayload } from "@/lib/qr";
import { useAuth } from "@/context/authContext";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Wifi,
  WifiOff,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ScanResult {
  status:
    | "idle"
    | "processing"
    | "success"
    | "already_used"
    | "invalid"
    | "error";
  message: string;
  userName?: string;
}

export default function AttendanceScanner() {
  const { eventId } = useParams<{ eventId: string }>();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult>({
    status: "idle",
    message: ""
  });
  const [loading, setLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isScanning, setIsScanning] = useState(false);

  const qrRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(false);
  const scannerIdRef = useRef(`qr-reader-${Date.now()}`); // Unique ID

  /* ---------------- Fetch Event ---------------- */

  useEffect(() => {
    const load = async () => {
      if (!eventId) return;

      try {
        const ev = await eventDB.getById(eventId);
        if (!ev) throw new Error("Event not found");

        setEvent(ev);

        const count = await attendanceDB.getCountByEvent(eventId);
        setAttendanceCount(count);

        setLoading(false);
      } catch {
        setScanResult({ status: "error", message: "Failed to load event" });
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  /* ---------------- Online Status ---------------- */

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /* ---------------- Camera Management ---------------- */

  useEffect(() => {
    if (loading || !event || isMountedRef.current) return;

    isMountedRef.current = true;
    let mounted = true;

    const startCamera = async () => {
      try {
        console.log("🎥 Starting camera...");
        
        // Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!mounted) return;

        const container = document.getElementById(scannerIdRef.current);
        if (!container) {
          console.error("❌ Container not found");
          return;
        }

        console.log("✅ Container found:", scannerIdRef.current);

        // Completely clear the container
        container.innerHTML = "";

        // Create new scanner instance
        const qr = new Html5Qrcode(scannerIdRef.current);
        qrRef.current = qr;

        console.log("📷 Requesting camera permissions...");

        await qr.start(
          { facingMode: "environment" },
          {
            fps: 30, // Increased FPS for better detection
            qrbox: function(viewfinderWidth, viewfinderHeight) {
              // Make qrbox 70% of the smallest dimension
              let minEdgePercentage = 0.7;
              let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
              let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
              return {
                width: qrboxSize,
                height: qrboxSize
              };
            },
            aspectRatio: 1.0,
          },
          (decodedText, decodedResult) => {
            console.log("✅ QR DETECTED!", decodedText);
            handleScan(decodedText);
          },
          (errorMessage) => {
            // This fires constantly when no QR is detected - ignore it
            // console.log("No QR in frame:", errorMessage);
          }
        );

        console.log("✅ Camera started successfully!");

        if (mounted) {
          setIsScanning(true);
        }
      } catch (err: any) {
        console.error("💥 Camera error:", err);
        if (mounted) {
          setCameraError(
            err?.message?.includes("Permission")
              ? "Camera permission denied. Please allow camera access and refresh."
              : "Failed to start camera. Please check permissions and try again."
          );
        }
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      mounted = false;
      isMountedRef.current = false;
      
      const cleanup = async () => {
        if (qrRef.current) {
          try {
            const scanner = qrRef.current;
            if (scanner.isScanning) {
              await scanner.stop();
            }
            await scanner.clear();
            qrRef.current = null;
          } catch (err) {
            console.error("Cleanup error:", err);
          }
        }
      };

      cleanup();
    };
  }, [loading, event]);

  /* ---------------- QR Helpers ---------------- */

  const parseQR = (raw: string): QRPayload | null => {
    try {
      const payload = JSON.parse(raw);
      if (payload.userId && payload.eventId && payload.issuedAt) return payload;
      return null;
    } catch {
      return null;
    }
  };

  /* ---------------- Handle Scan ---------------- */

  const handleScan = async (raw: string) => {
    // Prevent multiple simultaneous scans
    if (scanResult.status === "processing") return;

    console.log("🔍 QR Scanned:", raw);
    setScanResult({ status: "processing", message: "Verifying..." });

    try {
      const payload = parseQR(raw);
      console.log("📦 Parsed Payload:", payload);

      if (!payload) {
        console.error("❌ Invalid QR Code");
        setScanResult({ status: "invalid", message: "Invalid QR Code" });
        toast.error("Invalid QR");
        return reset();
      }

      if (payload.eventId !== eventId) {
        console.error("❌ Wrong event ID. Expected:", eventId, "Got:", payload.eventId);
        setScanResult({
          status: "invalid",
          message: "QR is for different event"
        });
        toast.error("Wrong event QR");
        return reset();
      }

      console.log("👤 Fetching user:", payload.userId);
      const user = await userDB.getById(payload.userId);

      if (!user) {
        console.error("❌ User not found:", payload.userId);
        setScanResult({ status: "invalid", message: "User not found" });
        toast.error("User not found");
        return reset();
      }

      console.log("✅ User found:", user);

      // Check if currentUser exists (the person scanning)
      if (!currentUser) {
        console.error("❌ No current user (scanner)");
        setScanResult({ status: "error", message: "Scanner not authenticated" });
        toast.error("Please log in to scan");
        return reset();
      }

      console.log("📝 Attempting check-in...");
      const res = await attendanceDB.checkIn(payload.userId, eventId!, currentUser.uid);
      console.log("📋 Check-in result:", res);

      if (res.message === "ALREADY_USED") {
        console.warn("⚠️ Already checked in");
        setScanResult({
          status: "already_used",
          message: "Already checked in"
        });
        toast.warning("Already checked in");
        return reset();
      }

      if (res.message === "SUCCESS") {
        console.log("✅ Check-in successful!");
        const newCount = await attendanceDB.getCountByEvent(eventId!);
        setAttendanceCount(newCount);

        setScanResult({
          status: "success",
          message: `✓ ${user.name} checked in`,
          userName: user.name
        });

        toast.success("Entry allowed");
        return reset(1500);
      }

      throw new Error("Unexpected response: " + res.message);
    } catch (err) {
      console.error("💥 Scan error:", err);
      setScanResult({ status: "error", message: "Scan failed" });
      toast.error("Scan failed");
      reset();
    }
  };

  const reset = (delay = 2500) => {
    setTimeout(() => {
      setScanResult({ status: "idle", message: "" });
    }, delay);
  };

  /* ---------------- Retry Camera ---------------- */

  const retryCamera = () => {
    setCameraError(null);
    isMountedRef.current = false;
    window.location.reload(); // Force a clean restart
  };

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          Loading event...
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <NeuCard className="max-w-md mx-auto mt-16 text-center">
          <AlertCircle className="mx-auto mb-4" />
          Event not found
        </NeuCard>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="max-w-lg mx-auto py-8 px-4 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-sm text-muted-foreground">
              {event.date} • {event.time}
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
              isOnline
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* Count */}
        <NeuCard className="bg-primary/10">
          <div className="flex items-center gap-3">
            <Users />
            <div>
              <p className="text-sm">Checked In</p>
              <p className="text-3xl font-bold">{attendanceCount}</p>
            </div>
          </div>
        </NeuCard>

        {/* Camera */}
        {cameraError ? (
          <NeuCard className="border-red-500 bg-red-50 text-center py-8">
            <AlertCircle className="mx-auto mb-3 text-red-600" />
            <p className="mb-4">{cameraError}</p>
            <NeuButton onClick={retryCamera}>
              Retry Camera
            </NeuButton>
          </NeuCard>
        ) : (
          <NeuCard padding="none" className="overflow-hidden relative">
            <div
              id={scannerIdRef.current}
              className="w-full min-h-[400px] flex items-center justify-center bg-black rounded-lg"
            />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            )}
          </NeuCard>
        )}

        {/* Status */}
        {scanResult.status !== "idle" && (
          <NeuCard
            className={`border-2 ${
              scanResult.status === "success"
                ? "border-green-500 bg-green-50"
                : scanResult.status === "already_used"
                ? "border-yellow-500 bg-yellow-50"
                : scanResult.status === "invalid"
                ? "border-red-500 bg-red-50"
                : "border-blue-500 bg-blue-50"
            }`}
          >
            <div className="flex gap-2 items-center">
              {scanResult.status === "success" && (
                <CheckCircle2 className="text-green-600" />
              )}
              {(scanResult.status === "invalid" ||
                scanResult.status === "already_used" ||
                scanResult.status === "error") && (
                <AlertCircle className="text-red-600" />
              )}
              {scanResult.status === "processing" && (
                <Loader2 className="animate-spin" />
              )}
              <p className="font-semibold">{scanResult.message}</p>
            </div>
          </NeuCard>
        )}

        {/* Instructions */}
        <NeuCard className="bg-accent/20 text-sm space-y-1">
          <p>• Place QR in camera frame</p>
          <p>• Wait for confirmation</p>
          <p>• Each QR scans only once</p>
        </NeuCard>

        {/* Test Button - Remove this after testing */}
        <NeuButton 
          variant="primary" 
          className="w-full"
          onClick={() => {
            const testQR = '{"userId":"1dkL7Q2H9Fh2PdFWrTurMJ0D7MM2","eventId":"8ppH7YWohPBJki69GThQ","issuedAt":1769819671140}';
            console.log("🧪 Testing with QR:", testQR);
            handleScan(testQR);
          }}
        >
          🧪 Test Scan (Click to simulate scanning)
        </NeuButton>

      </div>
    </Layout>
  );
}