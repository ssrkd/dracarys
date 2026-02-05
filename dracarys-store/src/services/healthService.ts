import { Capacitor } from '@capacitor/core';
import { focalService } from './focalService';

// Fallback for when developer hasn't installed the plugin yet
let HealthKit: any = null;

const initializeHealth = async () => {
    if (Capacitor.getPlatform() === 'ios') {
        try {
            // Using a dynamic variable and vite-ignore to completely hide from static analysis
            const pkg = 'capacitor-healthkit';
            const m = await import(/* @vite-ignore */ pkg);
            HealthKit = m.CapacitorHealthkit;
        } catch (e) {
            console.log('HealthKit plugin not found in node_modules');
        }
    }
};

initializeHealth();

export const healthService = {
    isAvailable: () => {
        return Capacitor.getPlatform() === 'ios';
    },

    requestPermissions: async () => {
        if (!healthService.isAvailable() || !HealthKit) return false;
        try {
            await HealthKit.requestAuthorization({
                all: ['sleepAnalysis'],
                read: ['sleepAnalysis'],
                write: []
            });
            return true;
        } catch (e) {
            console.error('Permission error', e);
            return false;
        }
    },

    syncSleepData: async () => {
        if (!healthService.isAvailable() || !HealthKit) return null;

        try {
            const isAuthorized = await healthService.requestPermissions();
            if (!isAuthorized) return null;

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 1); // Last 24 hours
            const endDate = new Date();

            const result = await HealthKit.queryHKitSampleType({
                sampleType: 'sleepAnalysis',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                limit: 100
            });

            // Filter and sum sleep duration (result is usually in minutes or seconds)
            // Note: Logic depends on how the plugin returns data
            let totalSleepMinutes = 0;
            result.values.forEach((sample: any) => {
                // Only count 'asleep' samples (value 0: inBed, 1: asleep)
                if (sample.value === 1) {
                    const duration = (new Date(sample.endDate).getTime() - new Date(sample.startDate).getTime()) / (1000 * 60);
                    totalSleepMinutes += duration;
                }
            });

            const hours = Math.round((totalSleepMinutes / 60) * 10) / 10;

            // Save to today's diary
            const today = new Date().toISOString().split('T')[0];
            const entries = await focalService.getCoreData('diary');
            const todayEntry = entries.find(e => e.date === today);

            if (todayEntry) {
                await focalService.updateCoreData(todayEntry.id, {
                    metadata: { ...todayEntry.metadata, sleep_hours: hours }
                });
            } else {
                await focalService.createDiaryEntry({
                    entry: 'Синхронизировано из Apple Health',
                    revenue: 0,
                    mood: 7,
                    energy_level: 7,
                    worked: 'Сон синхронизирован',
                    failed: '',
                    ideas: '',
                    date: today
                });
                // Update with sleep hours after creation to ensure metadata is preserved
                const newEntries = await focalService.getCoreData('diary');
                const newEntry = newEntries.find(e => e.date === today);
                if (newEntry) {
                    await focalService.updateCoreData(newEntry.id, {
                        metadata: { ...newEntry.metadata, sleep_hours: hours }
                    });
                }
            }

            return hours;
        } catch (e) {
            console.error('Sync failed', e);
            return null;
        }
    }
};
