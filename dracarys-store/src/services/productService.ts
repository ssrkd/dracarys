import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';

export const productService = {
    // Получить все продукты
    async getAllProducts(): Promise<Product[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Получить продукт по ID
    async getProductById(id: string): Promise<Product | null> {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Получить продукты по категории
    async getProductsByCategory(category: string): Promise<Product[]> {
        if (category === 'All') {
            return this.getAllProducts();
        }

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Получить только избранные продукты
    async getFeaturedProducts(): Promise<Product[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('featured', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Поиск продуктов
    async searchProducts(query: string): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Получить продукт по штрихкоду
    async getProductByBarcode(barcode: string): Promise<Product | null> {
        if (!supabase || !barcode) return null;
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('barcode', barcode)
            .single();

        if (error) return null;
        return data;
    },

    // Добавить штрихкод к продукту
    async addBarcode(productId: string, barcode: string): Promise<Product> {
        return this.updateProduct(productId, { barcode });
    },

    // Создать продукт (админ)
    async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
        if (!supabase) throw new Error('Supabase not configured');

        // If images array provided, also maintain image_url as comma-separated for compatibility
        const payload: any = { ...product };
        if (Array.isArray((product as any).images)) {
            payload.image_url = (product as any).images.join(',');
        }

        const { data, error } = await (supabase
            .from('products')
            .insert(payload) as any)
            .select()
            .single();

        if (error) throw error;
        return data as Product;
    },

    // Обновить продукт (админ)
    async updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product> {
        if (!supabase) throw new Error('Supabase not configured');

        const payload: any = { ...product };
        if (Array.isArray((product as any).images)) {
            payload.image_url = (product as any).images.join(',');
        }

        const { data, error } = await (supabase
            .from('products')
            .update(payload) as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Product;
    },

    // Удалить продукт (админ)
    async deleteProduct(id: string): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Toggle product visibility
    async toggleVisibility(id: string): Promise<Product> {
        // Get current visibility
        const { data: product } = await supabase
            .from('products')
            .select('is_visible')
            .eq('id', id)
            .single();

        const newVisibility = !(product?.is_visible ?? true);

        return this.updateProduct(id, { is_visible: newVisibility });
    },

    // Toggle specific color visibility
    async toggleColorVisibility(productId: string, color: string): Promise<Product> {
        const product = await this.getProductById(productId);
        if (!product) throw new Error('Product not found');

        const currentHidden = product.hidden_colors || [];
        const updatedHidden = currentHidden.includes(color)
            ? currentHidden.filter(c => c !== color)
            : [...currentHidden, color];

        return this.updateProduct(productId, { hidden_colors: updatedHidden });
    },

    // Get only visible products (for customer view)
    async getVisibleProducts(): Promise<Product[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_visible', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Create product from purchase
    async createFromPurchase(purchaseData: {
        name: string;
        size: string;
        category: string;
        photo_url?: string;
    }, sellingPrice: number, cost: number): Promise<Product> {
        const product: Omit<Product, 'id' | 'created_at'> = {
            name: purchaseData.name,
            category: purchaseData.category,
            price: sellingPrice,
            cost: cost,
            description: '', // Can be updated later
            image_url: purchaseData.photo_url || '',
            sizes: [purchaseData.size],
            is_visible: true,
            featured: false
        };

        return this.createProduct(product);
    },

    // Link purchase to an existing catalog product
    async linkPurchaseToExistingProduct(productId: string, newSize: string, newSellingPrice: number, newCost: number): Promise<Product> {
        const product = await this.getProductById(productId);
        if (!product) throw new Error('Product not found');

        const currentSizes = product.sizes || [];
        const updatedSizes = currentSizes.includes(newSize) ? currentSizes : [...currentSizes, newSize];

        return this.updateProduct(productId, {
            sizes: updatedSizes,
            price: newSellingPrice,
            cost: newCost,
            is_visible: true // Set to visible when listing
        });
    },

    // Подписка на изменения (Real-time)
    subscribeToProducts(callback: () => void) {
        if (!supabase) return { unsubscribe: () => { } };

        const channel = supabase
            .channel('products-all')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'products'
                },
                (payload: any) => {
                    console.log('Realtime change detected:', payload.eventType, payload.new);
                    callback();
                }
            )
            .subscribe((status: string) => {
                console.log('Realtime subscription status:', status);
            });

        return {
            unsubscribe: () => {
                supabase.removeChannel(channel);
            }
        };
    },

    // Загрузка изображения
    async uploadImage(file: File): Promise<string> {
        if (!supabase) throw new Error('Supabase not configured');

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
};
