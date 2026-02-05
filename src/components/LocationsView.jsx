import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LangContext'

export default function LocationsView() {
    const { isDark } = useTheme()
    const { t } = useLang()
    const [searchQuery, setSearchQuery] = useState('')

    // Mock locations data
    const locations = [
        {
            id: 1,
            name: 'qaraa.store',
            subtitle: t('home.store.subtitle'),
            type: 'store',
            address: 'Жошы Хана 13, Астана',
            latitude: 51.099738,
            longitude: 71.437457
        }
    ]

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div style={{
            padding: '0',
            paddingBottom: '100px',
            background: isDark ? '#000000' : '#FFFFFF',
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Embedded Google Maps */}
            <div style={{
                width: '100%',
                height: '300px',
                background: isDark ? '#1C1C1E' : '#E5E5EA',
                position: 'relative'
            }}>
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2505.234!2d71.437457!3d51.099738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDA1JzU5LjEiTiA3McKwMjYnMTQuOCJF!5e0!3m2!1sru!2skz!4v1699999999999!5m2!1sru!2skz"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>

            {/* Search Bar */}
            <div style={{
                padding: '16px',
                background: isDark ? '#000000' : '#FFFFFF'
            }}>
                <input
                    type="text"
                    placeholder={t('locations.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: isDark ? '#1C1C1E' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#2C2C2E' : '#E5E5EA'}`,
                        borderRadius: '12px',
                        fontSize: '17px',
                        color: isDark ? '#FFFFFF' : '#000000',
                        outline: 'none',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                    }}
                />
            </div>

            {/* Locations List */}
            <div style={{
                padding: '0 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {filteredLocations.map((location) => (
                    <div
                        key={location.id}
                        onClick={() => {
                            const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`
                            window.open(url, '_blank')
                        }}
                        style={{
                            background: isDark ? '#1C1C1E' : '#FFFFFF',
                            borderRadius: '12px',
                            padding: '16px',
                            border: `1px solid ${isDark ? '#2C2C2E' : '#E5E5EA'}`,
                            boxShadow: isDark
                                ? '0 2px 8px rgba(0,0,0,0.3)'
                                : '0 2px 8px rgba(0,0,0,0.08)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                        onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                        onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {/* Location Name and Subtitle */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            marginBottom: '12px'
                        }}>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: isDark ? '#FFFFFF' : '#000000',
                                margin: 0,
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                            }}>
                                {location.name}
                            </h3>
                            <span style={{
                                fontSize: '15px',
                                color: '#8E8E93',
                                fontWeight: '500'
                            }}>
                                {location.subtitle}
                            </span>
                        </div>

                        {/* Address */}
                        <div style={{
                            fontSize: '15px',
                            color: isDark ? '#EBEBF5' : '#3C3C43',
                            lineHeight: 1.4
                        }}>
                            {location.address}
                        </div>
                    </div>
                ))}
            </div>

            {filteredLocations.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#8E8E93'
                }}>
                    <p style={{ fontSize: '17px', fontWeight: '600', margin: '0 0 8px 0' }}>
                        Ничего не найдено
                    </p>
                    <p style={{ fontSize: '15px', margin: 0 }}>
                        Попробуйте изменить запрос
                    </p>
                </div>
            )}
        </div>
    )
}
