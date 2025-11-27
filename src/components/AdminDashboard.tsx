import React, { useState, useEffect } from 'react';
import { createVendor, getAllVendors, createDeal, getAllDeals, updateVendor, updateDeal, deleteVendor, deleteDeal, getAllPasses, getAllRedemptions } from '../services/firestoreService';
import { Vendor, Deal } from '../types';
import { PassDocument } from '../services/firestoreService';
import Button from './Button.tsx';
import ImageCarousel from './ImageCarousel';
import ContactDropdown from './ContactDropdown';

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
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [passes, setPasses] = useState<PassDocument[]>([]);
    const [redemptions, setRedemptions] = useState<any[]>([]);
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
            const passesData = await getAllPasses();
            const redemptionsData = await getAllRedemptions();
            setPasses(passesData);
            setRedemptions(redemptionsData);
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
                    setVendorSuccess(`Vendor "${vendorForm.name.trim()}" updated successfully with ${imageCount} images!`);
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
                    setVendorError(result.error || 'Failed to update vendor');
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
                    setVendorSuccess(`Vendor "${newVendor.name}" created successfully with ${imageCount} images!`);
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
                    setVendorError(result.error || 'Failed to create vendor');
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
        if (!window.confirm(`Delete vendor "${vendorName}"? This cannot be undone.`)) {
            return;
        }

        try {
            const result = await deleteVendor(vendorId);
            if (result.success) {
                setVendorSuccess(`Vendor "${vendorName}" deleted successfully!`);
                loadVendors();
            } else {
                setVendorError(result.error || 'Failed to delete vendor');
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
            setDealError('Please fill in all required fields (Vendor, Name, Offer)');
            return;
        }

        if (dealForm.savings && isNaN(Number(dealForm.savings))) {
            setDealError('Savings must be a number');
            return;
        }

        try {
            if (editingDealId) {
                // Update existing deal - filter out undefined values to avoid Firestore errors
                const updates: Partial<Deal> = {
                    vendorId: dealForm.vendorId,
                    name: dealForm.name.trim(),
                    offer: dealForm.offer.trim(),
                    category: dealForm.category,
                    featured: dealForm.featured,
                    images: dealForm.images.split(/[\n,]+/).map(s => s.trim()).filter(Boolean),
                };
                if (dealForm.savings) updates.savings = Number(dealForm.savings);
                if (dealForm.imageUrl.trim()) updates.imageUrl = dealForm.imageUrl.trim();
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
        <div className="min-h-screen bg-bg-primary p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-display font-black text-text-primary mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-text-secondary">Manage vendors and deals</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-border-subtle">
                    <button
                        onClick={() => setActiveTab('vendors')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'vendors'
                            ? 'text-action-primary border-b-2 border-action-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Vendors
                    </button>
                    <button
                        onClick={() => setActiveTab('deals')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'deals'
                            ? 'text-action-primary border-b-2 border-action-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Deals
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'analytics'
                            ? 'text-action-primary border-b-2 border-action-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Analytics
                    </button>
                </div>

                {/* Vendors Tab */}
                {activeTab === 'vendors' && (
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Vendor Form - Sticky on desktop */}
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                         <h2 className="text-xl lg:text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                             🏪 {editingVendorId ? 'Edit' : 'Add'}
                                         </h2>
                                         <p className="text-xs lg:text-xs text-text-secondary mt-1">Vendor details</p>
                                     </div>
                                    {editingVendorId && (
                                        <button
                                            onClick={cancelEditVendor}
                                            className="text-xs px-2 py-1 bg-border-subtle text-text-secondary hover:text-text-primary hover:bg-border-subtle/50 rounded-lg transition-colors"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            <form onSubmit={handleAddVendor} className="space-y-0">
                                <FormSection icon="📝" title="Basic Info" description="Name & category">
                                    <div>
                                        <label className="block text-xs font-medium text-text-primary mb-2">
                                            Venue Name <span className="text-urgency-high">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={vendorForm.name}
                                            onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                                            placeholder="e.g., Brew Pub"
                                            className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-text-primary mb-1">
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
                                            <label className="block text-xs font-medium text-text-primary mb-1">
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
                                        <label className="block text-xs font-medium text-text-primary mb-1">
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
                                        <label className="block text-xs font-medium text-text-primary mb-1">
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
                                        <label className="block text-xs font-medium text-text-primary mb-1">
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
                                        <label className="block text-xs font-medium text-text-primary mb-1">
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
                                        <label className="block text-xs font-medium text-text-primary mb-1">
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
                                        <label className="block text-xs font-medium text-text-primary mb-1">
                                            Logo
                                        </label>
                                        <input
                                            type="url"
                                            value={vendorForm.imageUrl}
                                            onChange={(e) => setVendorForm({ ...vendorForm, imageUrl: e.target.value })}
                                            placeholder="https://example.com/logo.jpg"
                                            className="w-full px-3 py-1.5 text-xs bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                        />
                                        <ImagePreview url={vendorForm.imageUrl} alt={vendorForm.name || 'Vendor logo'} />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-text-primary mb-1">
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
                        </div>

                        {/* Vendors List */}
                        <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                 📋 Vendors <span className="text-sm font-normal text-text-secondary bg-border-subtle px-2 py-0.5 rounded-full">{vendors.length}</span>
                             </h2>
                            {isLoadingVendors ? (
                                <p className="text-sm text-text-secondary">Loading...</p>
                            ) : vendors.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-text-secondary">No vendors</p>
                                </div>
                            ) : (
                                <div className="grid gap-3 auto-rows-max">
                                    {vendors.map((vendor) => (
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
                                                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(vendor.pin);
                                                        }}
                                                        className="text-xs font-mono font-bold text-success bg-success/20 hover:bg-success/30 px-1.5 py-0.5 rounded whitespace-nowrap transition-colors"
                                                        title="Copy PIN"
                                                    >
                                                        🔑 {vendor.pin}
                                                    </button>
                                                    <button
                                                        onClick={() => startEditVendor(vendor)}
                                                        className="text-xs bg-action-primary/20 text-action-primary hover:bg-action-primary/40 px-1.5 py-0.5 rounded transition-colors font-medium"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteVendor(vendor.vendorId, vendor.name)}
                                                        className="text-xs bg-urgency-high/20 text-urgency-high hover:bg-urgency-high/40 px-1.5 py-0.5 rounded transition-colors font-medium"
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
                    </div>
                )}

                {/* Deals Tab */}
                {activeTab === 'deals' && (
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Deal Form - Sticky on desktop */}
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                         <h2 className="text-xl lg:text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                             🎁 {editingDealId ? 'Edit' : 'Add'}
                                         </h2>
                                         <p className="text-xs lg:text-xs text-text-secondary mt-1">Deal details</p>
                                     </div>
                                    {editingDealId && (
                                        <button
                                            onClick={cancelEditDeal}
                                            className="text-xs px-2 py-1 bg-border-subtle text-text-secondary hover:text-text-primary hover:bg-border-subtle/50 rounded-lg transition-colors"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            <form onSubmit={handleAddDeal} className="space-y-0">
                                <FormSection icon="🏪" title="Offer" description="Vendor & description">
                                    <div>
                                        <label className="block text-xs font-medium text-text-primary mb-1">
                                            Vendor <span className="text-urgency-high">*</span>
                                        </label>
                                        <select
                                            value={dealForm.vendorId}
                                            onChange={(e) => setDealForm({ ...dealForm, vendorId: e.target.value })}
                                            className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-action-primary"
                                        >
                                            <option value="">Select vendor...</option>
                                            {vendors.map((vendor) => (
                                                <option key={vendor.vendorId} value={vendor.vendorId}>
                                                    {vendor.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-text-primary mb-1">
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
                                        <label className="block text-xs font-medium text-text-primary mb-1">
                                            Description <span className="text-urgency-high">*</span>
                                        </label>
                                        <textarea
                                            value={dealForm.offer}
                                            onChange={(e) => setDealForm({ ...dealForm, offer: e.target.value })}
                                            placeholder="2-for-1 on Main Meals"
                                            rows={2}
                                            className="w-full px-3 py-1.5 text-sm bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary"
                                        />
                                    </div>
                                </FormSection>

                                <FormSection icon="💰" title="Details" description="Value & location">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-text-primary mb-1">
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
                                            <label className="block text-xs font-medium text-text-primary mb-1">
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
                                        <label className="block text-xs font-medium text-text-primary mb-1">
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
                                        <label className="block text-xs font-medium text-text-primary mb-1">
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
                                        <label className="block text-xs font-medium text-text-primary mb-1">
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
                                        <label className="block text-xs font-medium text-text-primary mb-1">
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
                        </div>

                        {/* Deals List */}
                        <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                 📦 Deals <span className="text-sm font-normal text-text-secondary bg-border-subtle px-2 py-0.5 rounded-full">{deals.length}</span>
                              </h2>
                            {isLoadingDeals ? (
                                <p className="text-sm text-text-secondary">Loading...</p>
                            ) : deals.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-text-secondary">No deals</p>
                                </div>
                            ) : (
                                <div className="grid gap-3 auto-rows-max">
                                    {deals.map((deal) => (
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
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {isLoadingAnalytics ? (
                            <p className="text-sm text-text-secondary">Loading analytics...</p>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {/* Total Passes */}
                                    <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs sm:text-sm text-text-secondary font-medium">Total Passes</p>
                                                <p className="text-2xl sm:text-3xl font-bold text-text-primary mt-2">{passes.length}</p>
                                            </div>
                                            <span className="text-4xl">🎫</span>
                                        </div>
                                    </div>

                                    {/* Revenue */}
                                    <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs sm:text-sm text-text-secondary font-medium">Total Revenue</p>
                                                <p className="text-2xl sm:text-3xl font-bold text-value-highlight mt-2">
                                                    R{passes.reduce((sum, p) => sum + (p.purchasePrice || 0), 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <span className="text-4xl">💰</span>
                                        </div>
                                    </div>

                                    {/* Total Redemptions */}
                                    <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs sm:text-sm text-text-secondary font-medium">Redemptions</p>
                                                <p className="text-2xl sm:text-3xl font-bold text-action-primary mt-2">{redemptions.length}</p>
                                            </div>
                                            <span className="text-4xl">✓</span>
                                        </div>
                                    </div>

                                    {/* Redemption Rate */}
                                    <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs sm:text-sm text-text-secondary font-medium">Redemption Rate</p>
                                                <p className="text-2xl sm:text-3xl font-bold text-success mt-2">
                                                    {passes.length > 0 ? Math.round((redemptions.length / passes.length) * 100) : 0}%
                                                </p>
                                            </div>
                                            <span className="text-4xl">📊</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pass Breakdown */}
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {/* Pass Purchases by Type */}
                                    <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                                        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                            🎫 Pass Purchases by Type
                                        </h3>
                                        <div className="space-y-3">
                                            {(() => {
                                                const paidPasses = passes.filter(p => p.paymentStatus === 'completed');
                                                const freePasses = passes.filter(p => p.passStatus === 'free');
                                                return [
                                                    { label: 'Paid Passes', count: paidPasses.length, color: 'text-value-highlight' },
                                                    { label: 'Free Passes', count: freePasses.length, color: 'text-action-primary' },
                                                ];
                                            })().map((item) => (
                                                <div key={item.label} className="flex items-center justify-between p-3 bg-bg-primary rounded-lg border border-border-subtle">
                                                    <span className="text-sm text-text-secondary">{item.label}</span>
                                                    <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Most Redeemed Deals */}
                                    <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                                        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                            🏆 Most Redeemed Deals
                                        </h3>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {(() => {
                                                const dealCounts: Record<string, number> = {};
                                                redemptions.forEach((r) => {
                                                    dealCounts[r.dealName] = (dealCounts[r.dealName] || 0) + 1;
                                                });
                                                return Object.entries(dealCounts)
                                                    .sort((a, b) => b[1] - a[1])
                                                    .slice(0, 10);
                                            })().map(([dealName, count]) => (
                                                <div key={dealName} className="flex items-center justify-between p-2 bg-bg-primary rounded-lg border border-border-subtle/50">
                                                    <span className="text-xs sm:text-sm text-text-secondary truncate flex-1">{dealName}</span>
                                                    <span className="text-sm font-bold text-success ml-2 whitespace-nowrap">{count}x</span>
                                                </div>
                                            ))}
                                            {redemptions.length === 0 && (
                                                <p className="text-xs text-text-secondary text-center py-4">No redemptions yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Purchases */}
                                <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                                    <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                        👥 Recent Pass Purchases
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs sm:text-sm">
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
                                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                    .slice(0, 20)
                                                    .map((pass) => (
                                                        <tr key={pass.passId} className="hover:bg-bg-primary transition-colors">
                                                            <td className="py-2 px-2 text-text-primary font-medium">{pass.passHolderName}</td>
                                                            <td className="py-2 px-2 text-text-secondary truncate">{pass.email}</td>
                                                            <td className="py-2 px-2 text-text-secondary capitalize">{pass.passType}</td>
                                                            <td className="py-2 px-2 text-right text-value-highlight font-bold">R{pass.purchasePrice || 0}</td>
                                                            <td className="py-2 px-2 text-text-secondary text-xs">
                                                                {new Date(pass.createdAt).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                        {passes.filter(p => p.paymentStatus === 'completed').length === 0 && (
                                            <p className="text-center py-8 text-text-secondary">No purchased passes</p>
                                        )}
                                    </div>
                                </div>

                                {/* Redemption Details */}
                                <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
                                    <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                                        📜 Recent Redemptions
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs sm:text-sm">
                                            <thead className="border-b border-border-subtle">
                                                <tr className="text-text-secondary">
                                                    <th className="text-left py-2 px-2 font-medium">Pass ID</th>
                                                    <th className="text-left py-2 px-2 font-medium">Deal</th>
                                                    <th className="text-left py-2 px-2 font-medium">Vendor</th>
                                                    <th className="text-left py-2 px-2 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-subtle">
                                                {redemptions
                                                    .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
                                                    .slice(0, 20)
                                                    .map((redemption, idx) => {
                                                        const vendor = vendors.find(v => v.vendorId === redemption.vendorId);
                                                        return (
                                                            <tr key={`${redemption.passId}-${idx}`} className="hover:bg-bg-primary transition-colors">
                                                                <td className="py-2 px-2 text-text-secondary font-mono text-xs">{redemption.passId.substring(0, 8)}</td>
                                                                <td className="py-2 px-2 text-text-primary">{redemption.dealName}</td>
                                                                <td className="py-2 px-2 text-text-secondary">{vendor?.name || 'Unknown'}</td>
                                                                <td className="py-2 px-2 text-text-secondary text-xs">
                                                                    {new Date(redemption.redeemedAt).toLocaleDateString()}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                        {redemptions.length === 0 && (
                                            <p className="text-center py-8 text-text-secondary">No redemptions yet</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
