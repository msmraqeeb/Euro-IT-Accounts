import React, { useState, useRef } from 'react';
import { AppData } from '../types';
import { 
  Download, 
  RotateCcw, 
  FileSignature, 
  Sparkles, 
  Building2, 
  Calendar, 
  Briefcase, 
  Clock, 
  Type, 
  CheckCircle2,
  Plus,
  Trash2,
  Layers,
  DollarSign,
  Loader2,
  Printer,
  FileText,
  MapPin
} from 'lucide-react';

interface AgreementsProps {
  data: AppData;
}

export interface PaymentItem {
  id: string;
  description: string;
  qty: number | string;
  unitPrice: number | string;
  isFree?: boolean;
}

export interface TermItem {
  id: string;
  title: string;
  content: string;
}

export const DEFAULT_TERMS: TermItem[] = [
  {
    id: '1',
    title: 'Payment Terms',
    content: "The Buyer agrees to pay 50% of the total contract amount upfront to initiate the project. The remaining balance shall be paid during the contract's running period. All payments must be made to the designated account provided by the Seller, and the Buyer is required to include their merchant's name when making the payment. Failure to complete payments within seven (7) days of the due date will result in a daily default charge of 0.1% of the outstanding balance."
  },
  {
    id: '2',
    title: 'Scope of Services',
    content: "The Seller shall provide digital marketing services, including the creation of marketing materials such as text, images, videos, and designs. The Seller will collaborate with the Buyer to determine post types and schedules. Materials for the first month will be prepared within fifteen (15) days of receiving all required information, and subsequent materials will be prepared fifteen (15) days in advance of each month."
  },
  {
    id: '3',
    title: 'Project Timeline',
    content: "The Seller will commence the project after receiving the initial payment and necessary information from the Buyer. The system installation and commissioning date will mark the acceptance of deliverables, including the merchant number applied for by the Seller on behalf of the Buyer."
  },
  {
    id: '4',
    title: 'Buyer Rights and Responsibilities',
    content: "The Buyer shall collaborate with the Seller's team, which may include management personnel and digital marketing experts, to ensure project progress. Timely payment is essential for project continuation. The Buyer acknowledges that all intellectual property created by the Seller, including text, images, videos, designs, and software, remains the property of the Seller. Without prior written permission, the Buyer shall not copy, modify, distribute, or exploit the intellectual property in any form."
  },
  {
    id: '5',
    title: 'Seller Rights and Responsibilities',
    content: "The Seller will deliver digital marketing services as outlined in this Agreement and provide remote services via a secure network. The Seller is not liable for interruptions, data loss, or delays caused by force majeure or unforeseen circumstances beyond their control."
  },
  {
    id: '6',
    title: 'Implementation and Acceptance',
    content: "The Seller will begin preparing materials within ten (10) working days after receiving the initial payment. The date of installation and commissioning of the system will mark the start of service use and formal acceptance by the Buyer."
  },
  {
    id: '7',
    title: 'Liability for Breach of Contract',
    content: "The Seller is not responsible for specific marketing results but will deliver services as per this Agreement. Neither party shall be liable for delays or suspensions caused by force majeure. If implementation delays occur due to the Buyer's lack of cooperation, the Buyer shall bear full responsibility. Failure to pay the Seller as per the Agreement will result in late payment charges as specified in Clause 1."
  },
  {
    id: '8',
    title: 'Dispute Resolution',
    content: "Any disputes arising from or related to this Agreement shall first be attempted to be resolved amicably through mutual discussion between the parties. If no resolution is reached within fifteen (15) days, disputes shall be resolved in the people's court located where the Seller is based, in accordance with the laws of the People's Republic of Bangladesh."
  },
  {
    id: '9',
    title: 'Additional Content Charges',
    content: "Any content requests beyond the agreed scope of services will be subject to additional charges. Motion video or motion graphics content: BDT 2,500 per item. Additional static content design: BDT 1,000 per item. All additional charges must be agreed upon in writing before commencement."
  },
  {
    id: '10',
    title: 'Confidentiality',
    content: "Both parties agree to keep all business information, data, and strategies shared during the course of this Agreement strictly confidential. Neither party shall disclose proprietary information to any third party without the prior written consent of the other party. This obligation shall survive the termination or expiry of this Agreement."
  },
  {
    id: '11',
    title: 'Termination',
    content: "Either party may terminate this Agreement with seven (7) days written notice. In the event of termination by the Buyer, all payments made prior to termination are non-refundable. The Seller reserves the right to terminate immediately in the event of non-payment or material breach of this Agreement by the Buyer."
  },
  {
    id: '12',
    title: 'Governing Law',
    content: "This Agreement shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh. Any legal proceedings shall be conducted exclusively in the courts of Dhaka, Bangladesh."
  }
];

const PRESET_DESCRIPTIONS = [
  'Static Graphics Design',
  'Motion Video Creation',
  'Reels Video Creation',
  'Video Shooting',
  'Drone Shooting',
  'All Festival Contents'
];

export const Agreements: React.FC<AgreementsProps> = ({ data }) => {
  // Navigation tab for editor form (Page 1 vs Page 2 vs Page 3 vs Page 4)
  const [activeTab, setActiveTab] = useState<'page1' | 'page2' | 'page3' | 'page4'>('page1');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [logoSrc, setLogoSrc] = useState('https://ik.imagekit.io/eg7u6xcn0u/logoblack.png');

  // Convert Logo to Base64 to prevent canvas CORS security errors completely
  React.useEffect(() => {
    const fetchLogoBase64 = async () => {
      try {
        const res = await fetch('https://ik.imagekit.io/eg7u6xcn0u/logoblack.png');
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            setLogoSrc(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.warn('Could not convert logo to base64, using fallback URL:', err);
      }
    };
    fetchLogoBase64();
  }, []);

  // ===================== PAGE 1 STATES =====================
  const [proposalFor, setProposalFor] = useState('WEBSITE REDESIGN');
  const [preparedFor, setPreparedFor] = useState('PREMIUM INTERIOR BD');
  const [address, setAddress] = useState('Dhaka, Bangladesh');
  const [phone, setPhone] = useState('+880 1712-345678');
  const [email, setEmail] = useState('info@premiuminteriorbd.com');
  const [website, setWebsite] = useState('premiuminteriorbd.com');
  const [proposalDate, setProposalDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  });
  const [project, setProject] = useState('Complete Website Redesign & Redevelopment (Existing site update)');
  const [validity, setValidity] = useState('15 days from proposal date');
  const [selectedClientId, setSelectedClientId] = useState('');

  // ===================== PAGE 2 STATES =====================
  // Service Details
  const [servicePackage, setServicePackage] = useState('Customized');
  const [contractPeriod, setContractPeriod] = useState('July 9, 2026 – August 9, 2026 (1 Month)');
  const [platform, setPlatform] = useState('Facebook');
  const [staticGraphics, setStaticGraphics] = useState('15 designs × BDT 1,000 each');
  const [motionVideos, setMotionVideos] = useState('4 videos × BDT 2,500 each');
  const [festivalContents, setFestivalContents] = useState('Included FREE with package');

  // Payment Summary Items
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([
    { id: '1', description: 'Static Graphics Design', qty: 15, unitPrice: 1000, isFree: false },
    { id: '2', description: 'Motion Video Creation', qty: 4, unitPrice: 2500, isFree: false },
    { id: '3', description: 'All Festival Contents', qty: '—', unitPrice: 'FREE', isFree: true }
  ]);

  // ===================== PAGE 3 STATES =====================
  const [termsList, setTermsList] = useState<TermItem[]>(DEFAULT_TERMS);

  // ===================== PAGE 4 STATES (SIGNATURES) =====================
  const [sellerRepName, setSellerRepName] = useState('');
  const [sellerSignDate, setSellerSignDate] = useState('');
  const [buyerRepName, setBuyerRepName] = useState('');
  const [buyerSignDate, setBuyerSignDate] = useState('');

  // Discount
  const [hasDiscount, setHasDiscount] = useState<boolean>(true);
  const [discountAmount, setDiscountAmount] = useState<number>(5000);

  // Installments
  const [hasInstallments, setHasInstallments] = useState<boolean>(true);
  const [advancePercent, setAdvancePercent] = useState<number>(50);

  // Calculations
  const calculateItemTotal = (item: PaymentItem): number => {
    if (item.isFree || item.unitPrice === 'FREE') return 0;
    const q = Number(item.qty) || 0;
    const p = Number(item.unitPrice) || 0;
    return q * p;
  };

  const subTotal = paymentItems.reduce((acc, item) => acc + calculateItemTotal(item), 0);
  const discountVal = hasDiscount ? (Number(discountAmount) || 0) : 0;
  const totalContractValue = Math.max(0, subTotal - discountVal);

  const advancePaymentAmount = Math.round(totalContractValue * (advancePercent / 100));
  const remainingBalanceAmount = totalContractValue - advancePaymentAmount;

  // Add Item
  const handleAddItem = () => {
    const newItem: PaymentItem = {
      id: Date.now().toString(),
      description: 'Reels Video Creation',
      qty: 1,
      unitPrice: 2000,
      isFree: false
    };
    setPaymentItems([...paymentItems, newItem]);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    if (paymentItems.length <= 1) {
      alert('At least one item is required in the payment summary.');
      return;
    }
    setPaymentItems(paymentItems.filter(item => item.id !== id));
  };

  // Update Item
  const handleUpdateItem = (id: string, field: keyof PaymentItem, value: any) => {
    setPaymentItems(paymentItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'isFree' && value === true) {
          updated.unitPrice = 'FREE';
          if (updated.qty === 0 || updated.qty === '0') updated.qty = '—';
        } else if (field === 'isFree' && value === false) {
          if (updated.unitPrice === 'FREE') updated.unitPrice = 1000;
          if (updated.qty === '—') updated.qty = 1;
        }
        return updated;
      }
      return item;
    }));
  };

  // Handle client quick selection
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) return;

    const client = data.clients.find(c => c.id === clientId);
    if (client) {
      setPreparedFor(client.company || client.name);
      if (client.phone) setPhone(client.phone);
      if (client.email) setEmail(client.email);
      if (client.notes && client.notes.includes('http')) {
        setWebsite(client.notes.trim());
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields to default template values?')) {
      setProposalFor('WEBSITE REDESIGN');
      setPreparedFor('PREMIUM INTERIOR BD');
      setAddress('Dhaka, Bangladesh');
      setPhone('+880 1712-345678');
      setEmail('info@premiuminteriorbd.com');
      setWebsite('premiuminteriorbd.com');
      setProposalDate(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
      setProject('Complete Website Redesign & Redevelopment (Existing site update)');
      setValidity('15 days from proposal date');
      setSelectedClientId('');

      setServicePackage('Customized');
      setContractPeriod('July 9, 2026 – August 9, 2026 (1 Month)');
      setPlatform('Facebook');
      setStaticGraphics('15 designs × BDT 1,000 each');
      setMotionVideos('4 videos × BDT 2,500 each');
      setFestivalContents('Included FREE with package');

      setPaymentItems([
        { id: '1', description: 'Static Graphics Design', qty: 15, unitPrice: 1000, isFree: false },
        { id: '2', description: 'Motion Video Creation', qty: 4, unitPrice: 2500, isFree: false },
        { id: '3', description: 'All Festival Contents', qty: '—', unitPrice: 'FREE', isFree: true }
      ]);
      setHasDiscount(true);
      setAdvancePercent(50);
      setSellerRepName('');
      setSellerSignDate('');
      setBuyerRepName('');
      setBuyerSignDate('');
    }
  };

  // =========================================================================
  // DIRECT 1:1 HIGH-RES 3-PAGE PDF DOWNLOAD
  // =========================================================================
  const handleDownloadPdf = async () => {
    const p1 = document.getElementById('export-page-1');
    const p2 = document.getElementById('export-page-2');
    const p3 = document.getElementById('export-page-3');
    const p4 = document.getElementById('export-page-4');

    if (!p1 || !p2 || !p3 || !p4) {
      window.print();
      return;
    }

    setIsGeneratingPdf(true);
    let tempMount: HTMLDivElement | null = null;
    try {
      const html2canvas = (window as any).html2canvas;
      const jspdfLib = (window as any).jspdf;

      if (!html2canvas || !jspdfLib) {
        alert('PDF components are initializing. Please try again in 2 seconds.');
        setIsGeneratingPdf(false);
        return;
      }

      if ((document as any).fonts && (document as any).fonts.ready) {
        await (document as any).fonts.ready;
      }

      tempMount = document.createElement('div');
      tempMount.style.position = 'fixed';
      tempMount.style.top = '0';
      tempMount.style.left = '0';
      tempMount.style.width = '794px';
      tempMount.style.zIndex = '999999';
      tempMount.style.backgroundColor = '#ffffff';
      tempMount.style.pointerEvents = 'none';

      const clone1 = p1.cloneNode(true) as HTMLElement;
      const clone2 = p2.cloneNode(true) as HTMLElement;
      const clone3 = p3.cloneNode(true) as HTMLElement;
      const clone4 = p4.cloneNode(true) as HTMLElement;

      const canvasOpts = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123
      };

      // 1. Mount Page 1
      tempMount.appendChild(clone1);
      document.body.appendChild(tempMount);
      await new Promise((r) => setTimeout(r, 120));
      const canvas1 = await html2canvas(clone1, canvasOpts);
      const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);

      // 2. Mount Page 2
      tempMount.innerHTML = '';
      tempMount.appendChild(clone2);
      await new Promise((r) => setTimeout(r, 100));
      const canvas2 = await html2canvas(clone2, canvasOpts);
      const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);

      // 3. Mount Page 3
      tempMount.innerHTML = '';
      tempMount.appendChild(clone3);
      await new Promise((r) => setTimeout(r, 100));
      const canvas3 = await html2canvas(clone3, canvasOpts);
      const imgData3 = canvas3.toDataURL('image/jpeg', 0.98);

      // 4. Mount Page 4
      tempMount.innerHTML = '';
      tempMount.appendChild(clone4);
      await new Promise((r) => setTimeout(r, 100));
      const canvas4 = await html2canvas(clone4, canvasOpts);
      const imgData4 = canvas4.toDataURL('image/jpeg', 0.98);

      if (document.body.contains(tempMount)) {
        document.body.removeChild(tempMount);
        tempMount = null;
      }

      const { jsPDF } = jspdfLib;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      pdf.addImage(imgData1, 'JPEG', 0, 0, 210, 297);
      pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData2, 'JPEG', 0, 0, 210, 297);
      pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData3, 'JPEG', 0, 0, 210, 297);
      pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData4, 'JPEG', 0, 0, 210, 297);

      const cleanClientName = (preparedFor || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Euro_IT_Proposal_${cleanClientName}.pdf`);
    } catch (err) {
      console.error('Direct PDF export error:', err);
      if (tempMount && document.body.contains(tempMount)) {
        document.body.removeChild(tempMount);
      }
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Shared Page 1 Content Component
  const renderPage1Content = () => (
    <div 
      className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white relative flex flex-col justify-between overflow-hidden shadow-2xl rounded-lg border border-slate-200/90"
      style={{ padding: '36px 42px', boxSizing: 'border-box', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      {/* WATERMARK LOGO */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 select-none flex items-center justify-center">
        <img 
          src={logoSrc} 
          crossOrigin="anonymous"
          alt="Euro IT Watermark" 
          className="w-[440px] h-auto object-contain opacity-[0.075]" 
        />
      </div>

      {/* Top Content (Header + Divider + Title + Table) */}
      <div className="relative z-10">
        
        {/* Header: Logo on left, Company details on right */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center pt-0.5">
            <img 
              src={logoSrc} 
              crossOrigin="anonymous"
              alt="Euro IT Logo" 
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          <div className="text-right space-y-0.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-tight">
              EURO IT
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium italic">
              Digital Marketing & IT Services
            </p>
            <p className="text-[11px] text-slate-800 font-semibold pt-0.5">
              euroitechnology.com &nbsp;|&nbsp; 01339844255
            </p>
            <p className="text-[11px] text-slate-600 font-mono">
              euroitofficial@gmail.com
            </p>
          </div>
        </div>

        {/* Gold Horizontal Divider Line */}
        <div className="w-full h-[2.5px] bg-[#c59b27] mt-3.5 mb-6 rounded-full" />

        {/* Proposal For Title */}
        <div className="text-center pt-1 pb-5">
          <h1 className="text-lg sm:text-[22px] font-black text-[#0d1f3d] tracking-[0.08em] uppercase">
            PROPOSAL FOR {proposalFor || 'WEBSITE REDESIGN'}
          </h1>
        </div>

        {/* Main Proposal Information Table */}
        <div className="rounded-[4px] shadow-xs mt-1 bg-white" style={{ border: '1.5px solid #94a3b8' }}>
          {/* Row 1: Prepared for & Proposal date */}
          <div style={{ height: '32px' }}>
            <svg width="100%" height="32" style={{ display: 'block' }}>
              <rect x="0" y="0" width="20%" height="32" fill="#f3f4f6" />
              <rect x="50%" y="0" width="20%" height="32" fill="#f3f4f6" />
              <line x1="20%" y1="0" x2="20%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="50%" y1="0" x2="50%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="70%" y1="0" x2="70%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="0" y1="32" x2="100%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="14" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="700">Prepared for</text>
              <text x="22%" y="20.5" fill="#020617" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="700">{preparedFor || '-'}</text>
              <text x="52%" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="700">Proposal date</text>
              <text x="72%" y="20.5" fill="#020617" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="600">{proposalDate || '-'}</text>
            </svg>
          </div>

          {/* Row 2: Phone & Email */}
          {(phone || email) && (
            <div style={{ height: '32px' }}>
              <svg width="100%" height="32" style={{ display: 'block' }}>
                <rect x="0" y="0" width="20%" height="32" fill="#f3f4f6" />
                <rect x="50%" y="0" width="20%" height="32" fill="#f3f4f6" />
                <line x1="20%" y1="0" x2="20%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="50%" y1="0" x2="50%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="70%" y1="0" x2="70%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="0" y1="32" x2="100%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="14" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="700">Phone</text>
                <text x="22%" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="600">{phone || '-'}</text>
                <text x="52%" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="700">Email</text>
                <text x="72%" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="600">{email || '-'}</text>
              </svg>
            </div>
          )}

          {/* Row 3: Address & Website */}
          {(address || website) && (
            <div style={{ height: '32px' }}>
              <svg width="100%" height="32" style={{ display: 'block' }}>
                <rect x="0" y="0" width="20%" height="32" fill="#f3f4f6" />
                <rect x="50%" y="0" width="20%" height="32" fill="#f3f4f6" />
                <line x1="20%" y1="0" x2="20%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="50%" y1="0" x2="50%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="70%" y1="0" x2="70%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="0" y1="32" x2="100%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
                <text x="14" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="700">Address</text>
                <text x="22%" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="600">{address || '-'}</text>
                <text x="52%" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="700">Website</text>
                <text x="72%" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="600">{website || '-'}</text>
              </svg>
            </div>
          )}

          {/* Row 4: Project */}
          <div style={{ height: '32px' }}>
            <svg width="100%" height="32" style={{ display: 'block' }}>
              <rect x="0" y="0" width="20%" height="32" fill="#f3f4f6" />
              <line x1="20%" y1="0" x2="20%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="0" y1="32" x2="100%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="14" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="700">Project</text>
              <text x="22%" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="600">{project || '-'}</text>
            </svg>
          </div>

          {/* Row 5: Validity */}
          <div style={{ height: '32px' }}>
            <svg width="100%" height="32" style={{ display: 'block' }}>
              <rect x="0" y="0" width="20%" height="32" fill="#f3f4f6" />
              <line x1="20%" y1="0" x2="20%" y2="32" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="14" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="700">Validity</text>
              <text x="22%" y="20.5" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="600">{validity || '-'}</text>
            </svg>
          </div>
        </div>

      </div>

      {/* Document Footer - Bottom Right */}
      <div className="relative z-10 pt-8 flex justify-end items-center mt-auto">
        <span className="text-[11px] font-semibold text-slate-500 font-mono tracking-wider">
          EURO IT &nbsp;|&nbsp; 1
        </span>
      </div>
    </div>
  );

  // Shared Page 2 Content Component
  const renderPage2Content = () => (
    <div 
      className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white relative flex flex-col justify-between overflow-hidden shadow-2xl rounded-lg border border-slate-200/90"
      style={{ padding: '36px 42px', boxSizing: 'border-box', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      {/* WATERMARK LOGO */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 select-none flex items-center justify-center">
        <img 
          src={logoSrc} 
          crossOrigin="anonymous"
          alt="Euro IT Watermark" 
          className="w-[440px] h-auto object-contain opacity-[0.075]" 
        />
      </div>

      {/* Page 2 Top Content */}
      <div className="relative z-10 space-y-5">
        
        {/* Header: Logo on left, Company details on right */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center pt-0.5">
            <img 
              src={logoSrc} 
              crossOrigin="anonymous"
              alt="Euro IT Logo" 
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          <div className="text-right space-y-0.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-tight">
              EURO IT
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium italic">
              Digital Marketing & IT Services
            </p>
            <p className="text-[11px] text-slate-800 font-semibold pt-0.5">
              euroitechnology.com &nbsp;|&nbsp; 01339844255
            </p>
            <p className="text-[11px] text-slate-600 font-mono">
              euroitofficial@gmail.com
            </p>
          </div>
        </div>

        {/* Gold Horizontal Divider Line */}
        <div className="w-full h-[2.5px] bg-[#c59b27] mt-3.5 mb-5 rounded-full" />

        {/* 1. SECTION: SERVICE DETAILS */}
        <div>
          {/* Black Section Heading Banner with Gold Indicator */}
          <div className="mb-3 rounded-[2px] overflow-hidden bg-black" style={{ height: '26px' }}>
            <svg width="100%" height="26" style={{ display: 'block' }}>
              <rect x="0" y="0" width="8" height="26" fill="#c59b27" />
              <text 
                x="18" 
                y="17" 
                fill="#ffffff" 
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                fontSize="11.5" 
                fontWeight="900" 
                letterSpacing="0.08em"
              >
                SERVICE DETAILS
              </text>
            </svg>
          </div>

          {/* Gold Bordered Service Details Table */}
          <div className="bg-white shadow-xs rounded-[2px] overflow-hidden" style={{ border: '1.5px solid #e2cf94' }}>
            {/* Row 1 */}
            <div className="border-b border-[#f0e4c3]" style={{ height: '28px' }}>
              <svg width="100%" height="28" style={{ display: 'block' }}>
                <rect x="0" y="0" width="30%" height="28" fill="#fefce8" fillOpacity="0.5" />
                <text x="14" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700">Service Package</text>
                <line x1="30%" y1="0" x2="30%" y2="28" stroke="#f0e4c3" />
                <text x="32%" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="500">{servicePackage || '-'}</text>
              </svg>
            </div>

            {/* Row 2 */}
            <div className="border-b border-[#f0e4c3]" style={{ height: '28px' }}>
              <svg width="100%" height="28" style={{ display: 'block' }}>
                <rect x="0" y="0" width="30%" height="28" fill="#fefce8" fillOpacity="0.5" />
                <text x="14" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700">Contract Period</text>
                <line x1="30%" y1="0" x2="30%" y2="28" stroke="#f0e4c3" />
                <text x="32%" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="500">{contractPeriod || '-'}</text>
              </svg>
            </div>

            {/* Row 3 */}
            <div className="border-b border-[#f0e4c3]" style={{ height: '28px' }}>
              <svg width="100%" height="28" style={{ display: 'block' }}>
                <rect x="0" y="0" width="30%" height="28" fill="#fefce8" fillOpacity="0.5" />
                <text x="14" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700">Platform</text>
                <line x1="30%" y1="0" x2="30%" y2="28" stroke="#f0e4c3" />
                <text x="32%" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="500">{platform || '-'}</text>
              </svg>
            </div>

            {/* Row 4 */}
            <div className="border-b border-[#f0e4c3]" style={{ height: '28px' }}>
              <svg width="100%" height="28" style={{ display: 'block' }}>
                <rect x="0" y="0" width="30%" height="28" fill="#fefce8" fillOpacity="0.5" />
                <text x="14" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700">Static Graphics</text>
                <line x1="30%" y1="0" x2="30%" y2="28" stroke="#f0e4c3" />
                <text x="32%" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="500">{staticGraphics || '-'}</text>
              </svg>
            </div>

            {/* Row 5 */}
            <div className="border-b border-[#f0e4c3]" style={{ height: '28px' }}>
              <svg width="100%" height="28" style={{ display: 'block' }}>
                <rect x="0" y="0" width="30%" height="28" fill="#fefce8" fillOpacity="0.5" />
                <text x="14" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700">Motion Videos</text>
                <line x1="30%" y1="0" x2="30%" y2="28" stroke="#f0e4c3" />
                <text x="32%" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="500">{motionVideos || '-'}</text>
              </svg>
            </div>

            {/* Row 6 */}
            <div style={{ height: '28px' }}>
              <svg width="100%" height="28" style={{ display: 'block' }}>
                <rect x="0" y="0" width="30%" height="28" fill="#fefce8" fillOpacity="0.5" />
                <text x="14" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700">Festival Contents</text>
                <line x1="30%" y1="0" x2="30%" y2="28" stroke="#f0e4c3" />
                <text x="32%" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="500">{festivalContents || '-'}</text>
              </svg>
            </div>
          </div>
        </div>

        {/* 2. SECTION: PAYMENT SUMMARY */}
        <div>
          {/* Black Section Heading Banner with Gold Indicator */}
          <div className="mb-3 rounded-[2px] overflow-hidden bg-black" style={{ height: '26px' }}>
            <svg width="100%" height="26" style={{ display: 'block' }}>
              <rect x="0" y="0" width="8" height="26" fill="#c59b27" />
              <text 
                x="18" 
                y="17" 
                fill="#ffffff" 
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                fontSize="11.5" 
                fontWeight="900" 
                letterSpacing="0.08em"
              >
                PAYMENT SUMMARY
              </text>
            </svg>
          </div>

          {/* Payment Summary Table */}
          <div className="bg-white shadow-xs rounded-[2px] overflow-hidden" style={{ border: '1.5px solid #94a3b8' }}>
            {/* Header with SVG */}
            <div className="bg-[#0a0a0a]" style={{ height: '28px' }}>
              <svg width="100%" height="28" style={{ display: 'block' }}>
                <text x="14" y="18" fill="#c59b27" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700" letterSpacing="0.06em">DESCRIPTION</text>
                <line x1="42%" y1="0" x2="42%" y2="28" stroke="#262626" />
                <text x="49%" y="18" textAnchor="middle" fill="#c59b27" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700" letterSpacing="0.06em">QTY</text>
                <line x1="56%" y1="0" x2="56%" y2="28" stroke="#262626" />
                <text x="75%" y="18" textAnchor="end" fill="#c59b27" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700" letterSpacing="0.06em">UNIT PRICE (BDT)</text>
                <line x1="78%" y1="0" x2="78%" y2="28" stroke="#262626" />
                <text x="97%" y="18" textAnchor="end" fill="#c59b27" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700" letterSpacing="0.06em">TOTAL (BDT)</text>
              </svg>
            </div>

            {/* Items */}
            {paymentItems.map((item) => {
              const itemTotal = calculateItemTotal(item);
              return (
                <div key={item.id} className="border-b border-[#cbd5e1]" style={{ height: '28px' }}>
                  <svg width="100%" height="28" style={{ display: 'block' }}>
                    {/* Description */}
                    <text x="14" y="18" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="500">
                      {item.description}
                    </text>
                    {/* Divider 1 */}
                    <line x1="42%" y1="0" x2="42%" y2="28" stroke="#cbd5e1" />
                    {/* Qty */}
                    <text x="49%" y="18" textAnchor="middle" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="500">
                      {item.qty}
                    </text>
                    {/* Divider 2 */}
                    <line x1="56%" y1="0" x2="56%" y2="28" stroke="#cbd5e1" />
                    {/* Unit Price */}
                    <text x="75%" y="18" textAnchor="end" fill={item.isFree ? "#c59b27" : "#0f172a"} fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight={item.isFree ? "700" : "500"}>
                      {item.isFree ? "FREE" : Number(item.unitPrice).toLocaleString()}
                    </text>
                    {/* Divider 3 */}
                    <line x1="78%" y1="0" x2="78%" y2="28" stroke="#cbd5e1" />
                    {/* Total */}
                    <text x="97%" y="18" textAnchor="end" fill={item.isFree ? "#c59b27" : "#0f172a"} fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="600">
                      {item.isFree ? "FREE" : itemTotal.toLocaleString()}
                    </text>
                  </svg>
                </div>
              );
            })}

            {/* Sub-Total Row */}
            <div className="border-b border-[#cbd5e1]" style={{ height: '28px' }}>
              <svg width="100%" height="28" style={{ display: 'block' }}>
                <rect x="0" y="0" width="100%" height="28" fill="#f8fafc" />
                <text x="75%" y="18" textAnchor="end" fill="#334155" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="600">Sub-Total</text>
                <line x1="78%" y1="0" x2="78%" y2="28" stroke="#cbd5e1" />
                <text x="97%" y="18" textAnchor="end" fill="#0f172a" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700">{subTotal.toLocaleString()}</text>
              </svg>
            </div>

            {/* Discount Row (Optional) */}
            {hasDiscount && discountVal > 0 && (
              <div className="border-b border-[#cbd5e1]" style={{ height: '28px' }}>
                <svg width="100%" height="28" style={{ display: 'block' }}>
                  <rect x="0" y="0" width="100%" height="28" fill="#fef3c7" fillOpacity="0.3" />
                  <text x="75%" y="18" textAnchor="end" fill="#92400e" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="600">Discount</text>
                  <line x1="78%" y1="0" x2="78%" y2="28" stroke="#cbd5e1" />
                  <text x="97%" y="18" textAnchor="end" fill="#92400e" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700">({discountVal.toLocaleString()})</text>
                </svg>
              </div>
            )}

            {/* TOTAL CONTRACT VALUE Row - SVG Bar */}
            <div style={{ height: '30px' }}>
              <svg width="100%" height="30" style={{ display: 'block' }}>
                <rect x="0" y="0" width="78%" height="30" fill="#0a0a0a" />
                <text x="75%" y="20" textAnchor="end" fill="#ffffff" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="900" letterSpacing="0.06em">TOTAL CONTRACT VALUE</text>
                <rect x="78%" y="0" width="22%" height="30" fill="#c59b27" />
                <text x="97%" y="20" textAnchor="end" fill="#000000" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="12" fontWeight="900">{totalContractValue.toLocaleString()}</text>
              </svg>
            </div>

            {/* Installments */}
            {hasInstallments && (
              <>
                <div className="border-b border-[#cbd5e1]" style={{ height: '28px' }}>
                  <svg width="100%" height="28" style={{ display: 'block' }}>
                    <text x="14" y="18" fill="#065f46" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="500">Advance Payment — Installment 1 ({advancePercent}%)</text>
                    <line x1="78%" y1="0" x2="78%" y2="28" stroke="#cbd5e1" />
                    <text x="97%" y="18" textAnchor="end" fill="#065f46" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700">{advancePaymentAmount.toLocaleString()}</text>
                  </svg>
                </div>

                <div style={{ height: '28px' }}>
                  <svg width="100%" height="28" style={{ display: 'block' }}>
                    <text x="14" y="18" fill="#065f46" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="500">Remaining Balance — Installment 2 ({100 - advancePercent}%)</text>
                    <line x1="78%" y1="0" x2="78%" y2="28" stroke="#cbd5e1" />
                    <text x="97%" y="18" textAnchor="end" fill="#065f46" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700">{remainingBalanceAmount.toLocaleString()}</text>
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>

      </div>



      {/* Document Footer - Bottom Right */}
      <div className="relative z-10 pt-8 flex justify-end items-center mt-auto">
        <span className="text-[11px] font-semibold text-slate-500 font-mono tracking-wider">
          EURO IT &nbsp;|&nbsp; 2
        </span>
      </div>
    </div>
  );

  // Shared Page 3 Content Component (Terms and Conditions)
  const renderPage3Content = () => (
    <div 
      className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white relative flex flex-col justify-between overflow-hidden shadow-2xl rounded-lg border border-slate-200/90"
      style={{ padding: '36px 42px', boxSizing: 'border-box', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      {/* WATERMARK LOGO */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 select-none flex items-center justify-center">
        <img 
          src={logoSrc} 
          crossOrigin="anonymous"
          alt="Euro IT Watermark" 
          className="w-[440px] h-auto object-contain opacity-[0.075]" 
        />
      </div>

      {/* Page 3 Top Content */}
      <div className="relative z-10 flex flex-col flex-1">
        
        {/* Header: Logo on left, Company details on right */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center pt-0.5">
            <img 
              src={logoSrc} 
              crossOrigin="anonymous"
              alt="Euro IT Logo" 
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          <div className="text-right space-y-0.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-tight">
              EURO IT
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium italic">
              Digital Marketing & IT Services
            </p>
            <p className="text-[11px] text-slate-800 font-semibold pt-0.5">
              euroitechnology.com &nbsp;|&nbsp; 01339844255
            </p>
            <p className="text-[11px] text-slate-600 font-mono">
              euroitofficial@gmail.com
            </p>
          </div>
        </div>

        {/* Gold Horizontal Divider Line */}
        <div className="w-full h-[2.5px] bg-[#c59b27] mt-3 mb-3.5 rounded-full" />

        {/* TERMS AND CONDITIONS Banner */}
        <div className="mb-2.5 rounded-[2px] overflow-hidden bg-black" style={{ height: '26px' }}>
          <svg width="100%" height="26" style={{ display: 'block' }}>
            <rect x="0" y="0" width="8" height="26" fill="#c59b27" />
            <text 
              x="18" 
              y="17" 
              fill="#ffffff" 
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              fontSize="11.5" 
              fontWeight="900" 
              letterSpacing="0.08em"
            >
              TERMS AND CONDITIONS
            </text>
          </svg>
        </div>

        {/* 12 Clauses List */}
        <div className="space-y-1 text-[8.2px] leading-[1.28] text-slate-800">
          {termsList.map((term, index) => (
            <div key={term.id} className="space-y-0.5">
              <h4 className="font-bold text-slate-950 text-[8.8px]">
                <span className="text-[#c59b27] font-black mr-1">{index + 1}.</span>
                {term.title}
              </h4>
              <p className="text-slate-700 text-justify font-normal">
                {term.content}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Gold Line */}
        <div className="w-full h-[2px] bg-[#c59b27] mt-auto mb-1.5 rounded-full" />
      </div>

      {/* Document Footer - Bottom Right */}
      <div className="relative z-10 pt-1 flex justify-end items-center mt-auto">
        <span className="text-[11px] font-semibold text-slate-500 font-mono tracking-wider">
          EURO IT &nbsp;|&nbsp; 3
        </span>
      </div>
    </div>
  );

  // Shared Page 4 Content Component (Signatures and Execution)
  const renderPage4Content = () => (
    <div 
      className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] bg-white relative flex flex-col justify-between overflow-hidden shadow-2xl rounded-lg border border-slate-200/90"
      style={{ padding: '36px 42px', boxSizing: 'border-box', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      {/* WATERMARK LOGO */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 select-none flex items-center justify-center">
        <img 
          src={logoSrc} 
          crossOrigin="anonymous"
          alt="Euro IT Watermark" 
          className="w-[440px] h-auto object-contain opacity-[0.075]" 
        />
      </div>

      {/* Page 4 Top Header & Content */}
      <div className="relative z-10 flex flex-col flex-1">
        
        {/* Header: Logo on left, Company details on right */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center pt-0.5">
            <img 
              src={logoSrc} 
              crossOrigin="anonymous"
              alt="Euro IT Logo" 
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          <div className="text-right space-y-0.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-tight">
              EURO IT
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium italic">
              Digital Marketing & IT Services
            </p>
            <p className="text-[11px] text-slate-800 font-semibold pt-0.5">
              euroitechnology.com &nbsp;|&nbsp; 01339844255
            </p>
            <p className="text-[11px] text-slate-600 font-mono">
              euroitofficial@gmail.com
            </p>
          </div>
        </div>

        {/* Gold Horizontal Divider Line */}
        <div className="w-full h-[2.5px] bg-[#c59b27] mt-3.5 mb-5 rounded-full" />

        {/* SIGNATURES AND EXECUTION Banner */}
        <div className="mb-2 rounded-[2px] overflow-hidden bg-black" style={{ height: '26px' }}>
          <svg width="100%" height="26" style={{ display: 'block' }}>
            <rect x="0" y="0" width="8" height="26" fill="#c59b27" />
            <text 
              x="18" 
              y="17" 
              fill="#ffffff" 
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              fontSize="11.5" 
              fontWeight="900" 
              letterSpacing="0.08em"
            >
              SIGNATURES AND EXECUTION
            </text>
          </svg>
        </div>

        {/* Disclaimer / Acceptance Subtitle */}
        <p className="text-[10.5px] text-slate-700 italic mb-6 leading-relaxed">
          By signing below, both parties confirm they have read, understood, and agree to be bound by the terms and conditions of this Agreement.
        </p>

        {/* 2-COLUMN SIGNATURE BLOCKS */}
        <div className="grid grid-cols-2 gap-10 mb-8">
          
          {/* SELLER COLUMN */}
          <div className="space-y-4">
            {/* SELLER Gold Banner - SVG Vector Centering */}
            <div className="rounded-[2px] overflow-hidden bg-[#c59b27]" style={{ height: '24px' }}>
              <svg width="100%" height="24" style={{ display: 'block' }}>
                <rect x="0" y="0" width="100%" height="24" fill="#c59b27" />
                <text 
                  x="12" 
                  y="16" 
                  fill="#000000" 
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                  fontSize="11" 
                  fontWeight="900" 
                  letterSpacing="0.08em"
                >
                  SELLER
                </text>
              </svg>
            </div>

            <div className="text-xs text-slate-800">
              <span className="font-semibold text-slate-600">Company: </span>
              <span className="font-bold text-slate-950">EURO IT</span>
            </div>

            {/* Signature row */}
            <div className="pt-6 border-b-2 border-slate-900 pb-0.5">
              <span className="text-[10px] text-slate-400 font-medium select-none">Authorized Signature</span>
            </div>

            {/* Rep Name & Title */}
            <div className="pt-2 border-b-2 border-slate-900 pb-0.5">
              <div className="text-xs font-bold text-slate-950">
                {sellerRepName || <span className="text-slate-400 font-normal">Full Name & Designation</span>}
              </div>
            </div>

            {/* Date */}
            <div className="pt-2 border-b-2 border-slate-900 pb-0.5">
              <div className="text-xs font-bold text-slate-950">
                {sellerSignDate || <span className="text-slate-400 font-normal">Date</span>}
              </div>
            </div>

            {/* Stamp */}
            <div className="pt-2 border-b-2 border-slate-900 pb-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Official Stamp (if applicable)</span>
            </div>
          </div>

          {/* BUYER COLUMN */}
          <div className="space-y-4">
            {/* BUYER Gold Banner - SVG Vector Centering */}
            <div className="rounded-[2px] overflow-hidden bg-[#c59b27]" style={{ height: '24px' }}>
              <svg width="100%" height="24" style={{ display: 'block' }}>
                <rect x="0" y="0" width="100%" height="24" fill="#c59b27" />
                <text 
                  x="12" 
                  y="16" 
                  fill="#000000" 
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                  fontSize="11" 
                  fontWeight="900" 
                  letterSpacing="0.08em"
                >
                  BUYER
                </text>
              </svg>
            </div>

            <div className="text-xs text-slate-800">
              <span className="font-semibold text-slate-600">Company: </span>
              <span className="font-bold text-slate-950">{preparedFor || 'Client Company'}</span>
            </div>

            {/* Signature row */}
            <div className="pt-6 border-b-2 border-slate-900 pb-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Authorized Signature</span>
            </div>

            {/* Rep Name & Title */}
            <div className="pt-2 border-b-2 border-slate-900 pb-0.5">
              <div className="text-xs font-bold text-slate-950">
                {buyerRepName || <span className="text-slate-400 font-normal">Full Name & Designation</span>}
              </div>
            </div>

            {/* Date */}
            <div className="pt-2 border-b-2 border-slate-900 pb-0.5">
              <div className="text-xs font-bold text-slate-950">
                {buyerSignDate || <span className="text-slate-400 font-normal">Date</span>}
              </div>
            </div>

            {/* Stamp */}
            <div className="pt-2 border-b-2 border-slate-900 pb-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Official Stamp (if applicable)</span>
            </div>
          </div>

        </div>

        {/* Bottom Legal Binding Note & Contact */}
        <div className="pt-6 mt-4 border-t border-slate-300 text-center space-y-1">
          <p className="text-[10px] text-slate-500 italic">
            This document constitutes a legally binding agreement. Retain a signed copy for your records.
          </p>
          <p className="text-[10.5px] text-[#c59b27] font-bold tracking-wide">
            EURO IT &nbsp;•&nbsp; www.euroitechnology.com &nbsp;•&nbsp; contact@euroitechnology.com &nbsp;•&nbsp; +88 01339-844255
          </p>
        </div>

      </div>

      {/* Document Footer - Bottom Right */}
      <div className="relative z-10 pt-4 flex justify-end items-center mt-auto">
        <span className="text-[11px] font-semibold text-slate-500 font-mono tracking-wider">
          EURO IT &nbsp;|&nbsp; 4
        </span>
      </div>
    </div>
  );


  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSignature className="w-7 h-7 text-blue-600" />
            Client Proposal & Agreement Generator
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            4-Page Official Euro IT Agreement with Live Synchronized Preview & Instant Direct PDF Download.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all shadow-sm"
            title="Reset Form"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          {/* PRIMARY ACTION: DIRECT PDF DOWNLOAD */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating 4-Page Official PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF Document
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Side Controls, Right Side Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls & Input Fields */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-5 print:hidden">
          
          {/* Page Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1">
            <button
              onClick={() => setActiveTab('page1')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'page1'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Page 1
            </button>
            <button
              onClick={() => setActiveTab('page2')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'page2'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              Page 2
            </button>
            <button
              onClick={() => setActiveTab('page3')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'page3'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Page 3
            </button>
            <button
              onClick={() => setActiveTab('page4')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'page4'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSignature className="w-3.5 h-3.5" />
              Page 4
            </button>
          </div>

          {/* ======================= TAB 1: PAGE 1 FIELDS ======================= */}
          {activeTab === 'page1' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Page 1: Basic Information
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                  Page 1 Form
                </span>
              </div>

              {/* Optional Quick Client Selector */}
              {data.clients && data.clients.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Quick Select Existing Client (Optional)
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleClientSelect(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  >
                    <option value="">-- Choose Client or type manually below --</option>
                    {data.clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Proposal For */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-600" />
                  Proposal For (Document Title)
                </label>
                <input
                  type="text"
                  value={proposalFor}
                  onChange={(e) => setProposalFor(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. WEBSITE REDESIGN"
                />
              </div>

              {/* Client Name & Proposal Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Prepared For (Client Name)
                  </label>
                  <input
                    type="text"
                    value={preparedFor}
                    onChange={(e) => setPreparedFor(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. PREMIUM INTERIOR BD"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Proposal Date
                  </label>
                  <input
                    type="text"
                    value={proposalDate}
                    onChange={(e) => setProposalDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. 20 Aug 2026"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Client Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Dhaka, Bangladesh"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. 01712-345678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. info@client.com"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. premiuminteriorbd.com"
                />
              </div>

              {/* Project */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  Project Scope / Title
                </label>
                <textarea
                  rows={2}
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="e.g. Complete Website Redesign & Redevelopment"
                />
              </div>

              {/* Validity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Validity Period
                </label>
                <input
                  type="text"
                  value={validity}
                  onChange={(e) => setValidity(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. 15 days from proposal date"
                />
              </div>
            </div>
          )}

          {/* ======================= TAB 2: PAGE 2 FIELDS ======================= */}
          {activeTab === 'page2' && (
            <div className="space-y-6">
              
              {/* SECTION A: SERVICE DETAILS */}
              <div className="space-y-3.5 border-b border-slate-200 pb-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-black border border-amber-400 rounded-xs" />
                    Service Details (Header 1)
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    Scope & Period
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Service Package
                  </label>
                  <input
                    type="text"
                    value={servicePackage}
                    onChange={(e) => setServicePackage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Customized"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contract Period
                  </label>
                  <input
                    type="text"
                    value={contractPeriod}
                    onChange={(e) => setContractPeriod(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. July 9, 2026 – August 9, 2026 (1 Month)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Platform
                  </label>
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Facebook"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Static Graphics
                  </label>
                  <input
                    type="text"
                    value={staticGraphics}
                    onChange={(e) => setStaticGraphics(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. 15 designs × BDT 1,000 each"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Motion Videos
                  </label>
                  <input
                    type="text"
                    value={motionVideos}
                    onChange={(e) => setMotionVideos(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. 4 videos × BDT 2,500 each"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Festival Contents
                  </label>
                  <input
                    type="text"
                    value={festivalContents}
                    onChange={(e) => setFestivalContents(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Included FREE with package"
                  />
                </div>
              </div>

              {/* SECTION B: PAYMENT SUMMARY ITEMS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-black border border-amber-400 rounded-xs" />
                    Payment Summary Items
                  </h3>
                  <button
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Row
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentItems.map((item, index) => (
                    <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Item #{index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!item.isFree}
                              onChange={(e) => handleUpdateItem(item.id, 'isFree', e.target.checked)}
                              className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                            />
                            <span>Mark as FREE</span>
                          </label>

                          {paymentItems.length > 1 && (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Description input */}
                      <div>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Item Description"
                        />
                      </div>

                      {/* Qty & Unit Price */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Qty
                          </label>
                          <input
                            type="text"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 15 or —"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Unit Price (BDT)
                          </label>
                          <input
                            type="text"
                            value={item.isFree ? 'FREE' : item.unitPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                            disabled={item.isFree}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                            placeholder="e.g. 1000 or FREE"
                          />
                        </div>
                      </div>

                      {/* Row Computed Total Display */}
                      <div className="flex justify-between items-center text-[11px] pt-1 text-slate-500">
                        <span>Line Total:</span>
                        <span className="font-bold text-slate-800">
                          {item.isFree ? (
                            <span className="text-amber-600">FREE</span>
                          ) : (
                            `${(calculateItemTotal(item)).toLocaleString()} BDT`
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount Setting */}
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasDiscount}
                        onChange={(e) => setHasDiscount(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <span>Apply Discount (Optional)</span>
                    </label>
                    <span className="text-[11px] font-semibold text-amber-700">
                      {hasDiscount ? `-${discountVal.toLocaleString()} BDT` : 'Disabled'}
                    </span>
                  </div>

                  {hasDiscount && (
                    <div>
                      <input
                        type="number"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="Discount Amount (e.g. 5000)"
                      />
                    </div>
                  )}
                </div>

                {/* Installments Breakdown Toggle */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasInstallments}
                        onChange={(e) => setHasInstallments(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span>Payment Installments Breakdown</span>
                    </label>
                  </div>

                  {hasInstallments && (
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Advance (50%):</span>
                        <span className="font-bold text-emerald-700">
                          {advancePaymentAmount.toLocaleString()} BDT
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Remaining (50%):</span>
                        <span className="font-bold text-emerald-700">
                          {remainingBalanceAmount.toLocaleString()} BDT
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Summary Badge */}
                <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold">Total Contract Value</div>
                    <div className="text-lg font-black text-amber-400">
                      {totalContractValue.toLocaleString()} BDT
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-300">
                    <div>Sub-Total: {subTotal.toLocaleString()} BDT</div>
                    {hasDiscount && <div className="text-amber-300">Discount: ({discountVal.toLocaleString()})</div>}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================= TAB 3: PAGE 3 FIELDS (TERMS & CONDITIONS) ======================= */}
          {activeTab === 'page3' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Page 3: Terms & Conditions (12 Clauses)
                </h2>
                <button
                  onClick={() => setTermsList(DEFAULT_TERMS)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="Reset all clauses to default"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Defaults
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Customize any of the standard legal clauses below. All changes will reflect in real-time in the live preview and in the downloaded PDF.
              </p>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {termsList.map((term, index) => (
                  <div key={term.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <span className="text-[#c59b27] font-black">{index + 1}.</span>
                        {term.title}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Clause Title
                      </label>
                      <input
                        type="text"
                        value={term.title}
                        onChange={(e) => {
                          const updated = [...termsList];
                          updated[index] = { ...updated[index], title: e.target.value };
                          setTermsList(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Clause Content
                      </label>
                      <textarea
                        rows={3}
                        value={term.content}
                        onChange={(e) => {
                          const updated = [...termsList];
                          updated[index] = { ...updated[index], content: e.target.value };
                          setTermsList(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-normal text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= TAB 4: PAGE 4 FIELDS (SIGNATURES & EXECUTION) ======================= */}
          {activeTab === 'page4' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-amber-500" />
                  Page 4: Signatures & Execution
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                  Page 4 Form
                </span>
              </div>

              {/* SELLER SECTION */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#c59b27] rounded-xs" />
                    SELLER (EURO IT)
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Company: EURO IT (Fixed)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Seller Representative & Designation
                  </label>
                  <input
                    type="text"
                    value={sellerRepName}
                    onChange={(e) => setSellerRepName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Rafi Md. Hasib | Business Development Head"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Seller Signature Date
                  </label>
                  <input
                    type="text"
                    value={sellerSignDate}
                    onChange={(e) => setSellerSignDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. July 8, 2026"
                  />
                </div>
              </div>

              {/* BUYER SECTION */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#c59b27] rounded-xs" />
                    BUYER (Client)
                  </h3>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    Auto-synced with Page 1: {preparedFor || 'Client Name'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Buyer Full Name & Designation
                  </label>
                  <input
                    type="text"
                    value={buyerRepName}
                    onChange={(e) => setBuyerRepName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. John Doe | Managing Director"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Leave blank to display standard "Full Name & Designation" placeholder.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Buyer Signature Date
                  </label>
                  <input
                    type="text"
                    value={buyerSignDate}
                    onChange={(e) => setBuyerSignDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. July 9, 2026 or leave blank"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Leave blank to display standard "Date" placeholder.</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick info note */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              1:1 High-Resolution 4-Page PDF Download
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Clicking <b>Download PDF Document</b> will directly export the complete 4-page official agreement to your computer with 1:1 vector fidelity.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Interactive Live Preview */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-6">
          
          {/* Top preview page indicator / switcher */}
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Live Preview:</span>
              <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 font-bold">
                {activeTab === 'page1' ? 'Page 1: Proposal Info' : activeTab === 'page2' ? 'Page 2: Service & Payment' : activeTab === 'page3' ? 'Page 3: Terms & Conditions' : 'Page 4: Signatures & Execution'}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveTab('page1')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  activeTab === 'page1' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Page 1
              </button>
              <button
                onClick={() => setActiveTab('page2')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  activeTab === 'page2' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Page 2
              </button>
              <button
                onClick={() => setActiveTab('page3')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  activeTab === 'page3' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Page 3
              </button>
              <button
                onClick={() => setActiveTab('page4')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  activeTab === 'page4' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Page 4
              </button>
            </div>
          </div>

          {/* Interactive Screen Preview Container */}
          <div className="w-full flex flex-col items-center">
            {activeTab === 'page1' ? renderPage1Content() : activeTab === 'page2' ? renderPage2Content() : activeTab === 'page3' ? renderPage3Content() : renderPage4Content()}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4-PAGE EXPORT BUNDLE FOR DIRECT HIGH-RES PDF DOWNLOAD */}
      {/* ========================================================================= */}
      <div 
        id="direct-pdf-export-bundle"
        className="fixed top-0 left-0 pointer-events-none"
        style={{ zIndex: -9999, opacity: 1, width: '794px', background: '#ffffff' }}
      >
        {/* Page 1 */}
        <div id="export-page-1" style={{ width: '794px', height: '1123px' }}>
          {renderPage1Content()}
        </div>

        {/* Page 2 */}
        <div id="export-page-2" style={{ width: '794px', height: '1123px' }}>
          {renderPage2Content()}
        </div>

        {/* Page 3 */}
        <div id="export-page-3" style={{ width: '794px', height: '1123px' }}>
          {renderPage3Content()}
        </div>

        {/* Page 4 */}
        <div id="export-page-4" style={{ width: '794px', height: '1123px' }}>
          {renderPage4Content()}
        </div>
      </div>


    </div>
  );
};
