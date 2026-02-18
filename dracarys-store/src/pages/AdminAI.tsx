import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, TrendingUp, Plus, Trash2, LayoutDashboard, Check, Package, X, Download, Loader2, Search, Printer, Pencil, Calendar, Clock, Send, Copy, FileText, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { salesService } from '../services/salesService';
import { productService } from '../services/productService';
import JsBarcode from 'jsbarcode';
import { purchaseService } from '../services/purchaseService';
import type { Sale, Product, Purchase } from '../types/database';
import { formatPrice } from '../utils/formatters';
import { getColorValue, isLightColor } from '../utils/colors';
import { useToastStore } from '../store/toastStore';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';


const CATEGORIES = [
    "Штаны",
    "Куртки | Пальто",
    "Футболки",
    "Обувь",
    "Сумки | Аксессуары",
    "Толстовки и худи",
    "Шапки"
];

const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas toBlob failed'));
                }, 'image/jpeg', 0.8);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

interface AdminAIProps {
    initialMode?: 'sale' | 'purchase' | 'warehouse' | 'archive';
}

export const AdminAI: React.FC<AdminAIProps> = ({ initialMode }) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToastStore();

    // UI State
    const [inputMode, setInputMode] = useState<'sale' | 'purchase' | 'warehouse' | 'archive'>(initialMode || 'sale');
    const [searchQuery, setSearchQuery] = useState('');
    const [archiveSearch, setArchiveSearch] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);
    const [isPurchaseDeleteModalOpen, setIsPurchaseDeleteModalOpen] = useState(false);
    const [isPendingCollapsed, setIsPendingCollapsed] = useState(false);
    const [isSalesHistoryCollapsed, setIsSalesHistoryCollapsed] = useState(false);

    const generateReceiptText = (sale: Sale) => {
        if (!sale) return '';
        // Final Conclusive Time Fix: Avoid UTC conversion for date-only strings
        const sStr = sale.sale_date ? String(sale.sale_date) : '';
        const cStr = sale.created_at ? String(sale.created_at) : '';

        let dateObj: Date;
        if (sStr.includes(':') || sStr.includes('T')) {
            dateObj = new Date(sStr);
        } else if (cStr) {
            dateObj = new Date(cStr);
        } else {
            // Force local midnight for date-only strings
            dateObj = new Date(`${sStr}T00:00:00`);
        }

        const date = dateObj.toLocaleDateString('ru-KZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const time = dateObj.toLocaleTimeString('ru-KZ', { hour: '2-digit', minute: '2-digit' });

        const text = `dracarys.kz\n` +
            `электронный чек\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `${sale.product_name}\n` +
            `размер: ${sale.size}\n` +
            `кол-во: ${sale.quantity} шт\n` +
            `итого: ${formatPrice(sale.selling_price * sale.quantity)} ₸\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n` +
            `дата: ${date} ${time}\n` +
            `style is about you.\n\n` +
            `dracarys.kz | qaraa.crm`;

        return text.toLowerCase();
    };

    const handleOpenReceipt = async (sale: Sale) => {
        setSelectedSaleForReceipt(sale);
        setIsReceiptModalOpen(true);
    };


    const handleCopyReceipt = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            addToast('success', 'Чек скопирован в буфер обмена');
        } catch (err) {
            addToast('error', 'Ошибка при копировании');
        }
    };

    const handleGeneratePDF = async (sale: Sale) => {
        setIsSubmitting(true);
        try {
            const element = document.getElementById('receipt-pdf-template');
            if (!element) throw new Error('E:TemplateNotFound');

            // Use html2canvas with maximum compatibility settings
            const canvas = await html2canvas(element, {
                scale: 1, // Quality vs Speed trade-off for mobile share
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 340,
                // Manual capture rect to avoid 'Attempting to paint' errors
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0
            });

            if (!canvas || canvas.width === 0) throw new Error('E:CanvasEmpty');

            const imgData = canvas.toDataURL('image/jpeg', 0.85);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [80, 160]
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            const pdfBlob = pdf.output('blob');
            const fileName = `receipt-${sale.id.slice(0, 4)}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'dracarys.kz',
                        text: generateReceiptText(sale)
                    });
                } catch (sErr: any) {
                    if (sErr.name !== 'AbortError') {
                        pdf.save(fileName);
                        addToast('success', 'чек сохранен');
                    }
                }
            } else {
                pdf.save(fileName);
                addToast('success', 'чек сохранен');
            }

            setIsReceiptModalOpen(false);
        } catch (error: any) {
            console.error('Final PDF Error:', error);
            // Show real error for debugging
            const msg = error.message || 'Unknown capture error';
            addToast('error', `ошибка: ${msg.slice(0, 40)}`);
            handleCopyReceipt(generateReceiptText(sale));
        } finally {
            setIsSubmitting(false);
        }
    };
    const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
    const [isProductDeleteModalOpen, setIsProductDeleteModalOpen] = useState(false); // New modal for product delete
    const [productToDelete, setProductToDelete] = useState<string | null>(null);     // ID of product to delete
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        barcode: '',
        colors: [] as string[],
        images: [] as string[],
        sizes: [] as string[],
        color_images: {} as Record<string, string[]>,
        stockQuantities: {} as Record<string, Record<string, string>> // color -> size -> qty
    });

    // Order arrival modal state
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [deliveryCost, setDeliveryCost] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [arrivalStep, setArrivalStep] = useState<'delivery' | 'decision' | 'price'>('delivery');
    const [selectedExistingProductId, setSelectedExistingProductId] = useState<string>('new');

    // Barcode modal state for warehouse
    const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
    const [barcodeModalInput, setBarcodeModalInput] = useState('');
    const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);
    const [barcodeModalAssignProduct, setBarcodeModalAssignProduct] = useState<Product | null>(null);
    const [barcodeModalStep, setBarcodeModalStep] = useState<'input' | 'found' | 'notfound' | 'assign'>('input');
    const [barcodeModalLoading, setBarcodeModalLoading] = useState(false);
    const [newProductForm, setNewProductForm] = useState({
        name: '', // Must be empty initially
        category: '',
        price: '',
        description: '',
        colors: [] as string[],
        photo_url: '',
        images: [] as string[],
        sizes: [] as string[],
        initial_size: '',
        initial_quantity: '',
        selected_color: '', // For stock addition
        stock_quantities: {} as Record<string, Record<string, string>> // color -> size -> qty
    });

    const [stockAdditions, setStockAdditions] = useState<Record<string, Record<string, string>>>({}); // color -> size -> qty
    const [selectedBarcodeColor, setSelectedBarcodeColor] = useState('');
    const [newColorInput, setNewColorInput] = useState('');
    const [newEditColorInput, setNewEditColorInput] = useState('');

    // Sale Form state - With barcode support
    const [newSale, setNewSale] = useState({
        barcode: '',
        product_id: '',
        product_name: '',
        size: '',
        color: '',
        quantity: '' as string | number,
        selling_price: '',
        sale_date: new Date().toISOString().split('T')[0]
    });
    const [barcodeError, setBarcodeError] = useState('');
    const [barcodeLoading, setBarcodeLoading] = useState(false);
    // const [stockAddition, setStockAddition] = useState({ size: '', quantity: '' }); // Deprecated in favor of stockAdditions

    const [newPurchase, setNewPurchase] = useState({
        name: '',
        purchase_price: '',
        yuan_price: '',
        source_app: 1,
        cargo: 'GO-express',
        category: '',
        photo_url: '',
        color: '',
        order_date: new Date().toISOString().split('T')[0],
        isExistingProduct: false,
        existingProductId: '',
        item_url: '',
        for_whom: 'business' as 'business' | 'myself' | 'home',
        track_code: '',
        stock_quantities: {} as Record<string, Record<string, string>> // color -> size -> qty
    });

    // Auto-calculate selling price per unit when product is set
    useEffect(() => {
        const product = products.find(p => p.id === newSale.product_id);
        if (product) {
            const unitPrice = product.discounted_price || product.price;
            setNewSale(prev => ({
                ...prev,
                selling_price: unitPrice.toString()
            }));
        } else {
            setNewSale(prev => ({ ...prev, quantity: '', selling_price: '' }));
        }
    }, [newSale.product_id, products]);

    // Handle barcode input and search
    const handleBarcodeSearch = async (barcode: string) => {
        setNewSale(prev => ({ ...prev, barcode }));
        setBarcodeError('');

        if (!barcode.trim()) {
            setNewSale(prev => ({
                ...prev,
                product_id: '',
                product_name: '',
                size: '',
                quantity: '',
                selling_price: ''
            }));
            return;
        }

        setBarcodeLoading(true);
        try {
            const product = await productService.getProductByBarcode(barcode);
            if (product) {
                setNewSale(prev => ({
                    ...prev,
                    product_id: product.id,
                    product_name: product.name
                }));
                setBarcodeError('');
            } else {
                setNewSale(prev => ({
                    ...prev,
                    product_id: '',
                    product_name: '',
                    size: '',
                    quantity: '',
                    selling_price: ''
                }));
                setBarcodeError('Товар с таким штрихкодом не найден');
            }
        } catch (error) {
            console.error('Error searching barcode:', error);
            setBarcodeError('Ошибка поиска штрихкода');
        } finally {
            setBarcodeLoading(false);
        }
    };

    useEffect(() => {
        if (newPurchase.isExistingProduct && newPurchase.existingProductId) {
            const product = products.find(p => p.id === newPurchase.existingProductId);
            if (product) {
                setNewPurchase(prev => ({
                    ...prev,
                    name: product.name,
                    category: product.category
                }));
            }
        }
    }, [newPurchase.isExistingProduct, newPurchase.existingProductId, products]);

    useEffect(() => {
        loadData();
    }, []);


    // Auto-refresh for warehouse mode
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (inputMode === 'warehouse') {
            interval = setInterval(() => {
                loadData(true);
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [inputMode]);

    const loadData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const [salesData, productsData, purchasesData] = await Promise.all([
                salesService.getAllSales(),
                productService.getAllProducts(),
                purchaseService.getAllPurchases()
            ]);
            setSales(salesData);
            setProducts(productsData);
            setPurchases(purchasesData);
        } catch (error) {
            console.error('Error loading data:', error);
            addToast('error', 'Ошибка загрузки данных');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSale = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newSale.barcode || !newSale.product_id || !newSale.size || !newSale.quantity) {
            addToast('error', 'Заполните все поля');
            return;
        }

        const selectedProduct = products.find(p => p.id === newSale.product_id);
        if (!selectedProduct) {
            addToast('error', 'Товар не найден');
            return;
        }

        try {
            await salesService.addSale({
                product_id: newSale.product_id,
                product_name: selectedProduct.name,
                size: newSale.size,
                color: newSale.color,
                quantity: Number(newSale.quantity) || 1,
                purchase_price: selectedProduct.cost || 0,
                selling_price: parseInt(newSale.selling_price) || 0,
                source: null,
                sale_date: newSale.sale_date
            });
            addToast('success', 'Продажа добавлена');
            setNewSale({
                barcode: '',
                product_id: '',
                product_name: '',
                size: '',
                color: '',
                quantity: '',
                selling_price: '',
                sale_date: new Date().toISOString().split('T')[0]
            });
            setBarcodeError('');
            loadData();
        } catch (error) {
            addToast('error', 'Ошибка при добавлении');
        }
    };

    const handleAddPurchase = async (e: React.FormEvent) => {
        e.preventDefault();

        // Flatten stock_quantities from { color: { size: qty } } to list of entries
        const allEntries: { color: string, size: string, qty: string }[] = [];
        Object.entries(newPurchase.stock_quantities).forEach(([color, sizes]) => {
            if (typeof sizes === 'object' && sizes !== null) {
                Object.entries(sizes).forEach(([size, qty]) => {
                    if (qty && parseInt(qty as string) > 0) {
                        allEntries.push({ color, size, qty: qty as string });
                    }
                });
            }
        });

        if (!newPurchase.name || allEntries.length === 0 || !newPurchase.purchase_price) {
            addToast('error', 'Заполните название, цену и хотя бы один размер');
            return;
        }

        setIsSubmitting(true);
        try {
            const price = parseInt(newPurchase.purchase_price);
            const yuanPrice = newPurchase.yuan_price ? parseInt(newPurchase.yuan_price) : undefined;

            if (isNaN(price)) {
                addToast('error', 'Введите корректную цену');
                setIsSubmitting(false);
                return;
            }

            // Create separate pending records for each size/color combination
            await Promise.all(allEntries.map(entry =>
                purchaseService.createPurchase({
                    name: newPurchase.name,
                    size: entry.size,
                    color: entry.color,
                    quantity: parseInt(entry.qty),
                    purchase_price: price,
                    yuan_price: yuanPrice,
                    source_app: newPurchase.source_app,
                    category: newPurchase.category,
                    photo_url: newPurchase.photo_url || undefined,
                    order_date: newPurchase.order_date,
                    item_url: newPurchase.item_url || undefined,
                    cargo: newPurchase.cargo as 'GO-express' | 'SHAO-cargo',
                    for_whom: newPurchase.for_whom,
                    track_code: newPurchase.track_code
                })
            ));

            addToast('success', `Добавлено позиций: ${allEntries.length}`);
            setNewPurchase({
                name: '',
                purchase_price: '',
                yuan_price: '',
                source_app: 1,
                cargo: 'GO-express',
                category: '',
                photo_url: '',
                color: '',
                order_date: new Date().toISOString().split('T')[0],
                isExistingProduct: false,
                existingProductId: '',
                item_url: '',
                for_whom: 'business' as 'business' | 'myself' | 'home',
                track_code: '',
                stock_quantities: {} as Record<string, Record<string, string>>
            });
            loadData();
        } catch (error) {
            console.error('Error adding bulk purchase:', error);
            addToast('error', 'Ошибка при добавлении закупки');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSale = async () => {
        if (!saleToDelete) return;
        try {
            await salesService.deleteSale(saleToDelete.id);
            addToast('success', 'Запись удалена');
            setIsDeleteModalOpen(false);
            setSaleToDelete(null);
            loadData();
        } catch (error) {
            addToast('error', 'Ошибка при удалении');
        }
    };

    const confirmDeleteSale = (sale: Sale) => {
        setSaleToDelete(sale);
        setIsDeleteModalOpen(true);
    };

    const handleOrderArrived = (purchase: Purchase) => {
        setSelectedPurchase(purchase);
        if (purchase.status === 'arrived') {
            setArrivalStep('price');
            setDeliveryCost(purchase.delivery_cost?.toString() || '');
        } else {
            setArrivalStep('delivery');
            setDeliveryCost('');
        }
        setSellingPrice('');
    };

    const handleDeliverySubmit = async () => {
        if (!selectedPurchase || !deliveryCost) return;
        try {
            const updatedPurchase = await purchaseService.updatePurchaseStatus(
                selectedPurchase.id,
                'arrived',
                parseInt(deliveryCost) || 0
            );
            setSelectedPurchase(updatedPurchase);
            setArrivalStep('decision');
            loadData();
        } catch (error) {
            addToast('error', 'Ошибка при обновлении');
        }
    };


    const confirmDeletePurchase = (purchase: Purchase) => {
        setPurchaseToDelete(purchase);
        setIsPurchaseDeleteModalOpen(true);
    };

    const handleDeletePurchase = async () => {
        if (!purchaseToDelete) return;
        try {
            await purchaseService.deletePurchase(purchaseToDelete.id);
            addToast('success', 'Закупка удалена');
            setIsPurchaseDeleteModalOpen(false);
            setPurchaseToDelete(null);
            loadData();
        } catch (error) {
            addToast('error', 'Ошибка при удалении');
        }
    };

    const handleCreateProductFromPurchase = async () => {
        if (!selectedPurchase || !sellingPrice) return;
        setIsSubmitting(true);
        try {
            if (selectedExistingProductId === 'new') {
                await productService.createFromPurchase(
                    {
                        name: selectedPurchase.name,
                        size: selectedPurchase.size,
                        category: selectedPurchase.category,
                        photo_url: selectedPurchase.photo_url
                    },
                    parseInt(sellingPrice) || 0,
                    selectedPurchase.total_cost || selectedPurchase.purchase_price
                );
                addToast('success', 'Товар создан и добавлен в архив');
            } else {
                await productService.linkPurchaseToExistingProduct(
                    selectedExistingProductId,
                    selectedPurchase.size,
                    parseInt(sellingPrice) || 0,
                    selectedPurchase.total_cost || selectedPurchase.purchase_price
                );
                addToast('success', 'Добавлено в архив (склад обновлен)');
            }

            await purchaseService.updatePurchaseStatus(selectedPurchase.id, 'listed');
            setSelectedPurchase(null);
            setSelectedExistingProductId('new');
            loadData();
        } catch (error) {
            console.error('Error listing product:', error);
            addToast('error', 'Ошибка при выставлении товара');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Barcode Modal Handlers
    const handleOpenBarcodeModal = () => {
        setBarcodeModalOpen(true);
        setBarcodeModalInput('');
        setBarcodeModalProduct(null);
        setBarcodeModalAssignProduct(null);
        setBarcodeModalStep('input');
        setNewProductForm({
            name: '', // Must be empty initially
            category: '',
            price: '',
            description: '',
            colors: [],
            photo_url: '',
            images: [],
            sizes: [],
            initial_size: '',
            initial_quantity: '',
            selected_color: '',
            stock_quantities: {}
        });
        setStockAdditions({});
    };

    const handlePrintBarcode = (product: Product | null) => {
        if (!product || !product.barcode) {
            addToast('error', 'У товара нет штрихкода');
            return;
        }

        try {
            // Create a hidden canvas to generate the barcode
            const canvas = document.createElement('canvas');
            JsBarcode(canvas, product.barcode, {
                format: "CODE128",
                displayValue: true,
                fontSize: 20,
                margin: 0,
                width: 2,
                height: 50
            });

            const imgData = canvas.toDataURL('image/png');

            // Create PDF (58mm x 40mm)
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [58, 40]
            });

            // Add Content
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('Dracarys Store', 29, 5, { align: 'center' }); // Centered Header

            // Product Name (Truncate if too long)
            let name = product.name;
            if (name.length > 20) name = name.substring(0, 18) + '...';
            doc.setFontSize(10);
            doc.text(name, 29, 10, { align: 'center' });

            // Price (Big)
            doc.setFontSize(16);
            doc.text(`${product.price} T`, 29, 17, { align: 'center' });

            // Size/Color info if selected
            const info = `${selectedBarcodeColor !== 'Без цвета' ? selectedBarcodeColor : ''}`;
            if (info) {
                doc.setFontSize(8);
                doc.text(info, 29, 21, { align: 'center' });
            }

            // Barcode Image
            // x, y, w, h
            // Center roughly: 58mm width. image width depends.
            // Let's use 40mm width for barcode, centered -> x = (58-40)/2 = 9
            doc.addImage(imgData, 'PNG', 9, 23, 40, 15);

            // Save
            doc.save(`${product.name}_barcode.pdf`);
            addToast('success', 'Этикетка скачана');

        } catch (error) {
            console.error('Print Error:', error);
            addToast('error', 'Ошибка печати');
        }
    };

    const handleCloseBarcodeModal = () => {
        setBarcodeModalOpen(false);
        setBarcodeModalInput('');
        setBarcodeModalProduct(null);
        setBarcodeModalAssignProduct(null);
        setBarcodeModalStep('input');
        setNewProductForm({
            name: '',
            category: '',
            price: '',
            description: '',
            colors: [],
            photo_url: '',
            images: [],
            sizes: [],
            initial_size: '',
            initial_quantity: '',
            selected_color: '',
            stock_quantities: {}
        });
        setStockAdditions({});
        setSelectedBarcodeColor('');
    };

    const handleBarcodeModalSearch = async (barcode: string) => {
        setBarcodeModalInput(barcode);
        if (!barcode.trim()) {
            setBarcodeModalStep('input');
            setBarcodeModalProduct(null);
            return;
        }

        setBarcodeModalLoading(true);
        try {
            const product = await productService.getProductByBarcode(barcode);
            if (product) {
                // If we found a product with this barcode, show it
                setBarcodeModalProduct(product);
                setBarcodeModalStep('found');
                setSelectedBarcodeColor(product.colors?.[0] || 'Без цвета');
            } else {
                // If we didn't find a product, and we're NOT in assign mode, go to notfound
                // If we ARE in assign mode, stay there (it means the barcode is free to use)
                setBarcodeModalProduct(null);
                if (barcodeModalStep !== 'assign') {
                    setBarcodeModalStep('notfound');
                    setNewProductForm(prev => ({
                        ...prev,
                        name: '',
                        category: '',
                        price: '',
                        description: '',
                        photo_url: '',
                        images: []
                    }));
                }
            }
        } catch (error) {
            console.error('Error searching barcode:', error);
            addToast('error', 'Ошибка поиска штрихкода');
        } finally {
            setBarcodeModalLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIsSubmitting(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const compressedBlob = await compressImage(files[i]);
                const compressedFile = new File([compressedBlob], files[i].name, { type: 'image/jpeg' });
                const url = await productService.uploadImage(compressedFile);
                uploadedUrls.push(url);
            }

            if (isEditModalOpen) {
                // Check if we are uploading for a specific color
                const colorKey = selectedBarcodeColor && selectedBarcodeColor !== 'Без цвета' ? selectedBarcodeColor : null;

                if (colorKey) {
                    setEditForm(prev => ({
                        ...prev,
                        color_images: {
                            ...prev.color_images,
                            [colorKey]: [...(prev.color_images[colorKey] || []), ...uploadedUrls]
                        }
                    }));
                } else {
                    setEditForm(prev => ({
                        ...prev,
                        images: [...(prev.images || []), ...uploadedUrls]
                    }));
                }
            } else {
                setNewProductForm(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...uploadedUrls],
                    photo_url: prev.photo_url || uploadedUrls[0]
                }));
            }
            addToast('success', `${files.length} фото загружено`);
        } catch (error) {
            console.error('Image upload error:', error);
            addToast('error', 'Ошибка при загрузке фото');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddStock = async () => {
        if (!barcodeModalProduct) return;

        const flatEntries: { color: string, size: string, qty: number }[] = [];
        Object.entries(stockAdditions).forEach(([color, sizes]) => {
            Object.entries(sizes).forEach(([size, qty]) => {
                if (qty && parseInt(qty) > 0) {
                    flatEntries.push({ color, size, qty: parseInt(qty) });
                }
            });
        });

        if (flatEntries.length === 0) return;

        setIsSubmitting(true);
        try {
            // Ensure product.sizes and colors contains added sizes/colors and set visible
            const addedSizes = Array.from(new Set(flatEntries.map(e => e.size)));
            const addedColors = Array.from(new Set(flatEntries.map(e => e.color)));
            const currentProduct = barcodeModalProduct;

            const mergedSizes = Array.from(new Set([...(currentProduct.sizes || []), ...addedSizes]));
            const mergedColors = Array.from(new Set([...(currentProduct.colors || []), ...addedColors]));

            await productService.updateProduct(currentProduct.id, {
                sizes: mergedSizes,
                colors: mergedColors,
                is_visible: true
            });

            await Promise.all(flatEntries.map(e =>
                purchaseService.createListedPurchase({
                    name: barcodeModalProduct.name,
                    size: e.size,
                    color: e.color,
                    quantity: e.qty,
                    purchase_price: barcodeModalProduct.cost || 0,
                    source_app: 1,
                    category: barcodeModalProduct.category,
                    order_date: new Date().toISOString().split('T')[0]
                })
            ));

            // Artificial delay to ensure DB updates
            await new Promise(resolve => setTimeout(resolve, 500));

            addToast('success', 'Запас успешно обновлен');
            setStockAdditions({});
            await loadData(); // Reload all data to reflect new stock
        } catch (error) {
            console.error('Error adding stock:', error);
            addToast('error', 'Ошибка при добавлении запаса');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrintReport = async () => {
        const element = document.querySelector('.SalesLogContainer') as HTMLElement;
        if (!element) {
            addToast('error', 'История продаж не найдена');
            return;
        }

        try {
            addToast('success', 'Подготовка PDF...');

            // Expand section if collapsed for capture
            const wasCollapsed = isSalesHistoryCollapsed;
            if (wasCollapsed) {
                setIsSalesHistoryCollapsed(false);
                await new Promise(resolve => setTimeout(resolve, 600));
            } else {
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            window.scrollTo(0, 0);

            const canvas = await html2canvas(element, {
                scale: 1.5,
                logging: false,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                onclone: (clonedDoc) => {
                    // Nuclear fix: Remove all CSS rules that contains 'oklab' or 'oklch'
                    try {
                        for (let i = 0; i < clonedDoc.styleSheets.length; i++) {
                            const sheet = clonedDoc.styleSheets[i];
                            try {
                                const rules = sheet.cssRules || sheet.rules;
                                for (let j = rules.length - 1; j >= 0; j--) {
                                    const rule = rules[j] as CSSStyleRule;
                                    if (rule.cssText && (rule.cssText.includes('oklab') || rule.cssText.includes('oklch'))) {
                                        sheet.deleteRule(j);
                                    }
                                }
                            } catch (e) {
                                // Ignore cross-origin stylesheet errors
                            }
                        }
                    } catch (e) {
                        console.error('Stylesheet sanitization error:', e);
                    }

                    // Transform table to Excel-style (Full Audit)
                    const logContainer = clonedDoc.querySelector('.SalesLogContainer') as HTMLElement;
                    if (logContainer) {
                        // Remove non-printing elements
                        const noPrint = logContainer.querySelectorAll('.no-print');
                        noPrint.forEach(el => el.remove());

                        const table = logContainer.querySelector('table');
                        if (table) {
                            // Update header for full audit
                            const thead = table.querySelector('thead');
                            if (thead) {
                                thead.innerHTML = `
                                    <tr style="background-color: #f3f4f6;">
                                        <th style="padding: 12px; border: 1px solid #d1d5db; font-size: 10px; text-transform: uppercase;">Дата</th>
                                        <th style="padding: 12px; border: 1px solid #d1d5db; font-size: 10px; text-transform: uppercase;">Товар</th>
                                        <th style="padding: 12px; border: 1px solid #d1d5db; font-size: 10px; text-transform: uppercase; text-align: center;">Разм</th>
                                        <th style="padding: 12px; border: 1px solid #d1d5db; font-size: 10px; text-transform: uppercase; text-align: center;">Кол</th>
                                        <th style="padding: 12px; border: 1px solid #d1d5db; font-size: 10px; text-transform: uppercase; text-align: right;">Закуп</th>
                                        <th style="padding: 12px; border: 1px solid #d1d5db; font-size: 10px; text-transform: uppercase; text-align: right;">Прод</th>
                                        <th style="padding: 12px; border: 1px solid #d1d5db; font-size: 10px; text-transform: uppercase; text-align: right;">Прибыль</th>
                                    </tr>
                                `;
                            }

                            // Update body with formatted rows
                            const tbody = table.querySelector('tbody');
                            if (tbody) {
                                let totalProfit = 0;
                                let totalSales = 0;

                                const rows = sales.map(s => {
                                    const profit = (s.selling_price - (s.purchase_price || 0)) * s.quantity;
                                    totalProfit += profit;
                                    totalSales += s.selling_price * s.quantity;

                                    return `
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 11px;">${new Date(s.sale_date || s.created_at).toLocaleDateString('ru-RU')}</td>
                                            <td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 11px; font-weight: bold;">${s.product_name}</td>
                                            <td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 11px; text-align: center;">${s.size}</td>
                                            <td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 11px; text-align: center;">${s.quantity}</td>
                                            <td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 11px; text-align: right;">${formatPrice(s.purchase_price || 0)}</td>
                                            <td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 11px; text-align: right;">${formatPrice(s.selling_price)}</td>
                                            <td style="padding: 10px; border: 1px solid #e5e7eb; font-size: 11px; text-align: right; color: #DC2626; font-weight: bold;">+${formatPrice(profit)}</td>
                                        </tr>
                                    `;
                                }).join('');

                                // Add Summary Row
                                const summaryRow = `
                                    <tr style="background-color: #f9fafb; font-weight: bold;">
                                        <td colspan="5" style="padding: 12px; border: 1px solid #d1d5db; text-align: right; font-size: 12px;">ИТОГО:</td>
                                        <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right; font-size: 12px;">${formatPrice(totalSales)} ₸</td>
                                        <td style="padding: 12px; border: 1px solid #d1d5db; text-align: right; font-size: 12px; color: #DC2626;">${formatPrice(totalProfit)} ₸</td>
                                    </tr>
                                `;

                                tbody.innerHTML = rows + summaryRow;
                            }
                        }
                    }

                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                        * { 
                            color: #000000 !important; 
                            border-color: #d1d5db !important; 
                            opacity: 1 !important; 
                            visibility: visible !important;
                            box-sizing: border-box !important;
                        }
                        .no-print { display: none !important; }
                        .text-accent { color: #DC2626 !important; }
                        .bg-white { background-color: #ffffff !important; }
                        .SalesLogContainer { 
                            background-color: #ffffff !important;
                            width: 1200px !important; 
                            max-width: 1200px !important;
                            padding: 40px !important;
                            margin: 0 !important;
                            overflow: visible !important;
                        }
                        table { 
                            width: 100% !important; 
                            border-collapse: collapse !important; 
                            table-layout: auto !important;
                            border: 2px solid #000 !important;
                        }
                        th, td {
                            word-break: break-all !important;
                            border: 1px solid #d1d5db !important;
                        }
                    `;
                    clonedDoc.body.appendChild(style);
                }
            });

            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error('Canvas capture failed: dimensions are zero');
            }

            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            const pdfBlob = pdf.output('blob');
            const fileName = `dracarys_report_${new Date().toISOString().split('T')[0]}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'dracarys.kz — Отчёт о продажах',
                        text: `Отчёт о продажах от ${new Date().toLocaleDateString('ru-RU')}`
                    });
                } catch (sErr: any) {
                    if (sErr.name !== 'AbortError') {
                        pdf.save(fileName);
                        addToast('success', 'отчет сохранен');
                    }
                }
            } else {
                pdf.save(fileName);
                addToast('success', 'PDF успешно скачан');
            }

            if (wasCollapsed) setIsSalesHistoryCollapsed(true);
        } catch (error: any) {
            console.error('PDF generation error:', error);
            addToast('error', `Ошибка PDF: ${error.message || 'неизвестная ошибка'}`);
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            await productService.deleteProduct(productToDelete);
            addToast('success', 'Товар удален из склада');
            setIsProductDeleteModalOpen(false);
            setProductToDelete(null);
            loadData();
        } catch (error) {
            console.error('Error deleting product:', error);
            addToast('error', 'Ошибка при удалении товара');
        }
    };

    const confirmDeleteProduct = (productName: string) => {
        // Find product by name to get ID
        const trimmedName = productName.trim();
        const product = products.find(p => p.name.trim() === trimmedName);
        if (product) {
            setProductToDelete(product.id);
            setIsProductDeleteModalOpen(true);
        } else {
            addToast('error', 'Товар не найден для удаления');
        }
    };

    const handleSaveBarcodeAndStock = async () => {
        if (!barcodeModalAssignProduct || !barcodeModalInput) return;

        setIsSubmitting(true);
        try {
            // Check if barcode already exists
            const existing = await productService.getProductByBarcode(barcodeModalInput);
            if (existing && existing.id !== barcodeModalAssignProduct.id) {
                addToast('error', `Этот штрихкод уже занят товаром: ${existing.name}`);
                setIsSubmitting(false);
                return;
            }

            // 1. Assign barcode to existing product
            await productService.updateProduct(barcodeModalAssignProduct.id, {
                barcode: barcodeModalInput,
                is_visible: true
            });

            // 2. Add stock if specified
            const flatEntries: { color: string, size: string, qty: number }[] = [];
            Object.entries(stockAdditions).forEach(([color, sizes]) => {
                Object.entries(sizes).forEach(([size, qty]) => {
                    if (qty && parseInt(qty) > 0) {
                        flatEntries.push({ color, size, qty: parseInt(qty) });
                    }
                });
            });

            if (flatEntries.length > 0) {
                // Merge sizes and colors on the product
                const addedSizes = Array.from(new Set(flatEntries.map(e => e.size)));
                const addedColors = Array.from(new Set(flatEntries.map(e => e.color)));
                const mergedSizes = Array.from(new Set([...(barcodeModalAssignProduct.sizes || []), ...addedSizes]));
                const mergedColors = Array.from(new Set([...(barcodeModalAssignProduct.colors || []), ...addedColors]));

                await productService.updateProduct(barcodeModalAssignProduct.id, {
                    sizes: mergedSizes,
                    colors: mergedColors
                });

                await Promise.all(flatEntries.map(e =>
                    purchaseService.createListedPurchase({
                        name: barcodeModalAssignProduct.name,
                        size: e.size,
                        color: e.color,
                        quantity: e.qty,
                        purchase_price: barcodeModalAssignProduct.cost || 0,
                        source_app: 1,
                        category: barcodeModalAssignProduct.category,
                        order_date: new Date().toISOString().split('T')[0]
                    })
                ));
                addToast('success', 'Штрихкод присвоен и запас добавлен');
            } else {
                addToast('success', 'Штрихкод успешно присвоен товару');
            }

            handleCloseBarcodeModal();
            loadData();
        } catch (error) {
            console.error('Error assigning barcode:', error);
            addToast('error', 'Ошибка при сохранении');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateNewProductWithBarcode = async () => {
        if (!barcodeModalInput || !newProductForm.name || !newProductForm.category || !newProductForm.price) {
            addToast('error', 'Заполните все обязательные поля');
            return;
        }

        setIsSubmitting(true);
        try {
            // Flatten stock entries
            const flatStock: { color: string, size: string, qty: number }[] = [];
            Object.entries(newProductForm.stock_quantities).forEach(([color, sizes]) => {
                Object.entries(sizes).forEach(([size, qty]) => {
                    if (qty && parseInt(qty as any) > 0) {
                        flatStock.push({ color, size, qty: parseInt(qty as any) });
                    }
                });
            });

            const finalSizes = Array.from(new Set([...newProductForm.sizes, ...flatStock.map(e => e.size)]));
            const finalColors = Array.from(new Set([...newProductForm.colors, ...flatStock.map(e => e.color)]));

            const product = await productService.createProduct({
                name: newProductForm.name,
                category: newProductForm.category,
                price: parseInt(newProductForm.price),
                description: newProductForm.description,
                colors: finalColors,
                image_url: newProductForm.images.join(','),
                images: newProductForm.images,
                sizes: finalSizes,
                barcode: barcodeModalInput,
                is_visible: true,
                featured: false
            });

            // Add initial stock if provided
            if (flatStock.length > 0) {
                await Promise.all(flatStock.map(e =>
                    purchaseService.createListedPurchase({
                        name: product.name,
                        size: e.size,
                        color: e.color,
                        quantity: e.qty,
                        purchase_price: 0,
                        source_app: 1,
                        category: product.category,
                        order_date: new Date().toISOString().split('T')[0]
                    })
                ));
            }

            addToast('success', 'Товар с штрихкодом создан');
            handleCloseBarcodeModal();
            loadData();
        } catch (error: any) {
            console.error('Detailed error creating product:', error);
            const errorMessage = error.message || 'Ошибка сервера';
            addToast('error', `Ошибка при создании товара: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleToggleColorVisibility = async (productId: string, color: string) => {
        try {
            await productService.toggleColorVisibility(productId, color);
            addToast('success', 'Видимость цвета обновлена');
        } catch (error) {
            console.error('Error toggling color visibility:', error);
            addToast('error', 'Не удалось обновить видимость цвета');
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        const nameKey = product.name.trim();

        // Find all inventory entries for this product (all colors)
        const productEntries = Object.entries(inventory)
            .filter(([key]) => key.startsWith(`${nameKey}:::`))
            .map(([_, data]) => data);

        // Map to editForm.stockQuantities: Record<string, Record<string, string>>
        const stockQuantities: Record<string, Record<string, string>> = {};
        productEntries.forEach(entry => {
            stockQuantities[entry.color] = {};
            Object.entries(entry.sizes).forEach(([size, qty]) => {
                stockQuantities[entry.color][size] = qty.toString();
            });
        });

        setEditForm({
            name: product.name,
            description: product.description || '',
            category: product.category,
            price: product.price.toString(),
            barcode: product.barcode || '',
            colors: product.colors || (product.color ? [product.color] : []),
            images: product.images || (product.image_url ? product.image_url.split(',') : []),
            sizes: product.sizes || [],
            color_images: product.color_images || {},
            stockQuantities
        });
        setSelectedBarcodeColor(product.colors?.[0] || 'Без цвета');
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        setIsSubmitting(true);
        try {
            // 1. Update basic product info and sizes
            await productService.updateProduct(editingProduct.id, {
                name: editForm.name,
                description: editForm.description,
                category: editForm.category,
                price: parseInt(editForm.price),
                barcode: editForm.barcode,
                colors: editForm.colors,
                images: editForm.images,
                color_images: editForm.color_images,
                sizes: editForm.sizes
            });

            // 2. Handle stock quantity adjustments (per color and size)
            const oldNameKey = editingProduct.name.trim();
            const newNameKey = editForm.name.trim();
            const nameChanged = oldNameKey !== newNameKey;

            const adjustmentPromises = [];

            // Iterate over all actual inventory colors for this product
            const productEntries = Object.entries(inventory)
                .filter(([k]) => k.startsWith(`${oldNameKey}:::`));

            // Map of current stock: color -> size -> qty
            const currentStockMap: Record<string, Record<string, number>> = {};
            productEntries.forEach(([_, data]) => {
                currentStockMap[data.color] = data.sizes;
            });

            // All colors to consider: current colors + form colors
            const allColors = Array.from(new Set([...Object.keys(currentStockMap), ...editForm.colors]));

            for (const color of allColors) {
                const isColorActive = editForm.colors.includes(color);
                const currentSizes = currentStockMap[color] || {};
                const formSizes = editForm.stockQuantities[color] || {};

                // All sizes to consider for this color
                const allSizes = Array.from(new Set([...Object.keys(currentSizes), ...editForm.sizes]));

                for (const size of allSizes) {
                    const isSizeActive = editForm.sizes.includes(size) && isColorActive;
                    const targetQty = isSizeActive ? parseInt(formSizes[size] || '0') : 0;
                    const currentQty = currentSizes[size] || 0;

                    if (nameChanged) {
                        // 1. Zero out old name
                        if (currentQty !== 0) {
                            adjustmentPromises.push(purchaseService.createListedPurchase({
                                name: oldNameKey,
                                size,
                                color,
                                quantity: -currentQty,
                                purchase_price: editingProduct.cost || 0,
                                source_app: 1,
                                category: editingProduct.category,
                                order_date: new Date().toISOString().split('T')[0]
                            }));
                        }
                        // 2. Set new name with target quantity
                        if (targetQty !== 0) {
                            adjustmentPromises.push(purchaseService.createListedPurchase({
                                name: newNameKey,
                                size,
                                color,
                                quantity: targetQty,
                                purchase_price: editingProduct.cost || 0,
                                source_app: 1,
                                category: editForm.category,
                                order_date: new Date().toISOString().split('T')[0]
                            }));
                        }
                    } else {
                        // Normal adjustment for same name
                        const diff = targetQty - currentQty;
                        if (diff !== 0) {
                            adjustmentPromises.push(purchaseService.createListedPurchase({
                                name: newNameKey,
                                size,
                                color,
                                quantity: diff,
                                purchase_price: editingProduct.cost || 0,
                                source_app: 1,
                                category: editForm.category,
                                order_date: new Date().toISOString().split('T')[0]
                            }));
                        }
                    }
                }
            }

            if (adjustmentPromises.length > 0) {
                await Promise.all(adjustmentPromises);
            }

            addToast('success', 'Товар и остатки обновлены');
            setIsEditModalOpen(false);
            setEditingProduct(null);
            loadData();
        } catch (error) {
            console.error('Error updating product:', error);
            addToast('error', 'Ошибка при обновлении товара');
        } finally {
            setIsSubmitting(false);
        }
    };


    const calculateInventory = () => {
        const inventory: Record<string, {
            name: string;
            color: string;
            category: string;
            sizes: Record<string, number>;
            totalQty: number;
            unlistedPurchases: Purchase[];
        }> = {};

        // Helper to get or create inventory entry
        const getEntry = (name: string, color: string = 'Без цвета', category: string = 'Прочее') => {
            const n = name.trim();
            const c = color.trim() || 'Без цвета';
            const key = `${n}:::${c}`;
            if (!inventory[key]) {
                inventory[key] = {
                    name: n,
                    color: c,
                    category,
                    sizes: {},
                    totalQty: 0,
                    unlistedPurchases: []
                };
            }
            return inventory[key];
        };

        // 1. Initialize from products
        products.forEach(p => {
            const colors = p.colors && p.colors.length > 0 ? p.colors : [p.color || 'Без цвета'];
            colors.forEach(color => {
                const entry = getEntry(p.name, color, p.category);
                if (p.sizes) {
                    p.sizes.forEach(size => {
                        const s = size.trim();
                        if (entry.sizes[s] === undefined) entry.sizes[s] = 0;
                    });
                }
            });
        });

        // 2. Subtract sold items
        sales.forEach(s => {
            const entry = getEntry(s.product_name, s.color || 'Без цвета');
            const size = s.size.trim();
            if (entry.sizes[size] !== undefined) {
                entry.sizes[size] -= s.quantity;
            } else {
                entry.sizes[size] = -(s.quantity);
            }
            entry.totalQty -= s.quantity;
        });

        // 3. Process purchases
        purchases.filter(p => p.status !== 'archived').forEach(p => {
            const name = p.name.trim();
            const color = p.color || 'Без цвета';
            const size = p.size.trim();

            if (p.status === 'listed') {
                const entry = getEntry(name, color, p.category);
                entry.sizes[size] = (entry.sizes[size] || 0) + p.quantity;
                entry.totalQty += p.quantity;
            } else if (p.status === 'arrived' || p.status === 'pending') {
                const entry = getEntry(name, color, p.category);
                entry.unlistedPurchases.push(p);
            }
        });
        return inventory;
    };

    const calculateDaysInTransit = (orderDate?: string) => {
        if (!orderDate) return 0;
        const order = new Date(orderDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - order.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateStats = () => {
        const totalRevenue = sales.reduce((sum, s) => {
            const perUnit = s.quantity > 1 && s.selling_price % s.quantity === 0
                ? Math.round(s.selling_price / s.quantity)
                : s.selling_price;
            return sum + perUnit * s.quantity;
        }, 0);
        const totalPurchase = sales.reduce((sum, s) => sum + ((s.purchase_price || 0) * s.quantity), 0);
        const totalProfit = totalRevenue - totalPurchase;
        return { totalRevenue, totalProfit, count: sales.length };
    };

    const stats = calculateStats();
    const inventory = calculateInventory();

    // CRITICAL: Filter inventory for Warehouse view
    // 1. Must exist in Products list
    // 2. Must have totalQty > 0 (to hide pending purchases/out of stock)
    const warehouseInventory = Object.fromEntries(
        Object.entries(inventory).filter(([_, data]) => {
            const product = products.find(p => p.name.trim() === data.name.trim());
            return product && product.is_visible !== false;
        })
    );

    const groupedWarehouseInventory = useMemo(() => {
        const grouped: Record<string, {
            name: string;
            category: string;
            variants: Record<string, {
                color: string;
                sizes: Record<string, number>;
                totalQty: number;
                unlistedPurchases: Purchase[];
            }>;
            totalQty: number;
        }> = {};

        Object.entries(warehouseInventory).forEach(([_, data]) => {
            const name = data.name;
            if (!grouped[name]) {
                grouped[name] = {
                    name,
                    category: data.category,
                    variants: {},
                    totalQty: 0
                };
            }
            grouped[name].variants[data.color] = {
                color: data.color,
                sizes: data.sizes,
                totalQty: data.totalQty,
                unlistedPurchases: data.unlistedPurchases
            };
            grouped[name].totalQty += data.totalQty;
        });
        return grouped;
    }, [warehouseInventory]);



    const handleExportToExcel = async () => {
        if (sales.length === 0) {
            addToast('error', 'Нет данных для экспорта');
            return;
        }

        const data = sales.map(s => ({
            'Дата': new Date(s.sale_date || s.created_at).toLocaleDateString('ru-RU'),
            'Товар': s.product_name,
            'Размер': s.size,
            'Кол-во': s.quantity,
            'Цена закупки (шт)': s.purchase_price || 0,
            'Цена продажи (шт)': (s.quantity > 1 && s.selling_price % s.quantity === 0) ? Math.round(s.selling_price / s.quantity) : s.selling_price,
            'Сумма продажи': ((s.quantity > 1 && s.selling_price % s.quantity === 0) ? Math.round(s.selling_price / s.quantity) : s.selling_price) * s.quantity,
            'Чистая прибыль': (((s.quantity > 1 && s.selling_price % s.quantity === 0) ? Math.round(s.selling_price / s.quantity) : s.selling_price) - (s.purchase_price || 0)) * s.quantity
        }));

        const ws = XLSX.utils.json_to_sheet(data);

        // Add summary row
        const totalProfit = sales.reduce((sum, s) => {
            const perUnit = s.quantity > 1 && s.selling_price % s.quantity === 0
                ? Math.round(s.selling_price / s.quantity)
                : s.selling_price;
            return sum + ((perUnit - (s.purchase_price || 0)) * s.quantity);
        }, 0);
        const totalSales = sales.reduce((sum, s) => {
            const perUnit = s.quantity > 1 && s.selling_price % s.quantity === 0
                ? Math.round(s.selling_price / s.quantity)
                : s.selling_price;
            return sum + (perUnit * s.quantity);
        }, 0);

        XLSX.utils.sheet_add_aoa(ws, [
            [],
            ['ИТОГО', '', '', '', '', '', totalSales, totalProfit]
        ], { origin: -1 });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "История продаж");

        // Set column widths
        ws['!cols'] = [
            { wch: 12 }, { wch: 30 }, { wch: 10 }, { wch: 10 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
        ];

        // Save file
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const fileName = `dracarys_sales_${new Date().toISOString().split('T')[0]}.xlsx`;
        const file = new File([wbout], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'dracarys.kz — История продаж',
                    text: `История продаж от ${new Date().toLocaleDateString('ru-RU')}`
                });
            } catch (sErr: any) {
                if (sErr.name !== 'AbortError') {
                    XLSX.writeFile(wb, fileName);
                    addToast('success', 'Excel файл сохранен');
                }
            }
        } else {
            XLSX.writeFile(wb, fileName);
            addToast('success', 'Excel файл скачан');
        }
    };

    if (isLoading) return <div className="py-20 text-center text-gray">Загрузка данных...</div>;

    const selectedProduct = products.find(p => p.id === newSale.product_id);

    return (
        <>
            <style>
                {`
                    @media print {
                        nav, .fixed, .sticky, header, .no-print, button, .Sidebar, .order-first, .sidebar-assistant {
                            display: none !important;
                        }
                        body, .min-h-screen, .container, main {
                            background: white !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            width: 100% !important;
                        }
                        .print-only {
                            display: block !important;
                        }
                        .SalesLogContainer {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100% !important;
                            border: none !important;
                            box-shadow: none !important;
                        }
                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                        }
                        th, td {
                            border: 1px solid #eee !important;
                            padding: 8px !important;
                        }
                        .text-accent {
                            color: black !important;
                        }
                    }
                    .print-only {
                        display: none;
                    }
                `}
            </style>
            <div className="space-y-12 animate-fade-in">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-8 rounded-apple-xl border-white/50">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-dark text-white rounded-apple flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs uppercase tracking-widest font-black text-gray">Оборот</h4>
                        </div>
                        <p className="text-3xl font-bold text-dark">{formatPrice(stats.totalRevenue)} ₸</p>
                    </div>
                    <div className="glass p-8 rounded-apple-xl border-white/50">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-accent text-white rounded-apple flex items-center justify-center">
                                <span className="text-xl font-black">₸</span>
                            </div>
                            <h4 className="text-xs uppercase tracking-widest font-black text-gray">Прибыль</h4>
                        </div>
                        <p className="text-3xl font-bold text-accent">{formatPrice(stats.totalProfit)} ₸</p>
                    </div>
                    <div className="glass p-8 rounded-apple-xl border-white/50">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-light text-dark rounded-apple flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs uppercase tracking-widest font-black text-gray">Продаж</h4>
                        </div>
                        <p className="text-3xl font-bold text-dark">{stats.count}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-dark">
                    {/* Input Form */}
                    <div className="lg:col-span-12 space-y-8">
                        <div className="bg-white p-5 md:p-10 rounded-apple-xl shadow-apple-lg border border-light">
                            {/* Toggle Switches */}
                            <div className="flex bg-light p-1 rounded-apple mb-8 w-fit mx-auto md:mx-0 flex-wrap justify-center md:justify-start">
                                <button
                                    onClick={() => setInputMode('sale')}
                                    className={`px-6 py-2.5 rounded-apple text-xs font-black uppercase tracking-widest transition-all ${inputMode === 'sale' ? 'bg-white text-dark shadow-soft' : 'text-gray hover:text-dark'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        Фиксация продажи
                                    </div>
                                </button>
                                <button
                                    onClick={() => setInputMode('purchase')}
                                    className={`px-6 py-2.5 rounded-apple text-xs font-black uppercase tracking-widest transition-all ${inputMode === 'purchase' ? 'bg-white text-dark shadow-soft' : 'text-gray hover:text-dark'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Новая закупка
                                    </div>
                                </button>
                                <button
                                    onClick={() => setInputMode('warehouse')}
                                    className={`px-6 py-2.5 rounded-apple text-xs font-black uppercase tracking-widest transition-all ${inputMode === 'warehouse' ? 'bg-white text-dark shadow-soft' : 'text-gray hover:text-dark'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4" />
                                        Склад
                                    </div>
                                </button>

                            </div>

                            {inputMode === 'sale' ? (
                                <>
                                    <h3 className="text-xl font-bold text-dark mb-8 flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-accent" />
                                        Зафиксировать продажу
                                    </h3>
                                    <form onSubmit={handleAddSale} noValidate className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Штрихкод товара</label>
                                                <input
                                                    type="text"
                                                    value={newSale.barcode}
                                                    onChange={(e) => handleBarcodeSearch(e.target.value)}
                                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-[16px] md:text-sm outline-none"
                                                    placeholder="Отсканируйте или введите штрихкод"
                                                />
                                                {barcodeLoading && (
                                                    <p className="text-xs text-gray mt-2 flex items-center gap-2">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        Поиск товара...
                                                    </p>
                                                )}
                                                {barcodeError && (
                                                    <p className="text-xs text-danger mt-2 font-bold">{barcodeError}</p>
                                                )}
                                            </div>
                                            {newSale.product_name && (
                                                <div className="animate-scale-in">
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Название товара</label>
                                                    <input
                                                        type="text"
                                                        value={newSale.product_name}
                                                        readOnly
                                                        className="w-full px-4 py-3 bg-light/70 border-2 border-transparent rounded-apple text-dark transition-all font-bold text-sm outline-none cursor-not-allowed"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {newSale.product_id && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in">
                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Цвет</label>
                                                    <select
                                                        value={newSale.color}
                                                        onChange={(e) => setNewSale({ ...newSale, color: e.target.value, size: '' })}
                                                        className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-[16px] md:text-sm outline-none"
                                                    >
                                                        <option value="">Выберите цвет</option>
                                                        {selectedProduct?.colors?.map(c => <option key={c} value={c}>{c}</option>) ||
                                                            (selectedProduct?.color && <option value={selectedProduct.color}>{selectedProduct.color}</option>)}
                                                    </select>
                                                </div>
                                                {newSale.color && (
                                                    <div className="animate-scale-in">
                                                        <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Размер</label>
                                                        <select
                                                            value={newSale.size}
                                                            onChange={(e) => setNewSale({ ...newSale, size: e.target.value })}
                                                            className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-[16px] md:text-sm outline-none"
                                                        >
                                                            <option value="">Размер</option>
                                                            {selectedProduct?.sizes?.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {newSale.size && (
                                            <div className="animate-scale-in">
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Кол-во</label>
                                                <input
                                                    type="number"
                                                    value={newSale.quantity}
                                                    onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-[16px] md:text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                        )}

                                        {newSale.product_id && newSale.size && (
                                            <div className="p-3 bg-gradient-to-br from-light/30 to-white rounded-apple-lg border border-light flex items-center justify-between shadow-soft animate-scale-in">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-1 bg-success rounded-full animate-ping" />
                                                    <p className="text-[9px] uppercase font-black text-gray tracking-[0.1em]">Доступно на складе</p>
                                                </div>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-xl font-black text-dark">
                                                        {(() => {
                                                            const p = products.find(prod => prod.id === newSale.product_id);
                                                            const key = p ? `${p.name.trim()}:::${newSale.color || 'Без цвета'}` : '';
                                                            return inventory[key]?.sizes[newSale.size] || 0;
                                                        })()}
                                                    </span>
                                                    <span className="text-[9px] font-black text-gray uppercase">шт</span>
                                                </div>
                                            </div>
                                        )}
                                        {newSale.quantity && Number(newSale.quantity) > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in">
                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Цена за 1 шт (₸)</label>
                                                    <input
                                                        type="number"
                                                        value={newSale.selling_price}
                                                        readOnly
                                                        className="w-full px-4 py-3 bg-light/70 border-2 border-transparent rounded-apple text-gray transition-all font-bold text-sm outline-none cursor-not-allowed"
                                                    />
                                                </div>
                                                <div className="relative group overflow-hidden rounded-apple-xl">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-95 group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
                                                    <div className="relative p-4 flex flex-col justify-between h-full min-h-[85px]">
                                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">Итого к оплате</label>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-2xl font-black text-white tracking-tighter">
                                                                {formatPrice(Number(newSale.selling_price) * (Number(newSale.quantity) || 0))}
                                                            </span>
                                                            <span className="text-xs font-bold text-white/60">₸</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Дата продажи</label>
                                                    <input
                                                        type="date"
                                                        value={newSale.sale_date}
                                                        onChange={(e) => setNewSale({ ...newSale, sale_date: e.target.value })}
                                                        className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-[16px] md:text-sm outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <button type="submit" className="w-full h-14 bg-dark text-white rounded-apple font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-apple-lg border border-white/10">
                                            <Check className="w-5 h-5" />
                                            Зафиксировать продажу
                                        </button>
                                    </form>
                                </>
                            ) : inputMode === 'purchase' ? (
                                <>
                                    <h3 className="text-xl font-bold text-dark mb-8 flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-accent" />
                                        Добавить закупку
                                    </h3>


                                    <form onSubmit={handleAddPurchase} noValidate className="space-y-6 overflow-x-hidden p-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Название товара</label>
                                                <input
                                                    type="text"
                                                    value={newPurchase.name}
                                                    onChange={(e) => setNewPurchase({ ...newPurchase, name: e.target.value })}
                                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-[16px] md:text-sm outline-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Цена закупки шт (₸)</label>
                                                    <input
                                                        type="number"
                                                        value={newPurchase.purchase_price}
                                                        onChange={(e) => setNewPurchase({ ...newPurchase, purchase_price: e.target.value })}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                        className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-[16px] md:text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Цена закупки шт (¥)</label>
                                                    <input
                                                        type="number"
                                                        value={newPurchase.yuan_price}
                                                        onChange={(e) => setNewPurchase({ ...newPurchase, yuan_price: e.target.value })}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                        className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-[16px] md:text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex flex-col gap-6">
                                                    {/* Clothes Sizes */}
                                                    <div className="space-y-3">
                                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray/60">Одежда / Стандарт</label>
                                                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 bg-light/20 p-3 rounded-apple-xl border border-light/50">
                                                            {['стандарт', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                                                <div key={size} className="flex flex-col gap-1">
                                                                    <label className="text-[9px] font-black uppercase text-gray/50 text-center">{size}</label>
                                                                    <input
                                                                        type="number"
                                                                        value={newPurchase.stock_quantities[newPurchase.color || 'Без цвета']?.[size] || ''}
                                                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                                        onChange={(e) => setNewPurchase(prev => {
                                                                            const colorKey = prev.color || 'Без цвета';
                                                                            return {
                                                                                ...prev,
                                                                                stock_quantities: {
                                                                                    ...prev.stock_quantities,
                                                                                    [colorKey]: {
                                                                                        ...(prev.stock_quantities[colorKey] || {}),
                                                                                        [size]: e.target.value
                                                                                    }
                                                                                }
                                                                            };
                                                                        })}
                                                                        className={`w-full px-2 py-2 text-center border-2 rounded-apple text-dark font-bold text-[16px] md:text-sm outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${newPurchase.stock_quantities[newPurchase.color || 'Без цвета']?.[size] ? 'bg-white border-dark shadow-sm' : 'bg-white/40 border-transparent focus:bg-white focus:border-dark/30'
                                                                            }`}
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Shoe Sizes */}
                                                    <div className="space-y-3">
                                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray/60">Обувь</label>
                                                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 bg-light/20 p-3 rounded-apple-xl border border-light/50">
                                                            {['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].map(size => (
                                                                <div key={size} className="flex flex-col gap-1">
                                                                    <label className="text-[9px] font-black uppercase text-gray/50 text-center">{size}</label>
                                                                    <input
                                                                        type="number"
                                                                        value={newPurchase.stock_quantities[newPurchase.color || 'Без цвета']?.[size] || ''}
                                                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                                        onChange={(e) => setNewPurchase(prev => {
                                                                            const colorKey = prev.color || 'Без цвета';
                                                                            return {
                                                                                ...prev,
                                                                                stock_quantities: {
                                                                                    ...prev.stock_quantities,
                                                                                    [colorKey]: {
                                                                                        ...(prev.stock_quantities[colorKey] || {}),
                                                                                        [size]: e.target.value
                                                                                    }
                                                                                }
                                                                            };
                                                                        })}
                                                                        className={`w-full px-1 py-2 text-center border-2 rounded-apple text-dark font-bold text-[16px] md:text-sm outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${newPurchase.stock_quantities[newPurchase.color || 'Без цвета']?.[size] ? 'bg-white border-dark shadow-sm' : 'bg-white/40 border-transparent focus:bg-white focus:border-dark/30'
                                                                            }`}
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Приложение</label>
                                                <select
                                                    value={newPurchase.source_app}
                                                    onChange={(e) => setNewPurchase({ ...newPurchase, source_app: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                                >
                                                    <option value={1}>Приложение 1</option>
                                                    <option value={2}>Приложение 2</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Карго</label>
                                                <select
                                                    value={newPurchase.cargo || 'GO-express'}
                                                    onChange={(e) => setNewPurchase({ ...newPurchase, cargo: e.target.value })}
                                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                                >
                                                    <option value="GO-express">GO-express</option>
                                                    <option value="SHAO-cargo">SHAO-cargo</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Категория</label>
                                                <select
                                                    value={newPurchase.category}
                                                    onChange={(e) => setNewPurchase({ ...newPurchase, category: e.target.value })}
                                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                                    required
                                                >
                                                    <option value="">Выберите категорию</option>
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Дата заказа</label>
                                                <input
                                                    type="date"
                                                    value={newPurchase.order_date}
                                                    onChange={(e) => setNewPurchase({ ...newPurchase, order_date: e.target.value })}
                                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Для кого?</label>
                                                    <select
                                                        value={newPurchase.for_whom}
                                                        onChange={(e) => setNewPurchase({ ...newPurchase, for_whom: e.target.value as 'business' | 'myself' | 'home' })}
                                                        className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                                    >
                                                        <option value="business">Для бизнеса</option>
                                                        <option value="myself">Для себя</option>
                                                        <option value="home">Для дома</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Трек-код</label>
                                                    <input
                                                        type="text"
                                                        value={newPurchase.track_code}
                                                        onChange={(e) => setNewPurchase({ ...newPurchase, track_code: e.target.value })}
                                                        placeholder="Введите трек-код"
                                                        className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Ссылка</label>
                                                <input
                                                    type="url"
                                                    value={newPurchase.item_url}
                                                    onChange={(e) => setNewPurchase({ ...newPurchase, item_url: e.target.value })}
                                                    placeholder="https://..."
                                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full h-14 bg-accent text-white rounded-apple font-bold uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-apple-lg border border-white/10">
                                            <Plus className="w-5 h-5" />
                                            Добавить закупку
                                        </button>
                                    </form>
                                </>
                            ) : inputMode === 'warehouse' ? (
                                <div className="space-y-8 pt-4 md:pt-0">
                                    {/* Warehouse Stats Summary */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="glass p-6 rounded-apple-xl border-white/50 flex items-center justify-between shadow-apple-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-dark text-white rounded-apple flex items-center justify-center">
                                                    <LayoutDashboard className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] uppercase tracking-widest font-black text-gray leading-tight">Позиций</h4>
                                                    <p className="text-2xl font-bold text-dark">
                                                        {Object.keys(warehouseInventory).length}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="glass p-6 rounded-apple-xl border-white/50 flex items-center justify-between shadow-apple-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-accent text-white rounded-apple flex items-center justify-center">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] uppercase tracking-widest font-black text-gray leading-tight">Единиц</h4>
                                                    <p className="text-2xl font-bold text-accent">
                                                        {Object.values(warehouseInventory).reduce((sum, data) => sum + data.totalQty, 0)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleOpenBarcodeModal()}
                                                    className="w-10 h-10 bg-dark text-white rounded-apple flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-apple"
                                                    title="Добавить по штрихкоду"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray group-focus-within:text-accent transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Поиск по складу..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                        />
                                    </div>

                                    {/* Inventory List */}
                                    {Object.keys(groupedWarehouseInventory).length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                            {Object.entries(groupedWarehouseInventory)
                                                .filter(([name, data]) => {
                                                    const searchLower = searchQuery.toLowerCase();
                                                    const product = products.find(p => p.name.trim() === name.trim());

                                                    // CRITICAL: If product doesn't exist in Products tab, hide it from Warehouse
                                                    if (!product || product.is_visible === false) return false;

                                                    const barcodeMatch = product.barcode?.toLowerCase().includes(searchLower) || false;
                                                    const colorMatch = Object.keys(data.variants).some(c => c.toLowerCase().includes(searchLower));

                                                    return data.name.toLowerCase().includes(searchLower) ||
                                                        colorMatch ||
                                                        data.category.toLowerCase().includes(searchLower) ||
                                                        barcodeMatch;
                                                })
                                                .sort((a, b) => b[1].totalQty - a[1].totalQty)
                                                .map(([name, data]) => {
                                                    const product = products.find(p => p.name.trim() === name.trim());
                                                    return (
                                                        <div key={name} className="animate-scale-in">
                                                            <div className="bg-white rounded-apple-2xl overflow-hidden border border-light shadow-apple-sm hover:shadow-apple-lg transition-all duration-500 group flex flex-col h-full">
                                                                <div className="p-4 md:p-6 flex-1">
                                                                    <div className="flex justify-between items-start mb-6">
                                                                        <div className="flex items-center gap-3 md:gap-4">
                                                                            {product?.image_url && (
                                                                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-apple-lg overflow-hidden border border-light flex-shrink-0">
                                                                                    <img src={product.image_url.split(',')[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <span className="text-[8px] md:text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-0.5">
                                                                                    {data.category}
                                                                                </span>
                                                                                <h4 className="text-sm md:text-base font-bold text-dark leading-tight group-hover:text-accent transition-colors line-clamp-2">{data.name}</h4>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right flex-shrink-0">
                                                                            <p className="text-[8px] md:text-[9px] uppercase font-black text-gray tracking-widest mb-0.5 whitespace-nowrap">Всего</p>
                                                                            <p className="text-lg md:text-xl font-black text-dark">{data.totalQty}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-6">
                                                                        {Object.entries(data.variants).map(([color, variant]) => (
                                                                            <div key={color} className={`space-y-2 pb-4 border-b border-light/50 last:border-0 last:pb-0 transition-opacity duration-300 ${product?.hidden_colors?.includes(color) ? 'opacity-40' : 'opacity-100'}`}>
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: getColorValue(color), border: isLightColor(getColorValue(color)) ? '1px solid #E5E7EB' : 'none' }}></span>
                                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-dark">{color}</span>
                                                                                    <button
                                                                                        onClick={() => product && handleToggleColorVisibility(product.id, color)}
                                                                                        className="p-1 hover:text-accent transition-colors"
                                                                                        title={product?.hidden_colors?.includes(color) ? 'Показать покупателям' : 'Скрыть от покупателей'}
                                                                                    >
                                                                                        {product?.hidden_colors?.includes(color) ? <EyeOff className="w-3 h-3 text-gray" /> : <Eye className="w-3 h-3 text-accent" />}
                                                                                    </button>
                                                                                    <span className="text-[9px] font-bold text-gray ml-auto">({variant.totalQty} шт)</span>
                                                                                </div>
                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                    {Object.entries(variant.sizes)
                                                                                        .sort(([a], [b]) => {
                                                                                            const sizeOrder = ['стандарт', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
                                                                                            const aIndex = sizeOrder.indexOf(a);
                                                                                            const bIndex = sizeOrder.indexOf(b);
                                                                                            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                                                                                            return a.localeCompare(b);
                                                                                        })
                                                                                        .map(([size, qty]) => (
                                                                                            <div key={size} className={`flex items-center gap-2 px-2 py-1 rounded-apple border transition-all ${qty > 0 ? 'bg-light/30 border-light/50 shadow-sm' : qty === 0 ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-red-50 border-red-100 text-red-500 underline decoration-dotted'}`}>
                                                                                                <span className={`text-[8px] font-black uppercase tracking-widest ${qty > 0 ? 'text-gray' : 'text-red-400'}`}>{size}</span>
                                                                                                <span className="text-[10px] font-bold">{qty}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="px-4 md:px-6 py-3 md:py-4 bg-light/30 border-t border-light flex items-center justify-between mt-auto">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-[8px] md:text-[10px] font-bold text-gray uppercase tracking-widest whitespace-nowrap">
                                                                            {product?.barcode ? `BC: ${product.barcode}` : 'Без BC'}
                                                                        </p>
                                                                        {product && (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (product) {
                                                                                            if (product.barcode) {
                                                                                                setBarcodeModalInput(product.barcode);
                                                                                                setBarcodeModalProduct(product);
                                                                                                setBarcodeModalStep('found');
                                                                                                setSelectedBarcodeColor(product.colors?.[0] || product.color || 'Без цвета');
                                                                                                setBarcodeModalOpen(true);
                                                                                            } else {
                                                                                                setBarcodeModalAssignProduct(product);
                                                                                                setBarcodeModalInput('');
                                                                                                setBarcodeModalStep('assign');
                                                                                                setSelectedBarcodeColor(product.colors?.[0] || product.color || 'Без цвета');
                                                                                                setBarcodeModalOpen(true);
                                                                                            }
                                                                                        }
                                                                                    }}
                                                                                    className="p-1.5 hover:text-accent transition-colors"
                                                                                    title="Штрихкод / Ценник"
                                                                                >
                                                                                    <Printer className="w-3.5 h-3.5" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleEditProduct(product)}
                                                                                    className="p-1.5 hover:text-accent transition-colors"
                                                                                    title="Редактировать товар"
                                                                                >
                                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                if (product) {
                                                                                    if (product.barcode) {
                                                                                        setBarcodeModalInput(product.barcode);
                                                                                        setBarcodeModalProduct(product);
                                                                                        setBarcodeModalStep('found');
                                                                                        setSelectedBarcodeColor(product.colors?.[0] || product.color || 'Без цвета');
                                                                                        setBarcodeModalOpen(true);
                                                                                    } else {
                                                                                        setBarcodeModalAssignProduct(product);
                                                                                        setBarcodeModalInput('');
                                                                                        setBarcodeModalStep('assign');
                                                                                        setSelectedBarcodeColor(product.colors?.[0] || product.color || 'Без цвета');
                                                                                        setBarcodeModalOpen(true);
                                                                                    }
                                                                                } else {
                                                                                    handleOpenBarcodeModal();
                                                                                }
                                                                            }}
                                                                            className="w-10 h-10 md:w-8 md:h-8 bg-white rounded-full shadow-apple-sm flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all transform hover:rotate-90 active:scale-95"
                                                                        >
                                                                            <Plus className="w-5 h-5 md:w-4 md:h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => confirmDeleteProduct(name)}
                                                                            className="w-10 h-10 md:w-8 md:h-8 bg-white rounded-full shadow-apple-sm flex items-center justify-center text-danger hover:bg-danger hover:text-white transition-all transform hover:rotate-90 active:scale-95"
                                                                            title="Удалить товар"
                                                                        >
                                                                            <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-24 glass rounded-apple-2xl border-white/50">
                                            <Package className="w-16 h-16 text-gray/20 mx-auto mb-4" />
                                            <p className="text-gray font-bold">На складе пока ничего нет</p>
                                            <p className="text-sm text-gray/60 mt-2">Добавьте закупки или отсканируйте товар</p>
                                        </div>
                                    )}
                                </div>
                            ) : inputMode === 'archive' ? (
                                <div className="space-y-6 pt-4 md:pt-0">
                                    {/* Archive Search Bar */}
                                    <div className="relative group">
                                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray transition-colors group-focus-within:text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                                        <input
                                            type="text"
                                            placeholder="Поиск по архиву..."
                                            value={archiveSearch}
                                            onChange={(e) => setArchiveSearch(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark placeholder-gray/50 focus:outline-none focus:bg-white focus:border-dark/10 transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        {purchases.filter(p => p.status === 'arrived' && (!archiveSearch || p.name.toLowerCase().includes(archiveSearch.toLowerCase()))).length > 0 ? (
                                            <>
                                                {/* Desktop Table View */}
                                                <div className="hidden md:block overflow-x-auto border border-light rounded-apple-2xl">
                                                    <table className="w-full text-left min-w-[800px]">
                                                        <thead className="bg-light/50">
                                                            <tr>
                                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray">Прибывший товар</th>
                                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray">Инфо</th>
                                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray text-center">Кол-во</th>
                                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray text-right">Финансы</th>
                                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray text-right">Даты</th>
                                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray text-center">Транзит</th>
                                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray text-right">Источник</th>
                                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray text-right">Карго</th>
                                                                <th className="px-6 py-4"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-light">
                                                            {purchases.filter(p => p.status === 'arrived' && (!archiveSearch || p.name.toLowerCase().includes(archiveSearch.toLowerCase()))).map(p => {
                                                                const orderDate = p.order_date ? new Date(p.order_date) : null;
                                                                const arrivalDate = p.arrival_date ? new Date(p.arrival_date) : (p.status === 'arrived' ? new Date(p.created_at) : null);
                                                                const transitDays = orderDate && arrivalDate
                                                                    ? Math.max(0, Math.round((arrivalDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)))
                                                                    : null;

                                                                return (
                                                                    <tr key={p.id} className="hover:bg-light/20 transition-colors group">
                                                                        <td className="px-6 py-6">
                                                                            <p className="font-bold text-dark">{p.name}</p>
                                                                        </td>
                                                                        <td className="px-6 py-6">
                                                                            <div className="flex flex-col gap-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="px-2 py-0.5 bg-light rounded text-[9px] font-black text-gray uppercase w-fit">
                                                                                        {p.size}
                                                                                    </span>
                                                                                    {p.item_url && (
                                                                                        <a
                                                                                            href={p.item_url}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="px-1.5 py-0.5 bg-accent/10 rounded text-[9px] font-black text-accent uppercase hover:bg-accent hover:text-white transition-all"
                                                                                        >
                                                                                            click
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                                <span className="text-[10px] text-gray font-black uppercase tracking-tighter">
                                                                                    {p.category}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-6 text-center">
                                                                            <span className="text-sm text-dark font-black">
                                                                                {p.quantity} шт
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-6 text-right">
                                                                            <div className="space-y-0.5">
                                                                                <p className="text-[10px] text-gray font-bold whitespace-nowrap">Купил: {formatPrice(p.purchase_price)} ₸ {p.yuan_price ? ` (¥${p.yuan_price})` : ''}</p>
                                                                                <p className="text-[10px] text-gray font-bold whitespace-nowrap">Доставка: {formatPrice(p.delivery_cost || 0)} ₸</p>
                                                                                <p className="text-sm text-accent font-black whitespace-nowrap">{formatPrice(p.total_cost || p.purchase_price)} ₸</p>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-6 text-right">
                                                                            <div className="space-y-2">
                                                                                <div className="flex items-center justify-end gap-2">
                                                                                    <span className="text-[10px] font-bold text-dark">{orderDate?.toLocaleDateString('ru-RU') || '—'}</span>
                                                                                    <Calendar className="w-3 h-3 text-gray" />
                                                                                </div>
                                                                                <div className="flex items-center justify-end gap-2">
                                                                                    <span className="text-[10px] font-bold text-accent">{arrivalDate?.toLocaleDateString('ru-RU') || '—'}</span>
                                                                                    <Check className="w-3 h-3 text-accent" />
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-6 text-center">
                                                                            <div className="inline-flex flex-col items-center bg-accent/5 px-3 py-1.5 rounded-apple border border-accent/10">
                                                                                <span className="text-lg font-black text-accent leading-none">{transitDays ?? '—'}</span>
                                                                                <span className="text-[8px] font-black text-accent/60 uppercase tracking-tighter mt-0.5">дней</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-6 text-right">
                                                                            <div className="flex flex-col items-end gap-1">
                                                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${p.source_app === 1 ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                                                                    }`}>
                                                                                    Прил {p.source_app}
                                                                                </span>
                                                                                {p.for_whom && (
                                                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${p.for_whom === 'business' ? 'bg-emerald-50 text-emerald-600' :
                                                                                        p.for_whom === 'myself' ? 'bg-indigo-50 text-indigo-600' :
                                                                                            'bg-orange-50 text-orange-600'
                                                                                        }`}>
                                                                                        {p.for_whom === 'business' ? 'Для бизнеса' : p.for_whom === 'myself' ? 'Для себя' : 'Для дома'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-6 text-right">
                                                                            <div className="flex flex-col items-end gap-1">
                                                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                                                                                    {p.cargo || '—'}
                                                                                </span>
                                                                                {p.track_code && (
                                                                                    <span className="text-[9px] text-gray font-bold font-mono bg-light px-1.5 py-0.5 rounded">
                                                                                        {p.track_code}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-6 text-right">
                                                                            <button
                                                                                onClick={() => confirmDeletePurchase(p)}
                                                                                className="p-2 text-gray hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                                                                                title="Удалить из архива"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Mobile Card View */}
                                                <div className="md:hidden space-y-4">
                                                    {purchases.filter(p => p.status === 'arrived' && (!archiveSearch || p.name.toLowerCase().includes(archiveSearch.toLowerCase()))).map(p => {
                                                        const orderDate = p.order_date ? new Date(p.order_date) : null;
                                                        const arrivalDate = p.arrival_date ? new Date(p.arrival_date) : (p.status === 'arrived' ? new Date(p.created_at) : null);
                                                        const transitDays = orderDate && arrivalDate
                                                            ? Math.max(0, Math.round((arrivalDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)))
                                                            : null;

                                                        return (
                                                            <div key={p.id} className="bg-white rounded-apple-2xl p-6 border border-light shadow-apple-sm space-y-4">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] block mb-1">
                                                                            {p.category}
                                                                        </span>
                                                                        <h4 className="text-lg font-bold text-dark leading-tight">{p.name}</h4>
                                                                        <div className="mt-2 flex items-center gap-2">
                                                                            <span className="px-2 py-0.5 bg-light rounded text-[10px] font-black text-gray uppercase">
                                                                                Размер: {p.size}
                                                                            </span>
                                                                            <span className="px-2 py-0.5 bg-light rounded text-[10px] font-black text-gray uppercase">
                                                                                {p.quantity} шт
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => confirmDeletePurchase(p)}
                                                                        className="p-2 text-gray hover:text-danger active:text-danger transition-colors"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-light/50">
                                                                    <div className="space-y-2">
                                                                        <p className="text-[10px] font-black text-gray uppercase tracking-widest">Финансы</p>
                                                                        <div className="space-y-0.5">
                                                                            <p className="text-xs text-dark font-bold">Куп: {formatPrice(p.purchase_price)} ₸ {p.yuan_price ? ` (¥${p.yuan_price})` : ''}</p>
                                                                            <p className="text-xs text-dark font-bold">Дост: {formatPrice(p.delivery_cost || 0)} ₸</p>
                                                                            <p className="text-sm text-accent font-black mt-1">Итого: {formatPrice(p.total_cost || p.purchase_price)} ₸</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2 text-right">
                                                                        <p className="text-[10px] font-black text-gray uppercase tracking-widest">Тайминг</p>
                                                                        <div className="space-y-1">
                                                                            <p className="text-[10px] font-bold text-dark">Заказ: {orderDate?.toLocaleDateString('ru-RU') || '—'}</p>
                                                                            <p className="text-[10px] font-bold text-accent">Прибыл: {arrivalDate?.toLocaleDateString('ru-RU') || '—'}</p>
                                                                            <div className="inline-flex items-center gap-1.5 bg-accent/5 px-2 py-0.5 rounded-apple text-accent mt-1">
                                                                                <Clock className="w-3 h-3" />
                                                                                <span className="text-[10px] font-black">{transitDays ?? '—'} дней</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="pt-3 border-t border-light/50 flex flex-col gap-3">
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.source_app === 1 ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                                                                }`}>
                                                                                Приложение {p.source_app}
                                                                            </span>
                                                                            {p.for_whom && (
                                                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.for_whom === 'business' ? 'bg-emerald-50 text-emerald-600' :
                                                                                    p.for_whom === 'myself' ? 'bg-indigo-50 text-indigo-600' :
                                                                                        'bg-orange-50 text-orange-600'
                                                                                    }`}>
                                                                                    {p.for_whom === 'business' ? 'Бизнес' : p.for_whom === 'myself' ? 'Себе' : 'Дом'}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {p.item_url && (
                                                                            <a
                                                                                href={p.item_url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="px-3 py-1 bg-accent/10 rounded-full text-[10px] font-black text-accent uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
                                                                            >
                                                                                click
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                                                            {p.cargo || '—'}
                                                                        </span>
                                                                        {p.track_code && (
                                                                            <span className="px-3 py-1 bg-light text-dark border border-gray/10 rounded-full text-[10px] font-mono font-bold">
                                                                                {p.track_code}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-24 glass rounded-apple-2xl border-white/50">
                                                <Package className="w-16 h-16 text-gray/20 mx-auto mb-4" />
                                                <p className="text-gray font-bold">Архив пуст</p>
                                                <p className="text-sm text-gray/60 mt-2">Здесь будут прибывшие товары, ожидающие выставления на склад</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}

                            {/* Pending & Arrived Purchases */}
                            {purchases.filter(p => p.status === 'pending').length > 0 && (
                                <div className="bg-white rounded-apple-xl overflow-hidden border border-light shadow-apple animate-slide-up mt-8">
                                    <div
                                        className="p-6 border-b border-light flex justify-between items-center cursor-pointer hover:bg-light/30 transition-colors"
                                        onClick={() => setIsPendingCollapsed(!isPendingCollapsed)}
                                    >
                                        <h3 className="font-bold text-dark flex items-center gap-2">
                                            <Package className="w-5 h-5 text-gray" />
                                            Закупки в работе ({purchases.filter(p => p.status === 'pending').length})
                                        </h3>
                                        <div className="p-2 text-gray/40 hover:text-accent transition-colors">
                                            {isPendingCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                                        </div>
                                    </div>
                                    {!isPendingCollapsed && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-light/50">
                                                    <tr>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray">Товар</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray">Статус</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray text-right">Цена</th>
                                                        <th className="px-6 py-4"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-light">
                                                    {purchases.filter(p => p.status === 'pending').map(purchase => (
                                                        <tr key={purchase.id} className="hover:bg-light/30 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-sm text-dark">{purchase.name}</p>
                                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                    <span className="px-1.5 py-0.5 bg-light rounded text-[9px] font-black text-gray uppercase">{purchase.size}</span>
                                                                    <span className="text-[9px] text-gray-light uppercase font-bold">{purchase.category}</span>
                                                                    {purchase.for_whom && (
                                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${purchase.for_whom === 'business' ? 'bg-emerald-50 text-emerald-600' :
                                                                            purchase.for_whom === 'myself' ? 'bg-indigo-50 text-indigo-600' :
                                                                                'bg-orange-50 text-orange-600'
                                                                            }`}>
                                                                            {purchase.for_whom === 'business' ? 'Бизнес' : purchase.for_whom === 'myself' ? 'Себе' : 'Дом'}
                                                                        </span>
                                                                    )}
                                                                    {purchase.item_url && (
                                                                        <a
                                                                            href={purchase.item_url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="px-1.5 py-0.5 bg-accent/10 rounded text-[9px] font-black text-accent uppercase hover:bg-accent hover:text-white transition-all"
                                                                        >
                                                                            click
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${purchase.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                        {purchase.status === 'pending' ? 'В пути' : 'Не выставлен'}
                                                                    </span>
                                                                    {purchase.status === 'pending' && purchase.order_date && (
                                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-black uppercase">
                                                                            {calculateDaysInTransit(purchase.order_date)} дн
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex flex-col items-end">
                                                                    <p className="font-bold text-sm text-dark">
                                                                        {formatPrice(purchase.total_cost || purchase.purchase_price)} ₸
                                                                        {purchase.yuan_price ? <span className="text-[10px] text-gray ml-1.5 font-bold">(¥{purchase.yuan_price})</span> : ''}
                                                                    </p>
                                                                    <div className="flex flex-col items-end gap-1 mt-1">
                                                                        <div className="flex items-center gap-1.5 font-black text-[9px] uppercase">
                                                                            <span className="text-gray">× {purchase.quantity}</span>
                                                                            <span className="text-gray-light bg-light px-1 rounded">Прил {purchase.source_app}</span>
                                                                            <span className="text-gray-light bg-light px-1 rounded">{purchase.cargo || '—'}</span>
                                                                        </div>
                                                                        {purchase.track_code && (
                                                                            <span className="text-[9px] text-gray font-bold font-mono bg-light px-1.5 py-0.5 rounded">
                                                                                {purchase.track_code}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => purchase.status === 'pending' ? handleOrderArrived(purchase) : (setSelectedPurchase(purchase), setArrivalStep('price'))}
                                                                        className={`px-4 py-2 ${purchase.status === 'pending' ? 'bg-accent' : 'bg-dark'} text-white rounded-apple text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all`}
                                                                    >
                                                                        {purchase.status === 'pending' ? 'Пришёл' : 'Выставить'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => confirmDeletePurchase(purchase)}
                                                                        className="p-2 text-gray hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                                                                        title="Удалить закупку"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div >
                                    )}
                                </div >
                            )}

                            {/* Sales Log */}
                            <div className="bg-white rounded-apple-xl overflow-hidden border border-light shadow-apple mt-8 SalesLogContainer">
                                <div
                                    className="p-6 border-b border-light flex justify-between items-center cursor-pointer hover:bg-light/30 transition-colors no-print"
                                    onClick={() => setIsSalesHistoryCollapsed(!isSalesHistoryCollapsed)}
                                >
                                    <div className="flex items-center gap-4">
                                        <h3 className="font-bold text-dark flex items-center gap-2">
                                            <LayoutDashboard className="w-5 h-5 text-gray" />
                                            История продаж
                                        </h3>
                                        <div className="p-1 text-gray/40">
                                            {isSalesHistoryCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                                        </div>
                                    </div>
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={handleExportToExcel}
                                            className="flex items-center gap-2 px-4 py-2 bg-light hover:bg-success hover:text-white rounded-apple text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Excel
                                        </button>
                                        <button
                                            onClick={handlePrintReport}
                                            className="flex items-center gap-2 px-4 py-2 bg-light hover:bg-dark hover:text-white rounded-apple text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                                        >
                                            <Printer className="w-4 h-4" />
                                            PDF
                                        </button>
                                    </div>
                                </div>
                                {!isSalesHistoryCollapsed && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-light/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray">Товар</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray text-center">Размер</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray text-right">Прибыль</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray text-right">Дата</th>
                                                    <th className="px-6 py-4"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-light">
                                                {sales.length > 0 ? sales.map(sale => (
                                                    <tr key={sale.id} className="hover:bg-light/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-sm text-dark">{sale.product_name}</p>
                                                            <div className="flex items-center gap-2 text-[10px] text-gray uppercase font-bold mt-1">
                                                                <span className="normal-case font-medium text-gray-light">{formatPrice(sale.purchase_price || 0)} ₸ → {formatPrice(sale.selling_price)} ₸</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="px-2 py-0.5 bg-light rounded text-[10px] font-black text-gray-dark">{sale.size}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <p className="font-bold text-accent text-sm">+{formatPrice((sale.selling_price - (sale.purchase_price || 0)) * sale.quantity)} ₸</p>
                                                            <p className="text-[9px] text-gray font-bold">× {sale.quantity}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="text-[10px] text-gray font-bold">
                                                                    {new Date(sale.sale_date || sale.created_at).toLocaleDateString('ru-RU')}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        disabled
                                                                        className="flex items-center gap-1 text-gray-light cursor-not-allowed transition-all scale-90"
                                                                        title="Печать (временно недоступно)"
                                                                    >
                                                                        <span className="text-[9px] font-black uppercase tracking-wider">Печать</span>
                                                                        <Printer className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleOpenReceipt(sale)}
                                                                        className="flex items-center gap-1 text-accent hover:text-accent-dark transition-all scale-90 hover:scale-100"
                                                                        title="Посмотреть чек"
                                                                    >
                                                                        <span className="text-[9px] font-black uppercase tracking-wider">Чек</span>
                                                                        <Send className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => confirmDeleteSale(sale)} className="p-2 text-gray hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-gray font-medium italic">Нет записей о продажах</td>
                                                    </tr>
                                                )}
                                                {sales.length > 0 && (
                                                    <tr className="bg-light/30 font-bold">
                                                        <td className="px-6 py-4">ИТОГО</td>
                                                        <td className="px-6 py-4"></td>
                                                        <td className="px-6 py-4 text-right">
                                                            <p className="text-accent">+{formatPrice(sales.reduce((sum, s) => sum + ((s.selling_price - (s.purchase_price || 0)) * s.quantity), 0))} ₸</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span>{formatPrice(sales.reduce((sum, s) => sum + (s.selling_price * s.quantity), 0))} ₸</span>
                                                        </td>
                                                        <td className="px-6 py-4 no-print"></td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div >


                    </div >
                </div >

                {/* Delete Sale Confirmation Modal */}
                < Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSaleToDelete(null);
                    }}
                    title="Подтверждение удаления"
                    size="sm"
                >
                    <div className="space-y-8 py-4">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <p className="text-lg font-bold text-dark tracking-tight">Вы уверены?</p>
                            <p className="text-sm text-gray font-medium">
                                Запись о продаже <span className="text-dark font-black underline">"{saleToDelete?.product_name}"</span> будет удалена.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="danger"
                                onClick={handleDeleteSale}
                                className="h-12 font-bold"
                            >
                                Удалить
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSaleToDelete(null);
                                }}
                                className="h-12 font-bold"
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </Modal >

                {/* Delete Product Confirmation Modal */}
                < Modal
                    isOpen={isProductDeleteModalOpen}
                    onClose={() => {
                        setIsProductDeleteModalOpen(false);
                        setProductToDelete(null);
                    }}
                    title="Удаление товара"
                    size="sm"
                >
                    <div className="space-y-8 py-4">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <p className="text-lg font-bold text-dark tracking-tight">Удалить товар со склада?</p>
                            <p className="text-sm text-gray font-medium">
                                Это действие нельзя отменить. Вся история и остатки по этому товару могут быть потеряны.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="danger"
                                onClick={handleDeleteProduct}
                                className="h-12 font-bold"
                            >
                                Удалить
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsProductDeleteModalOpen(false);
                                    setProductToDelete(null);
                                }}
                                className="h-12 font-bold"
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </Modal >

                {/* Order Arrival Workflow Modals */}
                < Modal
                    isOpen={!!selectedPurchase}
                    onClose={() => setSelectedPurchase(null)}
                    title={arrivalStep === 'delivery' ? 'Стоимость доставки' : arrivalStep === 'decision' ? 'Добавить в архив?' : 'Цена продажи'}
                    size="sm"
                >
                    {arrivalStep === 'delivery' && (
                        <div className="space-y-6">
                            <p className="text-sm font-medium text-gray">Для товара: <span className="text-dark font-bold">{selectedPurchase?.name}</span></p>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">
                                    Сколько стоила доставка?
                                </label>
                                <input
                                    type="number"
                                    value={deliveryCost}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onChange={(e) => setDeliveryCost(e.target.value)}
                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>
                            <div className="p-4 bg-light rounded-apple">
                                <p className="text-xs font-black uppercase tracking-widest text-gray mb-2">Итого себестоимость:</p>
                                <p className="text-2xl font-bold text-dark">
                                    {formatPrice((selectedPurchase?.purchase_price || 0) + (parseInt(deliveryCost) || 0))} ₸
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setSelectedPurchase(null)} className="flex-1">Отмена</Button>
                                <Button variant="primary" onClick={handleDeliverySubmit} disabled={!deliveryCost} className="flex-1">Далее</Button>
                            </div>
                        </div>
                    )}

                    {
                        arrivalStep === 'decision' && (
                            <div className="space-y-8 py-4">
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto">
                                        <Package className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm text-gray font-medium">Заказ прибыл. Хотите перекинуть его в архив прямо сейчас?</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="secondary" onClick={() => setSelectedPurchase(null)} className="h-14 font-bold">
                                        <X className="w-5 h-5 mr-2" />
                                        Отмена
                                    </Button>
                                    <Button variant="primary" onClick={() => {
                                        addToast('success', 'Товар добавлен в архив');
                                        setSelectedPurchase(null);
                                        loadData();
                                    }} className="h-14 font-bold bg-accent border-accent">
                                        <Check className="w-5 h-5 mr-2" />
                                        Да
                                    </Button>
                                </div>
                            </div>
                        )
                    }

                    {
                        arrivalStep === 'price' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-accent/5 rounded-apple border border-accent/10">
                                    <label className="block text-xs font-black uppercase tracking-widest text-accent mb-2">
                                        Привязать к товару в каталоге
                                    </label>
                                    <select
                                        value={selectedExistingProductId}
                                        onChange={(e) => setSelectedExistingProductId(e.target.value)}
                                        className="w-full px-4 py-2 bg-white border-2 border-transparent rounded-apple text-dark focus:border-accent transition-all font-bold text-xs outline-none cursor-pointer"
                                    >
                                        <option value="new">Новый товар (создать)</option>
                                        <optgroup label="Существующие товары">
                                            {products
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} ({p.category})
                                                    </option>
                                                ))}
                                        </optgroup>
                                    </select>
                                    <p className="text-[10px] text-gray mt-2 font-medium italic">
                                        {selectedExistingProductId === 'new'
                                            ? "Будет создана новая карточка товара."
                                            : "Размер и цена будут добавлены в существующую карточку."}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">
                                        За какую цену выставить?
                                    </label>
                                    <input
                                        type="number"
                                        value={sellingPrice}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        onChange={(e) => setSellingPrice(e.target.value)}
                                        className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                                {sellingPrice && selectedPurchase?.total_cost && (
                                    <div className="p-4 bg-light rounded-apple">
                                        <p className="text-xs font-black uppercase tracking-widest text-gray mb-2">Прогноз прибыли:</p>
                                        <p className="text-xl font-bold text-accent">
                                            +{formatPrice(parseInt(sellingPrice) - selectedPurchase.total_cost)} ₸
                                        </p>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <Button variant="secondary" onClick={() => setArrivalStep('decision')} className="flex-1">Назад</Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleCreateProductFromPurchase}
                                        isLoading={isSubmitting}
                                        disabled={!sellingPrice}
                                        className="flex-1"
                                    >
                                        Выставить
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                </Modal >

                {/* Barcode Modal */}
                < Modal
                    isOpen={barcodeModalOpen}
                    onClose={handleCloseBarcodeModal}
                    title="Добавить штрихкод"
                >
                    <div className="space-y-6">
                        {/* Barcode Input */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">
                                Штрихкод
                            </label>
                            <input
                                type="text"
                                value={barcodeModalInput}
                                onChange={(e) => handleBarcodeModalSearch(e.target.value)}
                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                placeholder="Введите или отсканируйте штрихкод"
                                autoFocus
                            />
                            {barcodeModalLoading && (
                                <p className="text-xs text-gray mt-2 flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Поиск товара...
                                </p>
                            )}
                        </div>

                        {/* Found Product */}
                        {barcodeModalStep === 'found' && barcodeModalProduct && (
                            <div className="space-y-6 animate-scale-in">
                                <div className="bg-light/50 p-6 rounded-apple-lg border border-light">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-accent text-white rounded-apple flex items-center justify-center">
                                            <Check className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-gray">Товар найден</p>
                                            <p className="text-lg font-bold text-dark">{barcodeModalProduct.name}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-bold text-gray">Категория:</span> {barcodeModalProduct.category}</p>
                                        <p><span className="font-bold text-gray">Цена:</span> {formatPrice(barcodeModalProduct.price)} ₸</p>
                                        <p><span className="font-bold text-gray">Размеры:</span> {barcodeModalProduct.sizes?.join(', ') || 'Не указаны'}</p>
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                        <button
                                            onClick={() => handlePrintBarcode(barcodeModalProduct)}
                                            className="flex items-center gap-2 px-4 py-2 bg-dark text-white rounded-apple text-xs font-bold uppercase tracking-wider hover:bg-accent transition-all shadow-sm"
                                        >
                                            <Printer className="w-4 h-4" />
                                            Печать ценника
                                        </button>
                                        <p className="text-xs text-gray italic flex items-center">Товар найден в базе.</p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-apple-lg border-2 border-accent/20 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-dark">Добавить остатки по размерам</p>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    const productColors = barcodeModalProduct.colors?.length ? barcodeModalProduct.colors : (barcodeModalProduct.color ? [barcodeModalProduct.color] : ['Без цвета']);
                                                    const uniqueColors = Array.from(new Set([...productColors, 'Без цвета']));
                                                    return uniqueColors.map(c => (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            onClick={() => setSelectedBarcodeColor(c)}
                                                            className={`group relative flex items-center gap-2 px-3 py-2 rounded-apple border-2 transition-all ${selectedBarcodeColor === c ? 'border-accent bg-accent/5' : 'border-light hover:border-gray/30 bg-white'}`}
                                                            title={c}
                                                        >
                                                            <span className="w-4 h-4 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: getColorValue(c), border: isLightColor(getColorValue(c)) ? '1px solid #E5E7EB' : 'none' }}></span>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedBarcodeColor === c ? 'text-accent' : 'text-gray'}`}>{c}</span>
                                                            {selectedBarcodeColor === c && <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent text-white rounded-full flex items-center justify-center border border-white"><Check className="w-2 h-2" /></div>}
                                                        </button>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                        {['стандарт', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].map(size => (
                                            <div key={size} className="flex flex-col gap-1">
                                                <label className="text-[10px] font-black uppercase text-gray text-center">{size}</label>
                                                <input
                                                    type="number"
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                    value={stockAdditions[selectedBarcodeColor || 'Без цвета']?.[size] || ''}
                                                    onChange={(e) => setStockAdditions(prev => {
                                                        const colorKey = selectedBarcodeColor || 'Без цвета';
                                                        return {
                                                            ...prev,
                                                            [colorKey]: {
                                                                ...(prev[colorKey] || {}),
                                                                [size]: e.target.value
                                                            }
                                                        };
                                                    })}
                                                    className={`w-full px-2 py-2 text-center border-2 rounded-apple text-dark font-bold text-sm outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${stockAdditions[selectedBarcodeColor || 'Без цвета']?.[size] ? 'bg-accent/10 border-accent' : 'bg-light border-transparent focus:bg-white focus:border-dark'
                                                        }`}
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        variant="primary"
                                        onClick={handleAddStock}
                                        disabled={Object.values(stockAdditions).every(v => !v) || isSubmitting}
                                        isLoading={isSubmitting}
                                        className="w-full h-12 mt-4"
                                    >
                                        Обновить остатки
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Assign Barcode to Existing Product */}
                        {barcodeModalStep === 'assign' && barcodeModalAssignProduct && (
                            <div className="space-y-6 animate-scale-in">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-blue-700 mb-2">Присвоить штрихкод</p>
                                        <p className="text-sm text-blue-900 font-bold mb-1">Товар: {barcodeModalAssignProduct.name}</p>
                                        <p className="text-xs text-blue-700">Придумайте и введите штрихкод для этого товара выше.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // Create a temporary product with the current input as barcode to preview print
                                            // Or just print the assigned product if it had one? No, it doesn't have one yet.
                                            // User entered barcode in input.
                                            if (barcodeModalInput) {
                                                handlePrintBarcode({ ...barcodeModalAssignProduct, barcode: barcodeModalInput });
                                            } else {
                                                // addToast...
                                            }
                                        }}
                                        disabled={!barcodeModalInput}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-apple text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        Тест Печати
                                    </button>
                                </div>

                                <div className="bg-white p-6 rounded-apple-lg border-2 border-accent/20 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-dark">Добавить остатки по размерам (опционально)</p>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    const productColors = barcodeModalAssignProduct.colors?.length ? barcodeModalAssignProduct.colors : (barcodeModalAssignProduct.color ? [barcodeModalAssignProduct.color] : ['Без цвета']);
                                                    const uniqueColors = Array.from(new Set([...productColors, 'Без цвета']));
                                                    return uniqueColors.map(c => (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            onClick={() => setSelectedBarcodeColor(c)}
                                                            className={`group relative flex items-center gap-2 px-3 py-2 rounded-apple border-2 transition-all ${selectedBarcodeColor === c ? 'border-accent bg-accent/5' : 'border-light hover:border-gray/30 bg-white'}`}
                                                            title={c}
                                                        >
                                                            <span className="w-4 h-4 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: getColorValue(c), border: isLightColor(getColorValue(c)) ? '1px solid #E5E7EB' : 'none' }}></span>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedBarcodeColor === c ? 'text-accent' : 'text-gray'}`}>{c}</span>
                                                            {selectedBarcodeColor === c && <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent text-white rounded-full flex items-center justify-center border border-white"><Check className="w-2 h-2" /></div>}
                                                        </button>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                        {['стандарт', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].map(size => (
                                            <div key={size} className="flex flex-col gap-1">
                                                <label className="text-[10px] font-black uppercase text-gray text-center">{size}</label>
                                                <input
                                                    type="number"
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                    value={stockAdditions[selectedBarcodeColor || 'Без цвета']?.[size] || ''}
                                                    onChange={(e) => setStockAdditions(prev => {
                                                        const colorKey = selectedBarcodeColor || 'Без цвета';
                                                        return {
                                                            ...prev,
                                                            [colorKey]: {
                                                                ...(prev[colorKey] || {}),
                                                                [size]: e.target.value
                                                            }
                                                        };
                                                    })}
                                                    className={`w-full px-2 py-2 text-center border-2 rounded-apple text-dark font-bold text-sm outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${stockAdditions[selectedBarcodeColor || 'Без цвета']?.[size] ? 'bg-accent/10 border-accent' : 'bg-light border-transparent focus:bg-white focus:border-dark'
                                                        }`}
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button variant="secondary" onClick={handleCloseBarcodeModal} className="flex-1">
                                            Отмена
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleSaveBarcodeAndStock}
                                            disabled={!barcodeModalInput || isSubmitting}
                                            isLoading={isSubmitting}
                                            className="flex-1"
                                        >
                                            Сохранить
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Not Found - Create New Product */}
                        {barcodeModalStep === 'notfound' && (
                            <div className="space-y-6 animate-scale-in">
                                <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-apple-lg">
                                    <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">Товар не найден</p>
                                    <p className="text-sm text-amber-600">Создайте новый товар с этим штрихкодом</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Название товара *</label>
                                            <input
                                                type="text"
                                                value={newProductForm.name}
                                                onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Категория *</label>
                                            <select
                                                value={newProductForm.category}
                                                onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                                required
                                            >
                                                <option value="">Выберите категорию</option>
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Цена (₸) *</label>
                                            <input
                                                type="number"
                                                value={newProductForm.price}
                                                onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                                                onWheel={(e) => e.currentTarget.blur()}
                                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Фото товара (Галерея)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {newProductForm.images.map((url, i) => (
                                                    <div key={i} className="relative w-16 h-16 rounded-apple overflow-hidden border border-light group">
                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => setNewProductForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                                            className="absolute inset-0 bg-dark/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="w-16 h-16 bg-light border-2 border-dashed border-gray/20 rounded-apple flex items-center justify-center cursor-pointer hover:bg-gray/5 transition-all">
                                                    <Plus className="w-5 h-5 text-gray" />
                                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Описание</label>
                                            <textarea
                                                value={newProductForm.description}
                                                onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                                                className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray">Цвета и Размеры</label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="text"
                                                value={newColorInput}
                                                onChange={(e) => setNewColorInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (newColorInput.trim()) {
                                                            const color = newColorInput.trim();
                                                            setNewProductForm(prev => ({
                                                                ...prev,
                                                                selected_color: color
                                                            }));
                                                            setNewColorInput('');
                                                        }
                                                    }
                                                }}
                                                placeholder="Добавить цвет..."
                                                className="w-24 px-2 py-1.5 bg-light border border-transparent rounded-apple text-[10px] font-bold outline-none focus:bg-white focus:border-accent/30 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (newColorInput.trim()) {
                                                        const color = newColorInput.trim();
                                                        setNewProductForm(prev => ({
                                                            ...prev,
                                                            selected_color: color
                                                        }));
                                                        setNewColorInput('');
                                                    }
                                                }}
                                                className="p-1.5 bg-accent/10 text-accent rounded-apple hover:bg-accent hover:text-white transition-all"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {(() => {
                                            const colorsWithStock = Object.keys(newProductForm.stock_quantities);
                                            const activeColor = newProductForm.selected_color || 'Без цвета';
                                            const allVisibleColors = Array.from(new Set([activeColor, ...colorsWithStock]));

                                            return allVisibleColors.map(c => (
                                                <div key={c} className="relative group">
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewProductForm(prev => ({ ...prev, selected_color: c }))}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-apple border-2 transition-all ${activeColor === c ? 'border-accent bg-accent/5' : 'border-light hover:border-gray/30 bg-white'}`}
                                                    >
                                                        <span className="w-3 h-3 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: getColorValue(c), border: isLightColor(getColorValue(c)) ? '1px solid #E5E7EB' : 'none' }}></span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeColor === c ? 'text-accent' : 'text-gray'}`}>{c}</span>
                                                    </button>
                                                    {c !== 'Без цвета' && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setNewProductForm(prev => {
                                                                    const { [c]: _, ...rest } = prev.stock_quantities;
                                                                    return {
                                                                        ...prev,
                                                                        selected_color: prev.selected_color === c ? '' : prev.selected_color,
                                                                        stock_quantities: rest
                                                                    };
                                                                });
                                                            }}
                                                            className="absolute -top-2 -right-2 w-4 h-4 bg-white border border-light text-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-light"
                                                        >
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ));
                                        })()}
                                    </div>

                                    <div className="bg-light/30 p-4 rounded-apple-lg border border-light">
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                            {['стандарт', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].map(size => (
                                                <div key={size} className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-black uppercase text-gray text-center">{size}</label>
                                                    <input
                                                        type="number"
                                                        value={newProductForm.stock_quantities[newProductForm.selected_color || 'Без цвета']?.[size] || ''}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                        onChange={(e) => setNewProductForm(prev => {
                                                            const colorKey = prev.selected_color || 'Без цвета';
                                                            return {
                                                                ...prev,
                                                                stock_quantities: {
                                                                    ...prev.stock_quantities,
                                                                    [colorKey]: {
                                                                        ...(prev.stock_quantities[colorKey] || {}),
                                                                        [size]: e.target.value
                                                                    }
                                                                }
                                                            };
                                                        })}
                                                        className={`w-full px-2 py-2 text-center border-2 rounded-apple text-dark font-bold text-sm outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${newProductForm.stock_quantities[newProductForm.selected_color || 'Без цвета']?.[size] ? 'bg-white border-dark shadow-sm' : 'bg-white/50 border-transparent focus:bg-white focus:border-dark/50'
                                                            }`}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="secondary" onClick={handleCloseBarcodeModal} className="flex-1">
                                        Отмена
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleCreateNewProductWithBarcode}
                                        isLoading={isSubmitting}
                                        disabled={!newProductForm.name || !newProductForm.category || !newProductForm.price}
                                        className="flex-1"
                                    >
                                        Создать товар
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal >
                {/* Edit Product Modal */}
                < Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Редактировать товар"
                >
                    <form onSubmit={handleUpdateProduct} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Название</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Категория</label>
                                <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Цена (₸)</label>
                                <input
                                    type="number"
                                    value={editForm.price}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Штрихкод</label>
                                <input
                                    type="text"
                                    value={editForm.barcode}
                                    onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">Описание</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-light border-2 border-transparent rounded-apple text-dark focus:bg-white focus:border-dark transition-all font-bold text-sm outline-none min-h-[100px]"
                                />
                            </div>

                            {/* Color Selector */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5 leading-none">
                                    Управление цветом: <span className="text-dark">{selectedBarcodeColor || 'Без цвета'}</span>
                                </label>
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    {(() => {
                                        const displayColors = editForm.colors.length > 0 ? editForm.colors : ['Без цвета'];
                                        return displayColors.map(c => (
                                            <div key={c} className="relative group">
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setSelectedBarcodeColor(c)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-apple border-2 transition-all ${selectedBarcodeColor === c ? 'border-accent bg-accent/5' : 'border-light hover:border-gray/30 bg-white'}`}
                                                    title={c}
                                                >
                                                    <span className="w-4 h-4 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: getColorValue(c), border: isLightColor(getColorValue(c)) ? '1px solid #E5E7EB' : 'none' }}></span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedBarcodeColor === c ? 'text-accent' : 'text-gray'}`}>{c}</span>
                                                    {selectedBarcodeColor === c && <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent text-white rounded-full flex items-center justify-center border border-white"><Check className="w-2 h-2" /></div>}
                                                </button>
                                                {editForm.colors.includes(c) && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newColors = editForm.colors.filter(col => col !== c);
                                                            setEditForm({ ...editForm, colors: newColors });
                                                            if (selectedBarcodeColor === c) {
                                                                setSelectedBarcodeColor(newColors[0] || 'Без цвета');
                                                            }
                                                        }}
                                                        className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-light text-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-light"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ));
                                    })()}

                                    <div className="flex items-center gap-1.5 ml-2">
                                        <input
                                            type="text"
                                            value={newEditColorInput}
                                            onChange={(e) => setNewEditColorInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (newEditColorInput.trim() && !editForm.colors.includes(newEditColorInput.trim())) {
                                                        const newColor = newEditColorInput.trim();
                                                        setEditForm({ ...editForm, colors: [...editForm.colors, newColor] });
                                                        setSelectedBarcodeColor(newColor);
                                                        setNewEditColorInput('');
                                                    }
                                                }
                                            }}
                                            placeholder="Новый цвет..."
                                            className="w-28 px-2 py-1.5 bg-light border border-transparent rounded-apple text-[10px] font-bold outline-none focus:bg-white focus:border-accent/30 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (newEditColorInput.trim() && !editForm.colors.includes(newEditColorInput.trim())) {
                                                    const newColor = newEditColorInput.trim();
                                                    setEditForm({ ...editForm, colors: [...editForm.colors, newColor] });
                                                    setSelectedBarcodeColor(newColor);
                                                    setNewEditColorInput('');
                                                }
                                            }}
                                            className="p-1.5 bg-accent/10 text-accent rounded-apple hover:bg-accent hover:text-white transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Images Section */}
                            <div>
                                {(() => {
                                    const colorKey = selectedBarcodeColor && selectedBarcodeColor !== 'Без цвета' ? selectedBarcodeColor : null;
                                    const hasSpecificImages = colorKey && editForm.color_images && editForm.color_images[colorKey];
                                    const displayImages = hasSpecificImages ? editForm.color_images[colorKey] : (editForm.images || []);
                                    const isInherited = colorKey && !hasSpecificImages && (editForm.images || []).length > 0;

                                    return (
                                        <>
                                            <label className="block text-xs font-black uppercase tracking-widest text-gray mb-1.5">
                                                Фото: <span className={colorKey ? "text-accent" : "text-dark"}>{colorKey ? `Для цвета "${colorKey}"` : 'Общие (для всех)'}</span>
                                                {isInherited && <span className="ml-2 text-[10px] bg-gray/10 text-gray px-1.5 py-0.5 rounded">Используются общие фото</span>}
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {displayImages.map((url, i) => (
                                                    <div key={i} className={`relative w-16 h-16 rounded-apple overflow-hidden border group ${isInherited ? 'border-dashed border-gray/40 opacity-70' : 'border-light'}`}>
                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                        {!isInherited && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (colorKey) {
                                                                        // Remove from specific color
                                                                        setEditForm(prev => ({
                                                                            ...prev,
                                                                            color_images: {
                                                                                ...prev.color_images,
                                                                                [colorKey]: prev.color_images[colorKey].filter((_, idx) => idx !== i)
                                                                            }
                                                                        }));
                                                                    } else {
                                                                        // Remove from global
                                                                        setEditForm(prev => ({
                                                                            ...prev,
                                                                            images: prev.images.filter((_, idx) => idx !== i)
                                                                        }));
                                                                    }
                                                                }}
                                                                className="absolute inset-0 bg-dark/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <label className={`w-16 h-16 bg-light border-2 border-dashed border-gray/20 rounded-apple flex items-center justify-center cursor-pointer hover:bg-gray/5 transition-all ${colorKey ? 'border-accent/30 bg-accent/5' : ''}`}>
                                                    <Plus className={`w-5 h-5 ${colorKey ? 'text-accent' : 'text-gray'}`} />
                                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                </label>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="bg-white p-6 rounded-apple-lg border-2 border-accent/20 space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-dark">
                                    Остатки для: {selectedBarcodeColor || 'Без цвета'}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {['стандарт', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].map(size => {
                                        const isSelected = editForm.sizes.includes(size);
                                        const colorKey = selectedBarcodeColor || 'Без цвета';

                                        // Filter UI - always show if selected globally
                                        // But input is for specific color

                                        return (
                                            <div key={size} className={`p-3 rounded-apple-lg border-2 transition-all ${isSelected ? 'border-accent/20 bg-accent/5' : 'border-transparent bg-light/50 opacity-60'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-accent' : 'text-gray'}`}>{size}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newSizes = isSelected
                                                                ? editForm.sizes.filter(s => s !== size)
                                                                : [...editForm.sizes, size];
                                                            setEditForm({ ...editForm, sizes: newSizes });
                                                        }}
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-accent text-white' : 'bg-gray/20 text-gray'}`}
                                                    >
                                                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                                {isSelected && (
                                                    <input
                                                        type="number"
                                                        value={editForm.stockQuantities[colorKey]?.[size] || ''}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                        onChange={(e) => setEditForm(prev => {
                                                            const targetColor = selectedBarcodeColor || 'Без цвета';
                                                            return {
                                                                ...prev,
                                                                stockQuantities: {
                                                                    ...prev.stockQuantities,
                                                                    [targetColor]: {
                                                                        ...(prev.stockQuantities[targetColor] || {}),
                                                                        [size]: e.target.value
                                                                    }
                                                                }
                                                            };
                                                        })}
                                                        className="w-full px-2 py-1.5 bg-white border border-accent/20 rounded-apple text-dark font-bold text-xs outline-none focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        placeholder="0"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                isLoading={isSubmitting}
                            >
                                Сохранить
                            </Button>
                        </div>
                    </form>
                </Modal >
                {/* Receipt Preview Modal */}
                < Modal
                    isOpen={isReceiptModalOpen}
                    onClose={() => setIsReceiptModalOpen(false)}
                    title="Предпросмотр чека"
                >
                    {selectedSaleForReceipt && (
                        <div className="space-y-6">
                            <div className="bg-light/30 p-6 rounded-apple-2xl border border-light font-mono text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                                {generateReceiptText(selectedSaleForReceipt)}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="secondary"
                                    className="flex items-center justify-center gap-2 py-4"
                                    onClick={() => handleCopyReceipt(generateReceiptText(selectedSaleForReceipt))}
                                >
                                    <Copy className="w-4 h-4" /> Текст
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex items-center justify-center gap-2 py-4"
                                    onClick={() => handleGeneratePDF(selectedSaleForReceipt)}
                                    isLoading={isSubmitting}
                                >
                                    <FileText className="w-4 h-4" /> PDF Чек
                                </Button>
                            </div>
                            <p className="text-[10px] text-gray text-center font-bold uppercase tracking-widest leading-relaxed">
                                Нажмите <span className="text-accent underline">PDF Чек</span> для мгновенной отправки <br /> файла в WhatsApp или Telegram
                            </p>
                        </div>
                    )}
                </Modal >

                {/* Purchase Deletion Confirmation Modal */}
                < Modal
                    isOpen={isPurchaseDeleteModalOpen}
                    onClose={() => {
                        setIsPurchaseDeleteModalOpen(false);
                        setPurchaseToDelete(null);
                    }}
                    title="Подтверждение удаления"
                >
                    <div className="space-y-6">
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto">
                                <Trash2 className="w-8 h-8 text-danger" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-dark">Удалить закупку?</h3>
                                <p className="text-sm text-gray mt-1">
                                    Вы собираетесь удалить закупку <span className="text-dark font-bold font-mono">"{purchaseToDelete?.name}"</span>.
                                    Это действие невозможно отменить.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => {
                                    setIsPurchaseDeleteModalOpen(false);
                                    setPurchaseToDelete(null);
                                }}
                            >
                                Отмена
                            </Button>
                            <Button
                                variant="danger"
                                className="flex-1 bg-danger hover:bg-danger-dark"
                                onClick={handleDeletePurchase}
                                isLoading={isSubmitting}
                            >
                                Удалить
                            </Button>
                        </div>
                    </div>
                </Modal >
            </div >

            <div style={{ position: 'fixed', left: '0', top: '0', width: '340px', height: '1px', overflow: 'hidden', zIndex: -100, opacity: 1, pointerEvents: 'none' }}>
                <div
                    id="receipt-pdf-template"
                    className="p-12 w-[340px] font-sans"
                    style={{ position: 'relative', backgroundColor: '#ffffff', color: '#0A0A0A' }}
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black tracking-tighter mb-2 lowercase" style={{ color: '#0A0A0A' }}>dracarys.kz</h2>
                        <div className="h-0.5 w-8 mx-auto mb-2" style={{ backgroundColor: '#ee9292' }}></div>
                        <p className="text-[11px] font-medium lowercase tracking-[0.2em]" style={{ color: '#808080' }}>style is about you.</p>
                    </div>

                    <div className="space-y-8 mb-12">
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold lowercase tracking-widest block" style={{ color: 'rgba(128, 128, 128, 0.4)' }}>наименование</span>
                            <span className="text-base font-bold leading-tight block lowercase" style={{ color: '#0A0A0A' }}>{selectedSaleForReceipt?.product_name.toLowerCase()}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-8" style={{ borderTop: '1px solid #F5F5F5', borderBottom: '1px solid #F5F5F5' }}>
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold lowercase tracking-widest block" style={{ color: 'rgba(128, 128, 128, 0.4)' }}>размер</span>
                                <span className="text-base font-black lowercase" style={{ color: '#0A0A0A' }}>{selectedSaleForReceipt?.size.toString().toLowerCase()}</span>
                            </div>
                            <div className="space-y-1.5 text-right">
                                <span className="text-[10px] font-bold lowercase tracking-widest block" style={{ color: 'rgba(128, 128, 128, 0.4)' }}>количество</span>
                                <span className="text-base font-black lowercase" style={{ color: '#0A0A0A' }}>{selectedSaleForReceipt?.quantity} шт</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xs font-black lowercase tracking-[0.3em]" style={{ color: '#0A0A0A' }}>итого</span>
                            <span className="text-3xl font-black tabular-nums tracking-tighter" style={{ color: '#0A0A0A' }}>
                                {selectedSaleForReceipt ? formatPrice(selectedSaleForReceipt.selling_price * selectedSaleForReceipt.quantity) : 0} ₸
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 text-[10px] font-bold text-center mb-16 pt-8 border-t border-dashed" style={{ color: '#cccccc', borderColor: '#f0f0f0' }}>
                        <p className="tracking-widest lowercase">
                            {(() => {
                                const s = selectedSaleForReceipt;
                                if (!s) return '—';
                                const sStr = s.sale_date ? String(s.sale_date) : '';
                                const cStr = s.created_at ? String(s.created_at) : '';

                                let dO: Date;
                                if (sStr.includes(':') || sStr.includes('T')) { dO = new Date(sStr); }
                                else if (cStr) { dO = new Date(cStr); }
                                else { dO = new Date(`${sStr}T00:00:00`); }

                                return dO.toLocaleDateString('ru-KZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).toLowerCase();
                            })()}
                        </p>
                        <p className="text-xs" style={{ color: '#b5b5b5' }}>
                            {(() => {
                                const s = selectedSaleForReceipt;
                                if (!s) return '—';
                                const sStr = s.sale_date ? String(s.sale_date) : '';
                                const cStr = s.created_at ? String(s.created_at) : '';

                                let dO: Date;
                                if (sStr.includes(':') || sStr.includes('T')) { dO = new Date(sStr); }
                                else if (cStr) { dO = new Date(cStr); }
                                else { dO = new Date(`${sStr}T00:00:00`); }

                                return dO.toLocaleTimeString('ru-KZ', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
                            })()}
                        </p>
                    </div>

                    <div className="text-center p-4 rounded-apple-xl" style={{ backgroundColor: '#fafafa' }}>
                        <p className="text-[10px] font-bold lowercase tracking-widest" style={{ color: '#808080' }}>dracarys.kz | qaraa.crm</p>
                    </div>
                </div>
            </div>
        </>
    );
};
