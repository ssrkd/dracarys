export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    cost?: number; // Actual cost (purchase + delivery)
    description: string;
    image_url: string;
    created_at: string;
    sizes?: string[];
    featured?: boolean;
    discounted_price?: number | null; // Actual discounted price (not percentage)
    is_visible?: boolean; // Whether product is visible to customers (default: true)
    barcode?: string; // Barcode for inventory management
    images?: string[]; // Multiple images support
}

export interface Purchase {
    id: string;
    name: string;
    size: string;
    quantity: number;
    purchase_price: number; // Base purchase price
    source_app: number; // 1 or 2
    category: string;
    photo_url?: string;
    status: 'pending' | 'arrived' | 'listed' | 'archived';
    delivery_cost?: number;
    total_cost?: number; // purchase_price + delivery_cost
    order_date?: string; // When the order was placed
    arrival_date?: string; // When the order arrived
    item_url?: string; // Link to the product source
    created_at: string;
}

export interface Sale {
    id: string;
    product_id: string | null;
    product_name: string;
    size: string;
    quantity: number;
    purchase_price?: number; // Optional: For backward compatibility with existing sales
    selling_price: number;
    source: string | null;
    sale_date?: string; // When the sale occurred
    created_at: string;
}

export interface CartItem extends Product {
    quantity: number;
    selectedSize?: string;
}

export interface FocalPlan {
    id: string;
    title: string;
    description: string | null;
    category: 'Marketing' | 'Stock' | 'Finance' | 'Content' | 'Personal' | 'General';
    priority: 'Low' | 'Medium' | 'High';
    revenue_impact?: number;
    start_date: string;
    end_date: string | null;
    is_completed: boolean;
    created_at: string;
}

export interface FocalNote {
    id: string;
    content: string;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
}

export interface FocalDiary {
    id: string;
    entry: string;
    revenue: number;
    worked: string | null;
    failed: string | null;
    ideas: string | null;
    mood: number;
    energy_level: number;
    date: string;
    created_at: string;
}

export interface FocalGoal {
    id: string;
    title: string;
    target_value: number;
    current_value: number;
    unit: string;
    type: 'Revenue' | 'Sales' | 'Launch';
    period: 'Monthly' | 'Weekly' | 'Yearly';
    start_date: string;
    end_date: string | null;
    created_at: string;
}

export interface FocalHabit {
    id: string;
    title: string;
    streak: number;
    history: { [date: string]: boolean };
    created_at: string;
}

export interface FocalBrainNote {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    created_at: string;
}

export interface FocalCore {
    id: string;
    type: 'plan' | 'diary' | 'goal' | 'note' | 'habit' | 'brain';
    title: string | null;
    content: string | null;
    metadata: any; // Flexible JSONB fields
    date: string;
    created_at: string;
}

export type Category = 'All' | 'штаны' | 'куртки | пальто' | 'Футболки' | 'Обувь' | 'Сумки | аксессуары' | 'Толстовки и худи' | 'Шапки';

export interface Database {
    public: {
        Tables: {
            products: {
                Row: Product;
                Insert: Omit<Product, 'id' | 'created_at'> & {
                    id?: string;
                    created_at?: string;
                };
                Update: Partial<Omit<Product, 'id' | 'created_at'>>;
            };
        };
    };
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}
