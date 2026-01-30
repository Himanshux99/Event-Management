import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Layout } from '@/components/layout/Layout';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuButton } from '@/components/ui/NeuButton';
import { NeuBadge } from '@/components/ui/NeuBadge';
import { attendanceDB, eventDB, userDB } from '@/lib/firebaseDB';
import { QRPayload } from '@/lib/qr';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Wifi,
  WifiOff,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ScanResult {
  status: 'idle' | 'scanning' | 'processing' | 'success' | 'already_used' | 'invalid' | 'error';
  message: string;
  userId?: string;
  eventId?: string;
  eventTitle?: string;
  userName?: string;
}

export default function AttendanceScanner() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId') || '';
  const [event, setEvent] = useState<any>(null);
  const [scanResult, setScanResult] = useState<ScanResult>({ status: 'idle', message: '' });
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scannerStarted, setScannerStarted] = useState(false);

  // Fetch event details and initial count
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setScanResult({ status: 'error', message: 'Event ID not provided' });
        setLoading(false);
        return;
      }

      try {
        const eventData = await eventDB.getById(eventId);
        if (!eventData) {
          setScanResult({ status: 'error', message: 'Event not found' });
          setLoading(false);
          return;
        }

        setEvent(eventData);

        // Fetch initial count
        const count = await attendanceDB.getCountByEvent(eventId);
        setAttendanceCount(count);

        setScanResult({ status: 'idle', message: '' });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        setScanResult({ status: 'error', message: 'Failed to load event' });
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Initialize QR scanner
  useEffect(() => {
    if (!loading && event && !scannerStarted) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }, false);

      const onScanSuccess = (decodedText: string) => {
        handleScan(decodedText);
      };

      const onScanError = () => {
        // Silent failure - scanning in progress
      };

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
      setScannerStarted(true);

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [loading, event, scannerStarted]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Parse and validate QR payload
  const parseQRPayload = (data: string): QRPayload | null => {
    try {
      const payload = JSON.parse(data) as QRPayload;
      if (payload.userId && payload.eventId && typeof payload.issuedAt === 'number') {
        return payload;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Handle QR scan
  const handleScan = async (result: string) => {
    setScanResult({ status: 'processing', message: 'Verifying...' });

    try {
      // Parse QR payload
      const payload = parseQRPayload(result);
      if (!payload) {
        setScanResult({ status: 'invalid', message: 'Invalid QR Code' });
        toast.error('Invalid QR Code');
        setTimeout(() => setScanResult({ status: 'idle', message: '' }), 3000);
        return;
      }

      const { userId, eventId: qrEventId } = payload;

      // Validate event matches
      if (qrEventId !== eventId) {
        setScanResult({ status: 'invalid', message: 'QR Code is for a different event' });
        toast.error('Wrong event QR code');
        setTimeout(() => setScanResult({ status: 'idle', message: '' }), 3000);
        return;
      }

      // Validate user exists
      const user = await userDB.getById(userId) as any;
      if (!user) {
        setScanResult({ status: 'invalid', message: 'User not found' });
        toast.error('User not found in system');
        setTimeout(() => setScanResult({ status: 'idle', message: '' }), 3000);
        return;
      }

      // Check in user
      const result_msg = await attendanceDB.checkIn(userId, eventId);

      if (result_msg.message === 'ALREADY_USED') {
        setScanResult({
          status: 'already_used',
          message: `${user.name || 'User'} already checked in`,
          userId,
          userName: user.name,
        });
        toast.warning('Already checked in');
        setTimeout(() => setScanResult({ status: 'idle', message: '' }), 3000);
      } else if (result_msg.message === 'SUCCESS') {
        // Increment count
        const newCount = await attendanceDB.getCountByEvent(eventId);
        setAttendanceCount(newCount);

        setScanResult({
          status: 'success',
          message: `✓ ${user.name || 'User'} checked in`,
          userId,
          userName: user.name,
        });
        toast.success('Check-in successful');
        setTimeout(() => setScanResult({ status: 'idle', message: '' }), 2000);
      } else {
        setScanResult({ status: 'error', message: 'Check-in failed' });
        toast.error('Check-in failed. Please try again.');
        setTimeout(() => setScanResult({ status: 'idle', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Scan error:', error);
      setScanResult({ status: 'error', message: 'Error processing QR code' });
      toast.error('Error processing QR code');
      setTimeout(() => setScanResult({ status: 'idle', message: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event || !eventId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <NeuCard className="max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold text-center mb-2">Event Not Found</h2>
            <p className="text-center text-muted-foreground">
              Please select an event to scan attendance.
            </p>
          </NeuCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background to-muted/50 py-8 px-4">
        <div className="container mx-auto max-w-lg">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <p className="text-sm text-muted-foreground">{event.date} • {event.time}</p>
              </div>
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span className="text-xs font-semibold">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </motion.div>

          {/* Live count card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <NeuCard variant="static" className="bg-primary/10">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Checked In</p>
                  <p className="text-3xl font-bold text-primary">{attendanceCount}</p>
                </div>
              </div>
            </NeuCard>
          </motion.div>

          {/* QR Reader */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <NeuCard variant="static" padding="none" className="overflow-hidden">
              <div className="bg-foreground/5 p-4 border-2 border-dashed border-foreground/30">
                <div id="qr-reader" style={{ width: '100%' }} />
              </div>
            </NeuCard>
          </motion.div>

          {/* Status Message */}
          {scanResult.status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <NeuCard
                variant="static"
                className={`border-2 ${
                  scanResult.status === 'success'
                    ? 'border-green-500 bg-green-50'
                    : scanResult.status === 'already_used'
                      ? 'border-yellow-500 bg-yellow-50'
                      : scanResult.status === 'invalid'
                        ? 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {scanResult.status === 'success' && (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  )}
                  {scanResult.status === 'already_used' && (
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  )}
                  {(scanResult.status === 'invalid' || scanResult.status === 'error') && (
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  {scanResult.status === 'processing' && (
                    <Loader2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1 animate-spin" />
                  )}
                  <div>
                    <p className="font-semibold text-sm">{scanResult.message}</p>
                    {scanResult.userName && (
                      <p className="text-xs text-muted-foreground mt-1">{scanResult.userName}</p>
                    )}
                  </div>
                </div>
              </NeuCard>
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <NeuCard variant="static" className="bg-accent/20">
              <h3 className="font-bold mb-3">📱 Scanner Instructions</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Position QR code in the camera frame</li>
                <li>• Wait for the scan to process</li>
                <li>• Check status message for confirmation</li>
                <li>• Each QR can only be scanned once</li>
              </ul>
            </NeuCard>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
