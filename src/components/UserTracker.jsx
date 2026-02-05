import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase, supabaseUrl, supabaseAnonKey } from '../supabaseClient';

const UserTracker = ({ customer, onLogout }) => {
    const location = useLocation();

    // Helper для определения устройства
    const getDeviceType = () => {
        const ua = navigator.userAgent || '';
        const width = window.innerWidth;

        // 1. Агрессивная проверка по User Agent
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

        // 2. Проверка по тач-поинтам (iPad Pro и планшеты)
        const isTouch = navigator.maxTouchPoints > 0;

        // 3. Проверка ширины
        const isSmallScreen = width <= 1024;

        if (isMobileUA || (isTouch && isSmallScreen)) {
            return 'mobile';
        }

        return 'desktop';
    };

    // Helper для названия страницы
    const getPageName = (pathname) => {
        // Проверяем глобальную переменную от DashboardMobile/клиента
        if (window.qaraaCurrentPage && !pathname.includes('admin')) {
            return window.qaraaCurrentPage;
        }

        const routes = {
            '/': 'Главная',
            '/dashboard': 'Главная (Dashboard)',
            '/login': 'Вход',
            '/card-info': 'Информация о карте',
            '/about-us': 'О нас',
            '/privacy': 'Конфиденциальность',
            '/terms': 'Условия',
            '/history': 'История',
            '/cart': 'Корзина',
            '/track': 'Отслеживание',
            '/profile': 'Профиль',
            '/news': 'Новости',
            '/storedashboard': 'Маркетплейс',
            '/coffeedashboard': 'Кофейня'
        };
        return routes[pathname] || pathname;
    };

    // 1. Управление статусом Online/Offline, Heartbeat и проверка бана
    useEffect(() => {
        if (!customer?.id) return;

        const updateStatus = async (isOnline) => {
            try {
                const updates = {
                    is_online: isOnline,
                    last_active: new Date().toISOString(),
                    device_type: getDeviceType()
                };

                // Добавляем текущую страницу только если мы онлайн
                if (isOnline) {
                    updates.current_page = getPageName(location.pathname);
                }

                await supabase
                    .from('customers')
                    .update(updates)
                    .eq('id', customer.id);
            } catch (error) {
                console.error('Error updating status:', error);
            }
        };

        // Initial status update
        updateStatus(true);

        // Heartbeat каждые 15 секунд
        const interval = setInterval(() => {
            updateStatus(true);
        }, 15000);

        // Подписка на бан
        const channel = supabase
            .channel(`customer_tracking:${customer.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'customers',
                    filter: `id=eq.${customer.id}`
                },
                (payload) => {
                    if (payload.new.is_banned && !payload.old?.is_banned) {
                        alert('Ваш аккаунт был заблокирован администратором.');
                        if (onLogout) {
                            onLogout();
                        } else {
                            localStorage.removeItem('qaraa_customer');
                            window.location.href = '/';
                        }
                    }
                }
            )
            .subscribe();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateStatus(true);
            }
            // Optional: set offline on visibility hidden? Usually better to keep online for short switches
            // but maybe update last_active
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        const handleBeforeUnload = () => {
            // Используем fetch с keepalive и правильными ключами
            const url = `${supabaseUrl}/rest/v1/customers?id=eq.${customer.id}`;
            const headers = {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            };
            const body = JSON.stringify({ is_online: false, last_active: new Date().toISOString() });

            try {
                fetch(url, {
                    method: 'PATCH',
                    headers: headers,
                    body: body,
                    keepalive: true
                });
            } catch (e) {
                // Fallback attempt
                navigator.sendBeacon && navigator.sendBeacon(url, body);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // Don't set offline automatically on unmount to avoid flickering during navigation
            // Offline is handled by handleBeforeUnload (tab close) or explicit logout
        };
    }, [customer?.id, onLogout]);

    // 2. Отдельный эффект для смены страницы
    useEffect(() => {
        if (!customer?.id) return;

        const updatePage = async () => {
            // Small delay to allow window.qaraaCurrentPage to be set by the new component
            setTimeout(async () => {
                try {
                    await supabase
                        .from('customers')
                        .update({
                            current_page: getPageName(location.pathname),
                            last_active: new Date().toISOString(),
                            is_online: true
                        })
                        .eq('id', customer.id);
                } catch (e) { console.error(e); }
            }, 100);
        };
        updatePage();
    }, [location, customer?.id]);

    return null;
};

export default UserTracker;
