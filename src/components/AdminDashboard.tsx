import React, { useState, useEffect } from 'react';
import { createVendor, getAllVendors, createDeal, getAllDeals, updateVendor, updateDeal, deleteVendor, deleteDeal, getAllPasses, getAllRedemptions, getDealCountByVendor, deletePass, getRedemptionCountByPass } from '../services/firestoreService';
import { deleteField } from 'firebase/firestore';
import { Vendor, Deal } from '../types';
import { PassDocument } from '../services/firestoreService';
import Button from './Button.tsx';
import ImageCarousel from './ImageCarousel';
import ContactDropdown from './ContactDropdown';
import DealReorderPanel from './DealReorderPanel';
import { getLaunchPricingData } from '../utils/pricing';

// Image preview component
const ImagePreview: React.FC<{ url?: string; alt: string }> = ({ url, alt }) => {
    if (!url || !url.trim()) return null;
    return (
        <div className="mt-2 rounded-lg overflow-hidden border border-border-subtle bg-bg-primary aspect-video w-full max-w-xs">
            <img
                src={url}
                alt={alt}
                onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.3';
                }}
                className="w-full h-full object-cover"
            />
        </div>
    );
};

// Form section with icon
interface FormSectionProps {
    icon: string;
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ icon, title, description, children, className }) => (
    <div className={`border-t border-border-subtle pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0 ${className || ''}`}>
        <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{icon}</span>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
                {description && <p className="text-xs text-text-secondary">{description}</p>}
            </div>
        </div>
        <div className="space-y-3 ml-6">
            {children}
        </div>
    </div>
);

interface DealCardPreviewProps {
    deal: Deal;
    vendor?: Vendor;
    onEdit: () => void;
    onDelete: () => void;
}

const DealCardPreview: React.FC<DealCardPreviewProps> = ({ deal, vendor, onEdit, onDelete }) => {
    const [isViewingImages, setIsViewingImages] = React.useState(false);

    // Image priority: Deal images first (carousel), fallback to vendor branding images
    const mainImage = deal.imageUrl || vendor?.imageUrl;
    const additionalImages = deal.images && deal.images.length > 0
        ? deal.images
        : (vendor?.images || []);

    const displayImages = mainImage
        ? [mainImage, ...additionalImages.filter(img => img !== mainImage)]
        : additionalImages;

    return (
        <>
            <div className="bg-bg-primary rounded-lg border border-border-subtle overflow-hidden hover:border-action-primary/50 hover:shadow-md transition-all group">
                {/* Image indicator - compact */}
                {displayImages.length > 0 && (
                    <div className="bg-action-primary/10 px-3 py-2 text-xs font-medium text-action-primary flex items-center justify-between">
                        <span>📸 {displayImages.length} image{displayImages.length !== 1 ? 's' : ''}</span>
                        <button
                            onClick={() => setIsViewingImages(true)}
                            className="text-action-primary hover:underline font-semibold"
                        >
                            View
                        </button>
                    </div>
                )}

                {/* Card Content */}
                <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-semibold text-text-primary text-sm">{deal.name}</p>
                                {deal.featured && (
                                    <span className="text-xs bg-value-highlight/30 text-value-highlight px-1.5 py-0.5 rounded font-bold">
                                        ⭐ Featured
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-text-secondary line-clamp-1">
                                {vendor?.name}
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                        {deal.offer}
                    </p>

                    {/* Tags */}
                    <div className="flex gap-1 mb-3 flex-wrap">
                        {deal.savings && (
                            <span className="text-xs bg-value-highlight/20 text-value-highlight px-1.5 py-0.5 rounded font-medium">
                                💰 R{deal.savings}
                            </span>
                        )}
                        {deal.city && (
                            <span className="text-xs bg-action-primary/20 text-action-primary px-1.5 py-0.5 rounded font-medium">
                                📍 {deal.city}
                            </span>
                        )}
                    </div>

                    {/* Contact & Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ContactDropdown
                            email={vendor?.email}
                            phone={vendor?.phone}
                            className="flex-1"
                            buttonClassName="px-2 py-1.5 text-xs"
                        />
                        <button
                            onClick={onEdit}
                            className="px-2 py-1.5 text-xs bg-action-primary/20 text-action-primary hover:bg-action-primary/40 rounded transition-colors whitespace-nowrap font-medium"
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-2 py-1.5 text-xs bg-urgency-high/20 text-urgency-high hover:bg-urgency-high/40 rounded transition-colors whitespace-nowrap font-medium"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Viewer Modal */}
            {isViewingImages && displayImages.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-bg-primary rounded-lg border border-border-subtle max-w-2xl w-full mx-4 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                            <h3 className="font-bold text-gray-900 dark:text-white">{deal.name} - Images</h3>
                            <button
                                onClick={() => setIsViewingImages(false)}
                                className="text-text-secondary hover:text-text-primary"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="h-96 w-full">
                            <ImageCarousel
                                images={displayImages}
                                alt={deal.name}
                                className="w-full h-full"
                                showDots={displayImages.length > 1}
                                showArrows={displayImages.length > 1}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'vendors' | 'deals' | 'analytics'>('vendors');
    const [activeVendorSection, setActiveVendorSection] = useState<'overview' | 'form' | 'list'>('list');
    const [activeDealSection, setActiveDealSection] = useState<'overview' | 'reorder' | 'form' | 'list'>('list');
    const [activeAnalyticsSection, setActiveAnalyticsSection] = useState<'summary' | 'purchases' | 'passes' | 'redemptions'>('summary');
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [passes, setPasses] = useState<PassDocument[]>([]);
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [configPassCount, setConfigPassCount] = useState<number>(0);
    const [isLoadingVendors, setIsLoadingVendors] = useState(false);
    const [isLoadingDeals, setIsLoadingDeals] = useState(false);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

    // Vendor form state
    const [vendorForm, setVendorForm] = useState({
        name: '',
        email: '',
        phone: '',
        pin: '',
        category: 'restaurant' as 'restaurant' | 'activity' | 'shopping',
        city: '',
        address: '',
        mapsUrl: '',
        imageUrl: '',
        images: '',
    });
    const [vendorError, setVendorError] = useState('');
    const [vendorSuccess, setVendorSuccess] = useState('');
    const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

    // Deal form state
    const [dealForm, setDealForm] = useState({
        vendorId: '',
        name: '',
        offer: '',
        description: '',
        savings: '',
        imageUrl: '',
        category: 'restaurant' as 'restaurant' | 'activity' | 'shopping',
        city: '',
        terms: '',
        featured: false,
        images: '',
    });
    const [dealError, setDealError] = useState('');
    const [dealSuccess, setDealSuccess] = useState('');
    const [editingDealId, setEditingDealId] = useState<string | null>(null);

    // Search/filter state
    const [vendorSearch, setVendorSearch] = useState('');
    const [dealSearch, setDealSearch] = useState('');

    // CSV Export functions
    const exportPassesToCSV = () => {
        const headers = ['Ticket Pack ID', 'Name', 'Email', 'Type', 'Status', 'Price (R)', 'Created', 'Expiry'];
        const rows = passes.map(p => [
            p.passId,
            p.passHolderName,
            p.email,
            p.passType,
            p.paymentStatus === 'completed' ? 'Paid' : p.passStatus === 'free' ? 'Free' : 'Pending',
            p.purchasePrice || 0,
            new Date(p.createdAt).toLocaleDateString(),
            new Date(p.expiryDate).toLocaleDateString(),
        ]);
        downloadCSV([headers, ...rows], 'ticket-packs-export.csv');
    };

    const exportRedemptionsToCSV = () => {
        const passIds = new Set(passes.map(p => p.passId));
        const headers = ['Ticket Pack ID', 'Raffle', 'Fundraiser', 'Date', 'Status'];
        const rows = redemptions.map(r => {
            const vendor = vendors.find(v => v.vendorId === r.vendorId);
            const isOrphan = !passIds.has(r.passId);
            return [
                r.passId,
                r.dealName,
                vendor?.name || 'Unknown',
                new Date(r.redeemedAt).toLocaleDateString(),
                isOrphan ? 'Orphaned' : 'Valid',
            ];
        });
        downloadCSV([headers, ...rows], 'entries-export.csv');
    };

    const downloadCSV = (data: (string | number)[][], filename: string) => {
        const csvContent = data.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    // Filtered lists
    const filteredVendors = vendors.filter(v => 
        v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.email.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        v.city.toLowerCase().includes(vendorSearch.toLowerCase())
    );
    const filteredDeals = deals.filter(d => {
        const vendor = vendors.find(v => v.vendorId === d.vendorId);
        const searchLower = dealSearch.toLowerCase();
        return d.name.toLowerCase().includes(searchLower) ||
            d.offer.toLowerCase().includes(searchLower) ||
            (d.city && d.city.toLowerCase().includes(searchLower)) ||
            (vendor && vendor.name.toLowerCase().includes(searchLower));
    });

    // Load vendors and deals on mount
    useEffect(() => {
        loadVendors();
        loadDeals();
        loadAnalytics();
    }, []);

    const loadVendors = async () => {
        setIsLoadingVendors(true);
        try {
            const data = await getAllVendors();
            setVendors(data);
        } catch (error) {
            console.error('Error loading vendors:', error);
        } finally {
            setIsLoadingVendors(false);
        }
    };

    const loadDeals = async () => {
        setIsLoadingDeals(true);
        try {
            const data = await getAllDeals();
            setDeals(data);
        } catch (error) {
            console.error('Error loading deals:', error);
        } finally {
            setIsLoadingDeals(false);
        }
    };

    const loadAnalytics = async () => {
        setIsLoadingAnalytics(true);
        try {
            const [passesData, redemptionsData, pricingData] = await Promise.all([
                getAllPasses(),
                getAllRedemptions(),
                getLaunchPricingData(),
            ]);
            setPasses(passesData);
            setRedemptions(redemptionsData);
            setConfigPassCount(pricingData.passCount);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setIsLoadingAnalytics(false);
        }
    };

    const handleAddVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        setVendorError('');
        setVendorSuccess('');

        // Validation
        if (!vendorForm.name.trim() || !vendorForm.email.trim() || !vendorForm.pin.trim()) {
            setVendorError('Please fill in all required fields (Name, Email, PIN)');
            return;
        }

        if (vendorForm.pin.length !== 4 || !/^\d+$/.test(vendorForm.pin)) {
            setVendorError('PIN must be exactly 4 digits');
            return;
        }

        try {
            if (editingVendorId) {
                // Update existing vendor - filter out undefined values to avoid Firestore errors
                const updates: Partial<Vendor> = {
                    name: vendorForm.name.trim(),
                    email: vendorForm.email.trim(),
                    phone: vendorForm.phone.trim(),
                    pin: vendorForm.pin,
                    category: vendorForm.category,
                    city: vendorForm.city.trim(),
                    address: vendorForm.address.trim(),
                    images: vendorForm.images.split(/[\n,]+/).map(s => s.trim()).filter(Boolean),
                };
                if (vendorForm.mapsUrl.trim()) updates.mapsUrl = vendorForm.mapsUrl.trim();
                if (vendorForm.imageUrl.trim()) updates.imageUrl = vendorForm.imageUrl.trim();

                const result = await updateVendor(editingVendorId, updates);
                if (result.success) {
                    const imageCount = vendorForm.images.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length;
                    setVendorSuccess(`Fundraiser "${vendorForm.name.trim()}" updated successfully with ${imageCount} images!`);
                    setEditingVendorId(null);
                    setVendorForm({
                        name: '',
                        email: '',
                        phone: '',
                        pin: '',
                        category: 'restaurant' as 'restaurant' | 'activity' | 'shopping',
                        city: '',
                        address: '',
                        mapsUrl: '',
                        imageUrl: '',
                        images: '',
                    });
                    loadVendors();
                } else {
                    setVendorError(result.error || 'Failed to update fundraiser');
                }
            } else {
                // Create new vendor
                const newVendor: Vendor = {
                    vendorId: `vendor_${Date.now()}`,
                    name: vendorForm.name.trim(),
                    email: vendorForm.email.trim(),
                    phone: vendorForm.phone.trim(),
                    pin: vendorForm.pin,
                    category: vendorForm.category,
                    city: vendorForm.city.trim(),
                    address: vendorForm.address.trim(),
                    mapsUrl: vendorForm.mapsUrl.trim() || undefined,
                    imageUrl: vendorForm.imageUrl.trim() || undefined,
                    images: vendorForm.images.split(/[\n,]+/).map(s => s.trim()).filter(Boolean),
                    createdAt: new Date().toISOString(),
                    isActive: true,
                };

                const result = await createVendor(newVendor);
                if (result.success) {
                    const imageCount = newVendor.images?.length || 0;
                    setVendorSuccess(`Fundraiser "${newVendor.name}" created successfully with ${imageCount} images!`);
                    setVendorForm({
                        name: '',
                        email: '',
                        phone: '',
                        pin: '',
                        category: 'restaurant' as 'restaurant' | 'activity' | 'shopping',
                        city: '',
                        address: '',
                        mapsUrl: '',
                        imageUrl: '',
                        images: '',
                    });
                    loadVendors();
                } else {
                    setVendorError(result.error || 'Failed to create fundraiser');
                }
            }
        } catch (error: any) {
            setVendorError(error.message || 'An error occurred');
        }
    };

    const startEditVendor = (vendor: Vendor) => {
        setVendorForm({
            name: vendor.name,
            email: vendor.email,
            phone: vendor.phone,
            pin: vendor.pin,
            category: vendor.category as 'restaurant' | 'activity' | 'shopping',
            city: vendor.city,
            address: vendor.address || '',
            mapsUrl: vendor.mapsUrl || '',
            imageUrl: vendor.imageUrl || '',
            images: vendor.images ? vendor.images.join('\n') : '',
        });
        setEditingVendorId(vendor.vendorId);
        setVendorError('');
        setVendorSuccess('');
    };

    const cancelEditVendor = () => {
        setEditingVendorId(null);
        setVendorForm({
            name: '',
            email: '',
            phone: '',
            pin: '',
            category: 'restaurant' as 'restaurant' | 'activity' | 'shopping',
            city: '',
            address: '',
            mapsUrl: '',
            imageUrl: '',
            images: '',
        });
        setVendorError('');
        setVendorSuccess('');
    };

    const handleDeleteVendor = async (vendorId: string, vendorName: string) => {
        // Get count of associated deals for confirmation message
        const dealCount = await getDealCountByVendor(vendorId);
        const confirmMessage = dealCount > 0
            ? `Delete fundraiser "${vendorName}"?\n\n⚠️ This will also delete ${dealCount} associated prize${dealCount !== 1 ? 's' : ''}.\n\nThis cannot be undone.`
            : `Delete fundraiser "${vendorName}"? This cannot be undone.`;
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            const result = await deleteVendor(vendorId);
            if (result.success) {
                const successMsg = dealCount > 0
                    ? `Fundraiser "${vendorName}" and ${dealCount} prize${dealCount !== 1 ? 's' : ''} deleted successfully!`
                    : `Fundraiser "${vendorName}" deleted successfully!`;
                setVendorSuccess(successMsg);
                loadVendors();
                loadDeals(); // Refresh deals list since we may have deleted some
            } else {
                setVendorError(result.error || 'Failed to delete fundraiser');
            }
        } catch (error: any) {
            setVendorError(error.message || 'An error occurred');
        }
    };

    const handleAddDeal = async (e: React.FormEvent) => {
        e.preventDefault();
        setDealError('');
        setDealSuccess('');

        // Validation
        if (!dealForm.vendorId || !dealForm.name.trim() || !dealForm.offer.trim()) {
            setDealError('Please fill in all required fields (Fundraiser, Name, Prize)');
            return;
        }

        if (dealForm.savings && isNaN(Number(dealForm.savings))) {
            setDealError('Savings must be a number');
            return;
        }

        try {
            if (editingDealId) {
                // Update existing deal - filter out undefined values to avoid Firestore errors
                const updates: any = {
                    vendorId: dealForm.vendorId,
                    name: dealForm.name.trim(),
                    offer: dealForm.offer.trim(),
                    category: dealForm.category,
                    featured: dealForm.featured,
                    images: dealForm.images.split(/[\n,]+/).map(s => s.trim()).filter(Boolean),
                };
                if (dealForm.savings) updates.savings = Number(dealForm.savings);
                if (dealForm.imageUrl.trim()) updates.imageUrl = dealForm.imageUrl.trim();
                // Handle description: if empty, delete the field from Firestore; otherwise set it
                if (dealForm.description.trim()) {
                    updates.description = dealForm.description.trim();
                } else {
                    // Delete description field from Firestore if it's empty
                    updates.description = deleteField();
                }
                if (dealForm.city.trim()) updates.city = dealForm.city.trim();
                if (dealForm.terms.trim()) updates.terms = dealForm.terms.trim();

                const result = await updateDeal(editingDealId, updates);
                if (result.success) {
                    const imageCount = dealForm.images.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length;
                    setDealSuccess(`Deal "${dealForm.name.trim()}" updated successfully with ${imageCount} images!`);
                    setEditingDealId(null);
                    setDealForm({
                        vendorId: '',
                        name: '',
                        offer: '',
                        description: '',
                        savings: '',
                        imageUrl: '',
                        category: 'restaurant' as 'restaurant' | 'activity' | 'shopping',
                        city: '',
                        terms: '',
                        featured: false,
                        images: '',
                    });
                    loadDeals();
                } else {
                    setDealError(result.error || 'Failed to update deal');
                }
            } else {
                // Create new deal
                const newDeal: Deal = {
                    vendorId: dealForm.vendorId,
                    name: dealForm.name.trim(),
                    offer: dealForm.offer.trim(),
                    description: dealForm.description.trim() || undefined,
                    savings: dealForm.savings ? Number(dealForm.savings) : undefined,
                    imageUrl: dealForm.imageUrl.trim() || undefined,
                    category: dealForm.category,
                    city: dealForm.city.trim(),
                    terms: dealForm.terms.trim() || undefined,
                    featured: dealForm.featured,
                    images: dealForm.images.split(/[\n,]+/).map(s => s.trim()).filter(Boolean),
                    createdAt: new Date().toISOString(),
                };

                const result = await createDeal(newDeal);
                if (result.success) {
                    const imageCount = newDeal.images?.length || 0;
                    setDealSuccess(`Deal "${newDeal.name}" created successfully with ${imageCount} images!`);
                    setDealForm({
                        vendorId: '',
                        name: '',
                        offer: '',
                        description: '',
                        savings: '',
                        imageUrl: '',
                        category: 'restaurant' as 'restaurant' | 'activity' | 'shopping',
                        city: '',
                        terms: '',
                        featured: false,
                        images: '',
                    });
                    loadDeals();
                } else {
                    setDealError(result.error || 'Failed to create deal');
                }
            }
        } catch (error: any) {
            setDealError(error.message || 'An error occurred');
        }
    };

    const startEditDeal = (deal: Deal) => {
        setDealForm({
            vendorId: deal.vendorId,
            name: deal.name,
            offer: deal.offer,
            description: deal.description || '',
            savings: deal.savings?.toString() || '',
            imageUrl: deal.imageUrl || '',
            category: (deal.category || 'restaurant') as 'restaurant' | 'activity' | 'shopping',
            city: deal.city || '',
            terms: deal.terms || '',
            featured: deal.featured || false,
            images: deal.images ? deal.images.join('\n') : '',
        });
        setEditingDealId(deal.id || null);
        setDealError('');
        setDealSuccess('');
    };

    const cancelEditDeal = () => {
        setEditingDealId(null);
        setDealForm({
            vendorId: '',
            name: '',
            offer: '',
            description: '',
            savings: '',
            imageUrl: '',
            category: 'restaurant' as 'restaurant' | 'activity' | 'shopping',
            city: '',
            terms: '',
            featured: false,
            images: '',
        });
        setDealError('');
        setDealSuccess('');
    };

    const handleDeleteDeal = async (dealId: string | undefined, dealName: string) => {
        if (!dealId) return;
        if (!window.confirm(`Delete deal "${dealName}"? This cannot be undone.`)) {
            return;
        }

        try {
            const result = await deleteDeal(dealId);
            if (result.success) {
                setDealSuccess(`Deal "${dealName}" deleted successfully!`);
                loadDeals();
            } else {
                setDealError(result.error || 'Failed to delete deal');
            }
        } catch (error: any) {
            setDealError(error.message || 'An error occurred');
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 lg:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-action-primary mb-1">
                        Admin Dashboard
                    </h1>
                    <p className="text-sm text-text-secondary">Manage fundraisers, prizes & analytics</p>
                </div>

                {/* Tabs - Scrollable on mobile */}
                <div className="flex gap-1 sm:gap-4 mb-4 lg:mb-6 border-b border-border-subtle overflow-x-auto pb-px -mx-3 px-3 sm:mx-0 sm:px-0">
                    <button
                        onClick={() => setActiveTab('vendors')}
                        className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'vendors'
                            ? 'text-action-primary border-b-2 border-action-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        🏫 Fundraisers
                    </button>
                    <button
                        onClick={() => setActiveTab('deals')}
                        className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'deals'
                            ? 'text-action-primary border-b-2 border-action-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        🎁 Prizes
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'analytics'
                            ? 'text-action-primary border-b-2 border-action-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        📊 Analytics
                    </button>
                </div>

                {/* Vendors Tab */}
                {activeTab === 'vendors' && (
                    <div className="flex flex-col lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 gap-4">
                        {/* Vendors sidebar (desktop) */}
                        <aside className="hidden lg:block lg:sticky lg:top-4 self-start bg-bg-card rounded-xl border border-border-subtle p-3 text-sm space-y-1">
                            <button
                                onClick={() => setActiveVendorSection('overview')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    activeVendorSection === 'overview'
                                        ? 'bg-action-primary text-white'
                                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveVendorSection('form')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    activeVendorSection === 'form'
                                        ? 'bg-action-primary text-white'
                                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                            >
                                Add / Edit Fundraiser
                            </button>
                            <button
                                onClick={() => setActiveVendorSection('list')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    activeVendorSection === 'list'
                                        ? 'bg-action-primary text-white'
                                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                            >
                                Fundraiser List
                            </button>
                        </aside>

                        <div className="flex flex-col gap-4 lg:gap-6">
                            {/* Mobile section switcher */}
                            <div className="lg:hidden sticky top-0 z-10 bg-bg-primary -mx-3 px-3 pt-1 pb-2">
                                <div className="flex gap-2 overflow-x-auto text-xs">
                                    <button
                                        onClick={() => setActiveVendorSection('list')}
                                        className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                            activeVendorSection === 'list'
                                                ? 'bg-action-primary text-white border-action-primary'
                                                : 'bg-bg-card text-text-secondary border-border-subtle'
                                        }`}
                                    >
                                        List
                                    </button>
                                    <button
                                        onClick={() => setActiveVendorSection('form')}
                                        className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                            activeVendorSection === 'form'
                                                ? 'bg-action-primary text-white border-action-primary'
                                                : 'bg-bg-card text-text-secondary border-border-subtle'
                                        }`}
                                    >
                                        Form
                                    </button>
                                    <button
                                        onClick={() => setActiveVendorSection('overview')}
                                        className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                            activeVendorSection === 'overview'
                                                ? 'bg-action-primary text-white border-action-primary'
                                                : 'bg-bg-card text-text-secondary border-border-subtle'
                                        }`}
                                    >
                                        Overview
                                    </button>
                                </div>
                            </div>

                            {/* Vendors sections */}
                            {activeVendorSection === 'overview' && (
                                <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                    <h2 className="text-base lg:text-lg font-display font-bold text-action-primary mb-3 lg:mb-4">
                                        🏫 Fundraiser Overview
                                    </h2>
                                    <p className="text-xs text-text-secondary mb-2">
                                        Quick snapshot of your fundraisers.
                                    </p>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        <div className="bg-bg-primary rounded-lg border border-border-subtle p-3">
                                            <p className="text-[11px] text-text-secondary">Total Fundraisers</p>
                                            <p className="text-lg font-bold text-text-primary mt-1">{vendors.length}</p>
                                        </div>
                                        <div className="bg-bg-primary rounded-lg border border-border-subtle p-3">
                                            <p className="text-[11px] text-text-secondary">With Images</p>
                                            <p className="text-lg font-bold text-text-primary mt-1">
                                                {vendors.filter(v => (v.imageUrl && v.imageUrl.trim()) || (v.images && v.images.length > 0)).length}
                                            </p>
                                        </div>
                                        <div className="bg-bg-primary rounded-lg border border-border-subtle p-3">
                                            <p className="text-[11px] text-text-secondary">Cities</p>
                                            <p className="text-lg font-bold text-text-primary mt-1">
                                                {Array.from(new Set(vendors.map(v => v.city))).filter(Boolean).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeVendorSection === 'form' && (
                                <div className="lg:sticky lg:top-4 lg:self-start bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                                        <div>
                                            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                🏫 {editingVendorId ? 'Edit Fundraiser' : 'Add Fundraiser'}
                                            </h2>
                                        </div>
                                        {editingVendorId && (
                                            <button
                                                onClick={cancelEditVendor}
                                                className="text-xs px-2 py-1 bg-border-subtle text-text-secondary hover:text-text-primary hover:bg-border-subtle/50 rounded-lg transition-colors"
                                            >
                                                ✕ Cancel
                                            </button>
                                        )}
                                    </div>
                                    <form onSubmit={handleAddVendor} className="space-y-0">
                                        <FormSection icon="📝" title="Basic Info" description="Name & category">
                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-2">
                                                    Fundraiser Name <span className="text-urgency-high">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={vendorForm.name}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                                                    placeholder="e.g., Riverside Primary"
                                                    className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-action-primary mb-1">
                                                        Category
                                                    </label>
                                                    <select
                                                        value={vendorForm.category}
                                                        onChange={(e) =>
                                                            setVendorForm({
                                                                ...vendorForm,
                                                                category: e.target.value as 'restaurant' | 'activity' | 'shopping',
                                                            })
                                                        }
                                                        className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                    >
                                                        <option value="restaurant">🍽️ Restaurant</option>
                                                        <option value="activity">🎯 Activity</option>
                                                        <option value="shopping">🛍️ Shopping</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-action-primary mb-1">
                                                        City
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={vendorForm.city}
                                                        onChange={(e) => setVendorForm({ ...vendorForm, city: e.target.value })}
                                                        placeholder="Port Alfred"
                                                        className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    value={vendorForm.address}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                                                    placeholder="123 Main Street"
                                                    className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>
                                        </FormSection>

                                        <FormSection icon="🔐" title="Auth" description="Email & PIN">
                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Email <span className="text-urgency-high">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={vendorForm.email}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                                                    placeholder="contact@vendor.com"
                                                    className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    PIN (4 digits) <span className="text-urgency-high">*</span>
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={vendorForm.pin}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                            setVendorForm({ ...vendorForm, pin: val });
                                                        }}
                                                        placeholder="1234"
                                                        maxLength={4}
                                                        className="flex-1 px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary font-mono text-center tracking-widest"
                                                    />
                                                    {vendorForm.pin && vendorForm.pin.length === 4 && (
                                                        <span className="text-success font-bold">✓</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-text-secondary mt-1">Staff verification</p>
                                            </div>
                                        </FormSection>

                                        <FormSection icon="📞" title="Contact" description="Optional details">
                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={vendorForm.phone}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                                                    placeholder="+27 123 456 789"
                                                    className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Maps Link
                                                </label>
                                                <input
                                                    type="url"
                                                    value={vendorForm.mapsUrl}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, mapsUrl: e.target.value })}
                                                    placeholder="https://maps.google.com/?q=Venue"
                                                    className="w-full px-3 py-1.5 text-xs bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>
                                        </FormSection>

                                        <FormSection icon="🖼️" title="Images" description="Logo & photos">
                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Logo
                                                </label>
                                                <input
                                                    type="url"
                                                    value={vendorForm.imageUrl}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, imageUrl: e.target.value })}
                                                    placeholder="https://example.com/logo.jpg"
                                                    className="w-full px-3 py-1.5 text-xs bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                                <ImagePreview url={vendorForm.imageUrl} alt={vendorForm.name || 'Fundraiser logo'} />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Photos (URLs)
                                                </label>
                                                <textarea
                                                    value={vendorForm.images}
                                                    onChange={(e) => setVendorForm({ ...vendorForm, images: e.target.value })}
                                                    placeholder="https://example.com/photo1.jpg"
                                                    rows={2}
                                                    className="w-full px-3 py-1.5 text-xs bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>
                                        </FormSection>

                                        {vendorError && (
                                            <div className="mt-3 bg-urgency-high/10 border border-urgency-high rounded-lg p-2">
                                                <p className="text-xs text-urgency-high font-medium">⚠️ {vendorError}</p>
                                            </div>
                                        )}

                                        {vendorSuccess && (
                                            <div className="mt-3 bg-success/10 border border-success rounded-lg p-2">
                                                <p className="text-xs text-success font-medium">✓ {vendorSuccess}</p>
                                            </div>
                                        )}

                                        <Button variant="primary" type="submit" className="w-full mt-4 text-sm">
                                            {editingVendorId ? '💾 Update' : '➕ Add'}
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {activeVendorSection === 'list' && (
                                <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            📋 Fundraisers{' '}
                                            <span className="text-xs font-normal text-text-secondary bg-border-subtle px-2 py-0.5 rounded-full">
                                                {filteredVendors.length}/{vendors.length}
                                            </span>
                                        </h2>
                                        <button
                                            onClick={() => loadVendors()}
                                            disabled={isLoadingVendors}
                                            className="px-2 py-1 text-xs font-medium bg-action-primary/20 text-action-primary hover:bg-action-primary/30 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {isLoadingVendors ? '⏳' : '🔄'}
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={vendorSearch}
                                        onChange={(e) => setVendorSearch(e.target.value)}
                                        placeholder="🔍 Search fundraisers..."
                                        className="w-full px-3 py-2 mb-3 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                    />
                                    {isLoadingVendors ? (
                                        <div className="py-8 text-center">
                                            <p className="text-sm text-text-secondary">Loading...</p>
                                        </div>
                                    ) : filteredVendors.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <p className="text-sm text-text-secondary">
                                                {vendorSearch ? 'No matching fundraisers' : 'No fundraisers yet'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto">
                                            {filteredVendors.map((vendor) => (
                                                <div
                                                    key={vendor.vendorId}
                                                    className="bg-bg-primary rounded-lg p-3 border border-border-subtle hover:border-action-primary/50 hover:bg-bg-primary/80 transition-all group"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1 flex-wrap mb-1">
                                                                <p className="font-semibold text-sm text-text-primary">{vendor.name}</p>
                                                                <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-action-primary/20 text-action-primary">
                                                                    {vendor.category === 'restaurant' && '🍽️'}
                                                                    {vendor.category === 'activity' && '🎯'}
                                                                    {vendor.category === 'shopping' && '🛍️'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-text-secondary truncate">{vendor.email}</p>
                                                            <p className="text-xs text-value-highlight font-medium">📍 {vendor.city}</p>
                                                        </div>
                                                        {/* Actions - always visible on mobile, hover on desktop */}
                                                        <div className="flex gap-1 flex-shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(vendor.pin);
                                                                }}
                                                                className="text-xs font-mono font-bold text-success bg-success/20 hover:bg-success/30 px-1.5 py-1 rounded whitespace-nowrap transition-colors"
                                                                title="Copy PIN"
                                                            >
                                                                🔑 {vendor.pin}
                                                            </button>
                                                            <button
                                                                onClick={() => startEditVendor(vendor)}
                                                                className="text-xs bg-action-primary/20 text-action-primary hover:bg-action-primary/40 px-2 py-1 rounded transition-colors font-medium"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteVendor(vendor.vendorId, vendor.name)}
                                                                className="text-xs bg-urgency-high/20 text-urgency-high hover:bg-urgency-high/40 px-2 py-1 rounded transition-colors font-medium"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Prizes Tab */}
                {activeTab === 'deals' && (
                    <div className="flex flex-col lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 gap-4">
                        {/* Prizes sidebar (desktop) */}
                        <aside className="hidden lg:block lg:sticky lg:top-4 self-start bg-bg-card rounded-xl border border-border-subtle p-3 text-sm space-y-1">
                            <button
                                onClick={() => setActiveDealSection('overview')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    activeDealSection === 'overview'
                                        ? 'bg-action-primary text-white'
                                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveDealSection('reorder')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    activeDealSection === 'reorder'
                                        ? 'bg-action-primary text-white'
                                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                            >
                                Reorder / Featured
                            </button>
                            <button
                                onClick={() => setActiveDealSection('form')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    activeDealSection === 'form'
                                        ? 'bg-action-primary text-white'
                                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                            >
                                Add / Edit Prize
                            </button>
                            <button
                                onClick={() => setActiveDealSection('list')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    activeDealSection === 'list'
                                        ? 'bg-action-primary text-white'
                                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                            >
                                Prizes List
                            </button>
                        </aside>

                        <div className="flex flex-col gap-4 lg:gap-6">
                            {/* Mobile section switcher */}
                            <div className="lg:hidden sticky top-0 z-10 bg-bg-primary -mx-3 px-3 pt-1 pb-2">
                                <div className="flex gap-2 overflow-x-auto text-xs">
                                    <button
                                        onClick={() => setActiveDealSection('list')}
                                        className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                            activeDealSection === 'list'
                                                ? 'bg-action-primary text-white border-action-primary'
                                                : 'bg-bg-card text-text-secondary border-border-subtle'
                                        }`}
                                    >
                                        List
                                    </button>
                                    <button
                                        onClick={() => setActiveDealSection('form')}
                                        className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                            activeDealSection === 'form'
                                                ? 'bg-action-primary text-white border-action-primary'
                                                : 'bg-bg-card text-text-secondary border-border-subtle'
                                        }`}
                                    >
                                        Form
                                    </button>
                                    <button
                                        onClick={() => setActiveDealSection('reorder')}
                                        className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                            activeDealSection === 'reorder'
                                                ? 'bg-action-primary text-white border-action-primary'
                                                : 'bg-bg-card text-text-secondary border-border-subtle'
                                        }`}
                                    >
                                        Reorder
                                    </button>
                                    <button
                                        onClick={() => setActiveDealSection('overview')}
                                        className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                            activeDealSection === 'overview'
                                                ? 'bg-action-primary text-white border-action-primary'
                                                : 'bg-bg-card text-text-secondary border-border-subtle'
                                        }`}
                                    >
                                        Overview
                                    </button>
                                </div>
                            </div>

                            {/* Prize sections */}
                            {activeDealSection === 'overview' && (
                                <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                    <h2 className="text-base lg:text-lg font-display font-bold text-action-primary mb-3 lg:mb-4">
                                        🎁 Prizes Overview
                                    </h2>
                                    <p className="text-xs text-text-secondary mb-2">High-level view of your prizes.</p>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        <div className="bg-bg-primary rounded-lg border border-border-subtle p-3">
                                            <p className="text-[11px] text-text-secondary">Total Prizes</p>
                                            <p className="text-lg font-bold text-text-primary mt-1">{deals.length}</p>
                                        </div>
                                        <div className="bg-bg-primary rounded-lg border border-border-subtle p-3">
                                            <p className="text-[11px] text-text-secondary">Featured</p>
                                            <p className="text-lg font-bold text-text-primary mt-1">
                                                {deals.filter(d => d.featured).length}
                                            </p>
                                        </div>
                                        <div className="bg-bg-primary rounded-lg border border-border-subtle p-3">
                                            <p className="text-[11px] text-text-secondary">Fundraisers</p>
                                            <p className="text-lg font-bold text-text-primary mt-1">
                                                {Array.from(new Set(deals.map(d => d.vendorId))).filter(Boolean).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeDealSection === 'reorder' && (
                                <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                    <DealReorderPanel deals={deals} onReorderComplete={loadDeals} />
                                </div>
                            )}

                            {activeDealSection === 'form' && (
                                <div className="lg:sticky lg:top-4 lg:self-start bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                                        <div>
                                            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                🎁 {editingDealId ? 'Edit Prize' : 'Add Prize'}
                                            </h2>
                                        </div>
                                        {editingDealId && (
                                            <button
                                                onClick={cancelEditDeal}
                                                className="text-xs px-2 py-1 bg-border-subtle text-text-secondary hover:text-text-primary hover:bg-border-subtle/50 rounded-lg transition-colors"
                                            >
                                                ✕ Cancel
                                            </button>
                                        )}
                                    </div>
                                    <form onSubmit={handleAddDeal} className="space-y-0">
                                        <FormSection icon="🏫" title="Prize" description="Fundraiser & details">
                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Fundraiser <span className="text-urgency-high">*</span>
                                                </label>
                                                <select
                                                    value={dealForm.vendorId}
                                                    onChange={(e) => {
                                                        const selectedVendor = vendors.find(v => v.vendorId === e.target.value);
                                                        setDealForm({
                                                            ...dealForm,
                                                            vendorId: e.target.value,
                                                            // Auto-sync city and category from vendor if not already set
                                                            city: dealForm.city || selectedVendor?.city || '',
                                                            category: dealForm.category || selectedVendor?.category || 'restaurant',
                                                        });
                                                    }}
                                                    className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                >
                                                    <option value="">Select fundraiser...</option>
                                                    {vendors.map((vendor) => (
                                                        <option key={vendor.vendorId} value={vendor.vendorId}>
                                                            {vendor.name} ({vendor.city})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Name <span className="text-urgency-high">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={dealForm.name}
                                                    onChange={(e) => setDealForm({ ...dealForm, name: e.target.value })}
                                                    placeholder="e.g., 2-for-1 Meals"
                                                    className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Offer <span className="text-urgency-high">*</span>
                                                </label>
                                                <textarea
                                                    value={dealForm.offer}
                                                    onChange={(e) => setDealForm({ ...dealForm, offer: e.target.value })}
                                                    placeholder="2-for-1 on Main Meals"
                                                    rows={2}
                                                    className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Marketing Copy
                                                </label>
                                                <textarea
                                                    value={dealForm.description}
                                                    onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                                                    placeholder="Get amazing meals at unbeatable prices..."
                                                    rows={2}
                                                    className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>
                                        </FormSection>

                                        <FormSection icon="💰" title="Details" description="Value & location">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-action-primary mb-1">
                                                        Savings (R)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={dealForm.savings}
                                                        onChange={(e) => setDealForm({ ...dealForm, savings: e.target.value })}
                                                        placeholder="150"
                                                        className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-action-primary mb-1">
                                                        Category
                                                    </label>
                                                    <select
                                                        value={dealForm.category}
                                                        onChange={(e) =>
                                                            setDealForm({
                                                                ...dealForm,
                                                                category: e.target.value as 'restaurant' | 'activity' | 'shopping',
                                                            })
                                                        }
                                                        className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                    >
                                                        <option value="restaurant">🍽️</option>
                                                        <option value="activity">🎯</option>
                                                        <option value="shopping">🛍️</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    value={dealForm.city}
                                                    onChange={(e) => setDealForm({ ...dealForm, city: e.target.value })}
                                                    placeholder="Port Alfred"
                                                    className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Terms
                                                </label>
                                                <textarea
                                                    value={dealForm.terms}
                                                    onChange={(e) => setDealForm({ ...dealForm, terms: e.target.value })}
                                                    placeholder="Valid Mon-Thu..."
                                                    rows={2}
                                                    className="w-full px-3 py-1.5 text-xs bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>
                                        </FormSection>

                                        <FormSection icon="🖼️" title="Images" description="Main & carousel">
                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Main Image
                                                </label>
                                                <input
                                                    type="url"
                                                    value={dealForm.imageUrl}
                                                    onChange={(e) => setDealForm({ ...dealForm, imageUrl: e.target.value })}
                                                    placeholder="https://example.com/deal.jpg"
                                                    className="w-full px-3 py-1.5 text-xs bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                                <ImagePreview url={dealForm.imageUrl} alt={dealForm.name || 'Deal image'} />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-action-primary mb-1">
                                                    Carousel (URLs)
                                                </label>
                                                <textarea
                                                    value={dealForm.images}
                                                    onChange={(e) => setDealForm({ ...dealForm, images: e.target.value })}
                                                    placeholder="https://example.com/photo.jpg"
                                                    rows={2}
                                                    className="w-full px-3 py-1.5 text-xs bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                                />
                                            </div>
                                        </FormSection>

                                        <FormSection icon="⭐" title="Promote" description="">
                                            <div className="flex items-center gap-2 p-2 bg-value-highlight/10 rounded-lg border border-value-highlight/20">
                                                <input
                                                    type="checkbox"
                                                    id="featured"
                                                    checked={dealForm.featured}
                                                    onChange={(e) => setDealForm({ ...dealForm, featured: e.target.checked })}
                                                    className="w-4 h-4 rounded border-border-subtle bg-bg-primary cursor-pointer accent-value-highlight"
                                                />
                                                <label htmlFor="featured" className="text-xs font-medium text-text-primary cursor-pointer flex-1">
                                                    Featured
                                                </label>
                                            </div>
                                        </FormSection>

                                        {dealError && (
                                            <div className="mt-3 bg-urgency-high/10 border border-urgency-high rounded-lg p-2">
                                                <p className="text-xs text-urgency-high font-medium">⚠️ {dealError}</p>
                                            </div>
                                        )}

                                        {dealSuccess && (
                                            <div className="mt-3 bg-success/10 border border-success rounded-lg p-2">
                                                <p className="text-xs text-success font-medium">✓ {dealSuccess}</p>
                                            </div>
                                        )}

                                        <Button variant="primary" type="submit" className="w-full mt-4 text-sm">
                                            {editingDealId ? '💾 Update' : '➕ Add'}
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {activeDealSection === 'list' && (
                                <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            📦 Prizes{' '}
                                            <span className="text-xs font-normal text-text-secondary bg-border-subtle px-2 py-0.5 rounded-full">
                                                {filteredDeals.length}/{deals.length}
                                            </span>
                                        </h2>
                                        <button
                                            onClick={() => loadDeals()}
                                            disabled={isLoadingDeals}
                                            className="px-2 py-1 text-xs font-medium bg-action-primary/20 text-action-primary hover:bg-action-primary/30 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {isLoadingDeals ? '⏳' : '🔄'}
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={dealSearch}
                                        onChange={(e) => setDealSearch(e.target.value)}
                                        placeholder="🔍 Search prizes..."
                                        className="w-full px-3 py-2 mb-3 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                    />
                                    {isLoadingDeals ? (
                                        <div className="py-8 text-center">
                                            <p className="text-sm text-text-secondary">Loading...</p>
                                        </div>
                                    ) : filteredDeals.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <p className="text-sm text-text-secondary">
                                                {dealSearch ? 'No matching prizes' : 'No prizes yet'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-[50vh] lg:max-h-[70vh] overflow-y-auto">
                                            {filteredDeals.map((deal) => (
                                                <DealCardPreview
                                                    key={deal.id}
                                                    deal={deal}
                                                    vendor={vendors.find(v => v.vendorId === deal.vendorId)}
                                                    onEdit={() => startEditDeal(deal)}
                                                    onDelete={() => handleDeleteDeal(deal.id, deal.name)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="flex flex-col lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 gap-4">
                        {/* Analytics sidebar (desktop) */}
                        <aside className="hidden lg:block lg:sticky lg:top-4 self-start bg-bg-card rounded-xl border border-border-subtle p-3 text-sm space-y-1">
                            <button
                                onClick={() => setActiveAnalyticsSection('summary')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    activeAnalyticsSection === 'summary'
                                        ? 'bg-action-primary text-white'
                                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                            >
                                Summary
                            </button>
                            <button
                                onClick={() => setActiveAnalyticsSection('purchases')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    activeAnalyticsSection === 'purchases'
                                        ? 'bg-action-primary text-white'
                                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                            >
                                Recent Purchases
                            </button>
                            <button
                                onClick={() => setActiveAnalyticsSection('passes')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    activeAnalyticsSection === 'passes'
                                        ? 'bg-action-primary text-white'
                                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                            >
                                Ticket Packs
                            </button>
                            <button
                                onClick={() => setActiveAnalyticsSection('redemptions')}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                    activeAnalyticsSection === 'redemptions'
                                        ? 'bg-action-primary text-white'
                                        : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                                }`}
                            >
                                Entries
                            </button>
                        </aside>

                        <div className="flex flex-col gap-4 lg:gap-6">
                            {/* Mobile section switcher */}
                            <div className="lg:hidden sticky top-0 z-10 bg-bg-primary -mx-3 px-3 pt-1 pb-2">
                                <div className="flex gap-2 overflow-x-auto text-xs">
                                    <button
                                        onClick={() => setActiveAnalyticsSection('summary')}
                                        className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                            activeAnalyticsSection === 'summary'
                                                ? 'bg-action-primary text-white border-action-primary'
                                                : 'bg-bg-card text-text-secondary border-border-subtle'
                                        }`}
                                    >
                                        Summary
                                    </button>
                                    <button
                                        onClick={() => setActiveAnalyticsSection('purchases')}
                                        className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                            activeAnalyticsSection === 'purchases'
                                                ? 'bg-action-primary text-white border-action-primary'
                                                : 'bg-bg-card text-text-secondary border-border-subtle'
                                        }`}
                                    >
                                        Purchases
                                    </button>
                                    <button
                                        onClick={() => setActiveAnalyticsSection('passes')}
                                        className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                            activeAnalyticsSection === 'passes'
                                                ? 'bg-action-primary text-white border-action-primary'
                                                : 'bg-bg-card text-text-secondary border-border-subtle'
                                        }`}
                                    >
                                        Ticket Packs
                                    </button>
                                    <button
                                        onClick={() => setActiveAnalyticsSection('redemptions')}
                                        className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                                            activeAnalyticsSection === 'redemptions'
                                                ? 'bg-action-primary text-white border-action-primary'
                                                : 'bg-bg-card text-text-secondary border-border-subtle'
                                        }`}
                                    >
                                        Entries
                                    </button>
                                </div>
                            </div>

                            {/* Shared analytics header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h2 className="text-lg font-bold text-text-primary">Analytics</h2>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => loadAnalytics()}
                                        disabled={isLoadingAnalytics}
                                        className="px-3 py-1.5 text-xs font-medium bg-action-primary/20 text-action-primary hover:bg-action-primary/30 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isLoadingAnalytics ? '⏳' : '🔄'} Refresh
                                    </button>
                                    <button
                                        onClick={exportPassesToCSV}
                                        disabled={passes.length === 0}
                                        className="px-3 py-1.5 text-xs font-medium bg-value-highlight/20 text-value-highlight hover:bg-value-highlight/30 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        📥 Ticket Packs
                                    </button>
                                    <button
                                        onClick={exportRedemptionsToCSV}
                                        disabled={redemptions.length === 0}
                                        className="px-3 py-1.5 text-xs font-medium bg-success/20 text-success hover:bg-success/30 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        📥 Entries
                                    </button>
                                </div>
                            </div>

                            {isLoadingAnalytics ? (
                                <div className="py-12 text-center">
                                    <p className="text-sm text-text-secondary">Loading analytics...</p>
                                </div>
                            ) : (
                                <>
                                    {activeAnalyticsSection === 'summary' && (
                                        <>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                                                <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-text-secondary font-medium">Paid Ticket Packs</p>
                                                            <p className="text-xl lg:text-3xl font-bold text-text-primary mt-1">{configPassCount}</p>
                                                            {passes.filter(p => p.passStatus === 'free').length > 0 && (
                                                                <p className="text-xs text-text-secondary mt-1">
                                                                    +{passes.filter(p => p.passStatus === 'free').length} free
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className="text-2xl lg:text-4xl">🎫</span>
                                                    </div>
                                                </div>

                                                <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-text-secondary font-medium">Revenue</p>
                                                            <p className="text-xl lg:text-3xl font-bold text-value-highlight mt-1">
                                                                R{passes.reduce((sum, p) => sum + (p.purchasePrice || 0), 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <span className="text-2xl lg:text-4xl">💰</span>
                                                    </div>
                                                </div>

                                                <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-text-secondary font-medium">Entries</p>
                                                            <p className="text-xl lg:text-3xl font-bold text-action-primary mt-1">{redemptions.length}</p>
                                                        </div>
                                                        <span className="text-2xl lg:text-4xl">✓</span>
                                                    </div>
                                                </div>

                                                <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-text-secondary font-medium">Active Rate</p>
                                                            <p className="text-xl lg:text-3xl font-bold text-success mt-1">
                                                                {(() => {
                                                                    const passIds = new Set(passes.map(p => p.passId));
                                                                    const passesWithRedemptions = new Set(
                                                                        redemptions.map(r => r.passId).filter(id => passIds.has(id))
                                                                    );
                                                                    return passes.length > 0
                                                                        ? Math.round((passesWithRedemptions.size / passes.length) * 100)
                                                                        : 0;
                                                                })()}%
                                                            </p>
                                                            <p className="text-xs text-text-secondary mt-1 hidden lg:block">≥1 redemption</p>
                                                        </div>
                                                        <span className="text-2xl lg:text-4xl">📊</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
                                                <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                                    <h3 className="text-base lg:text-lg font-bold text-action-primary mb-3 lg:mb-4 flex items-center gap-2">
                                                        🎫 Passes by Type
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {(() => {
                                                            const freeTestCount = passes.length - configPassCount;
                                                            return [
                                                                { label: 'Paid Ticket Packs', count: configPassCount, color: 'text-value-highlight' },
                                                                {
                                                                    label: 'Free/Test Ticket Packs',
                                                                    count: Math.max(0, freeTestCount),
                                                                    color: 'text-action-primary',
                                                                },
                                                            ];
                                                        })().map((item) => (
                                                            <div
                                                                key={item.label}
                                                                className="flex items-center justify-between p-3 bg-bg-primary rounded-lg border border-border-subtle"
                                                            >
                                                                <span className="text-sm text-text-secondary">{item.label}</span>
                                                                <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                                    <h3 className="text-base lg:text-lg font-bold text-action-primary mb-3 lg:mb-4 flex items-center gap-2">
                                                        🏆 Top Prizes
                                                    </h3>
                                                    <div className="space-y-2 max-h-60 lg:max-h-96 overflow-y-auto">
                                                        {(() => {
                                                            const dealCounts: Record<string, number> = {};
                                                            redemptions.forEach((r) => {
                                                                dealCounts[r.dealName] = (dealCounts[r.dealName] || 0) + 1;
                                                            });
                                                            return Object.entries(dealCounts)
                                                                .sort((a, b) => b[1] - a[1])
                                                                .slice(0, 10);
                                                        })().map(([dealName, count]) => (
                                                            <div
                                                                key={dealName}
                                                                className="flex items-center justify-between p-2 bg-bg-primary rounded-lg border border-border-subtle/50"
                                                            >
                                                                <span className="text-xs text-text-secondary truncate flex-1">{dealName}</span>
                                                                <span className="text-xs font-bold text-success ml-2 whitespace-nowrap">{count}x</span>
                                                            </div>
                                                        ))}
                                                        {redemptions.length === 0 && (
                                                            <p className="text-xs text-text-secondary text-center py-4">No entries yet</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeAnalyticsSection === 'purchases' && (
                                        <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                            <h3 className="text-base lg:text-lg font-bold text-action-primary mb-3 lg:mb-4 flex items-center gap-2">
                                                👥 Recent Purchases
                                            </h3>
                                            <div className="lg:hidden space-y-2 max-h-[50vh] overflow-y-auto">
                                                {passes
                                                    .filter(p => p.paymentStatus === 'completed')
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(b.createdAt).getTime() -
                                                            new Date(a.createdAt).getTime()
                                                    )
                                                    .slice(0, 10)
                                                    .map((pass) => (
                                                        <div
                                                            key={pass.passId}
                                                            className="p-3 bg-bg-primary rounded-lg border border-border-subtle"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm font-medium text-text-primary truncate">
                                                                        {pass.passHolderName}
                                                                    </p>
                                                                    <p className="text-xs text-text-secondary truncate">
                                                                        {pass.email}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right ml-2">
                                                                    <p className="text-sm font-bold text-value-highlight">
                                                                        R{pass.purchasePrice || 0}
                                                                    </p>
                                                                    <p className="text-xs text-text-secondary">
                                                                        {new Date(pass.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {passes.filter(p => p.paymentStatus === 'completed').length === 0 && (
                                                    <p className="text-center py-8 text-text-secondary text-sm">
                                                        No purchases yet
                                                    </p>
                                                )}
                                            </div>
                                            <div className="hidden lg:block overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="border-b border-border-subtle">
                                                        <tr className="text-text-secondary">
                                                            <th className="text-left py-2 px-2 font-medium">Name</th>
                                                            <th className="text-left py-2 px-2 font-medium">Email</th>
                                                            <th className="text-left py-2 px-2 font-medium">Type</th>
                                                            <th className="text-right py-2 px-2 font-medium">Price</th>
                                                            <th className="text-left py-2 px-2 font-medium">Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border-subtle">
                                                        {passes
                                                            .filter(p => p.paymentStatus === 'completed')
                                                            .sort(
                                                                (a, b) =>
                                                                    new Date(b.createdAt).getTime() -
                                                                    new Date(a.createdAt).getTime()
                                                            )
                                                            .slice(0, 20)
                                                            .map((pass) => (
                                                                <tr
                                                                    key={pass.passId}
                                                                    className="hover:bg-bg-primary transition-colors"
                                                                >
                                                                    <td className="py-2 px-2 text-text-primary font-medium">
                                                                        {pass.passHolderName}
                                                                    </td>
                                                                    <td className="py-2 px-2 text-text-secondary truncate max-w-[200px]">
                                                                        {pass.email}
                                                                    </td>
                                                                    <td className="py-2 px-2 text-text-secondary capitalize">
                                                                        {pass.passType}
                                                                    </td>
                                                                    <td className="py-2 px-2 text-right text-value-highlight font-bold">
                                                                        R{pass.purchasePrice || 0}
                                                                    </td>
                                                                    <td className="py-2 px-2 text-text-secondary text-xs">
                                                                        {new Date(pass.createdAt).toLocaleDateString()}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                                {passes.filter(p => p.paymentStatus === 'completed').length === 0 && (
                                                    <p className="text-center py-8 text-text-secondary">
                                                        No purchased ticket packs
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeAnalyticsSection === 'passes' && (
                                        <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                            <h3 className="text-base lg:text-lg font-bold text-action-primary mb-3 lg:mb-4 flex items-center gap-2">
                                                🎫 Ticket Packs
                                            </h3>
                                            <div className="lg:hidden space-y-2 max-h-[50vh] overflow-y-auto">
                                                {passes
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(b.createdAt).getTime() -
                                                            new Date(a.createdAt).getTime()
                                                    )
                                                    .slice(0, 20)
                                                    .map((pass) => (
                                                        <div
                                                            key={pass.passId}
                                                            className="p-3 bg-bg-primary rounded-lg border border-border-subtle"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm font-medium text-text-primary truncate">
                                                                        {pass.passHolderName}
                                                                    </p>
                                                                    <p className="text-xs text-text-secondary font-mono">
                                                                        {pass.passId}
                                                                    </p>
                                                                </div>
                                                                <span
                                                                    className={`text-xs px-1.5 py-0.5 rounded font-medium ml-2 ${
                                                                        pass.paymentStatus === 'completed'
                                                                            ? 'bg-value-highlight/20 text-value-highlight'
                                                                            : pass.passStatus === 'free'
                                                                            ? 'bg-action-primary/20 text-action-primary'
                                                                            : 'bg-text-secondary/20 text-text-secondary'
                                                                    }`}
                                                                >
                                                                    {pass.paymentStatus === 'completed'
                                                                        ? 'Paid'
                                                                        : pass.passStatus === 'free'
                                                                        ? 'Free'
                                                                        : 'Pending'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-xs text-text-secondary">
                                                                    {new Date(pass.createdAt).toLocaleDateString()}
                                                                </p>
                                                                <button
                                                                    onClick={async () => {
                                                                        const redemptionCount =
                                                                            await getRedemptionCountByPass(
                                                                                pass.passId
                                                                            );
                                                                        const confirmMsg =
                                                                            redemptionCount > 0
                                                                                ? `Delete ticket pack "${pass.passId}"?\n\n⚠️ This will also delete ${redemptionCount} entr${
                                                                                      redemptionCount !== 1 ? 'ies' : 'y'
                                                                                  }.`
                                                                                : `Delete ticket pack "${pass.passId}"?`;
                                                                        if (window.confirm(confirmMsg)) {
                                                                            const result = await deletePass(pass.passId);
                                                                            if (result.success) {
                                                                                loadAnalytics();
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="text-xs bg-urgency-high/20 text-urgency-high hover:bg-urgency-high/40 px-2 py-1 rounded transition-colors font-medium"
                                                                >
                                                                    🗑️ Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {passes.length === 0 && (
                                                    <p className="text-center py-8 text-text-secondary text-sm">No ticket packs yet</p>
                                                )}
                                            </div>
                                            <div className="hidden lg:block overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="border-b border-border-subtle">
                                                        <tr className="text-text-secondary">
                                                            <th className="text-left py-2 px-2 font-medium">Ticket Pack ID</th>
                                                            <th className="text-left py-2 px-2 font-medium">Name</th>
                                                            <th className="text-left py-2 px-2 font-medium">Status</th>
                                                            <th className="text-left py-2 px-2 font-medium">Date</th>
                                                            <th className="text-right py-2 px-2 font-medium">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border-subtle">
                                                        {passes
                                                            .sort(
                                                                (a, b) =>
                                                                    new Date(b.createdAt).getTime() -
                                                                    new Date(a.createdAt).getTime()
                                                            )
                                                            .slice(0, 50)
                                                            .map((pass) => (
                                                                <tr
                                                                    key={pass.passId}
                                                                    className="hover:bg-bg-primary transition-colors group"
                                                                >
                                                                    <td className="py-2 px-2 text-text-secondary font-mono text-xs">
                                                                        {pass.passId}
                                                                    </td>
                                                                    <td className="py-2 px-2 text-text-primary font-medium">
                                                                        {pass.passHolderName}
                                                                    </td>
                                                                    <td className="py-2 px-2">
                                                                        <span
                                                                            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                                                                pass.paymentStatus === 'completed'
                                                                                    ? 'bg-value-highlight/20 text-value-highlight'
                                                                                    : pass.passStatus === 'free'
                                                                                    ? 'bg-action-primary/20 text-action-primary'
                                                                                    : 'bg-text-secondary/20 text-text-secondary'
                                                                            }`}
                                                                        >
                                                                            {pass.paymentStatus === 'completed'
                                                                                ? 'Paid'
                                                                                : pass.passStatus === 'free'
                                                                                ? 'Free'
                                                                                : 'Pending'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-2 px-2 text-text-secondary text-xs">
                                                                        {new Date(pass.createdAt).toLocaleDateString()}
                                                                    </td>
                                                                    <td className="py-2 px-2 text-right">
                                                                        <button
                                                                            onClick={async () => {
                                                                                const redemptionCount =
                                                                                    await getRedemptionCountByPass(
                                                                                        pass.passId
                                                                                    );
                                                                                const confirmMsg =
                                                                                    redemptionCount > 0
                                                                                        ? `Delete ticket pack "${pass.passId}" (${pass.passHolderName})?\n\n⚠️ This will also delete ${
                                                                                              redemptionCount
                                                                                          } entr${
                                                                                              redemptionCount !== 1
                                                                                                  ? 'ies'
                                                                                                  : 'y'
                                                                                          }.\n\nThis cannot be undone.`
                                                                                        : `Delete ticket pack "${pass.passId}" (${pass.passHolderName})?\n\nThis cannot be undone.`;
                                                                                if (window.confirm(confirmMsg)) {
                                                                                    const result = await deletePass(pass.passId);
                                                                                    if (result.success) {
                                                                                        loadAnalytics();
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="text-xs bg-urgency-high/20 text-urgency-high hover:bg-urgency-high/40 px-2 py-1 rounded transition-colors font-medium lg:opacity-0 lg:group-hover:opacity-100"
                                                                        >
                                                                            🗑️ Delete
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                                {passes.length === 0 && (
                                                    <p className="text-center py-8 text-text-secondary">No ticket packs yet</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeAnalyticsSection === 'redemptions' && (
                                        <div className="bg-bg-card rounded-xl border border-border-subtle p-4 lg:p-6">
                                            <h3 className="text-base lg:text-lg font-bold text-action-primary mb-3 lg:mb-4 flex items-center gap-2 flex-wrap">
                                                📜 Entries
                                                {(() => {
                                                    const passIds = new Set(passes.map(p => p.passId));
                                                    const orphanCount = redemptions.filter(r => !passIds.has(r.passId)).length;
                                                    return orphanCount > 0 ? (
                                                        <span className="text-xs bg-urgency-high/10 text-urgency-high px-2 py-0.5 rounded-full">
                                                            {orphanCount} orphaned
                                                        </span>
                                                    ) : null;
                                                })()}
                                            </h3>
                                            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                                {redemptions.length === 0 && (
                                                    <p className="text-xs text-text-secondary text-center py-4">No entries yet</p>
                                                )}
                                                {redemptions.map((r) => {
                                                    const vendor = vendors.find(v => v.vendorId === r.vendorId);
                                                    const pass = passes.find(p => p.passId === r.passId);
                                                    const isOrphan = !pass;
                                                    return (
                                                        <div
                                                            key={`${r.passId}-${r.dealName}-${r.redeemedAt}`}
                                                            className={`p-3 bg-bg-primary rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                                                                isOrphan ? 'border-urgency-high/40 bg-urgency-high/5' : 'border-border-subtle'
                                                            }`}
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-medium text-text-primary truncate">{r.dealName}</p>
                                                                <p className="text-[11px] text-text-secondary truncate">
                                                                    {vendor ? vendor.name : 'Unknown fundraiser'} • Ticket Pack {r.passId}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-[11px] text-text-secondary">
                                                                    {new Date(r.redeemedAt).toLocaleDateString()}
                                                                </p>
                                                                {isOrphan && (
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-urgency-high/20 text-urgency-high font-medium">
                                                                        Orphaned
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
