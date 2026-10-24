"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        
        console.log('✅ Service Worker registered:', registration.scope);

        // SW Ready ဖြစ်တဲ့အထိ စောင့်မယ်
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker ready');

        // Native App ဖြစ်ရင် Cache Warming လုပ်မယ်
        if (Capacitor.isNativePlatform()) {
          console.log('📱 Native platform - warming cache');
          setTimeout(() => warmCache(), 2000);
        }
      } catch (err) {
        console.error('❌ Service Worker registration failed:', err);
      }
    };

    const warmCache = async () => {
      const pagesToCache = ['/', '/notes', '/library', '/search'];
      const cache = await caches.open('nexfix-v3-dynamic');
      
      for (const page of pagesToCache) {
        try {
          const response = await fetch(page, { 
            cache: 'no-cache',
            credentials: 'include', // Cookie ပါသွားအောင်
          });
          
          if (response.ok) {
            await cache.put(page, response.clone());
            console.log('✅ Cached:', page);
          }
        } catch (err) {
          console.log('❌ Cache failed:', page, err);
        }
      }
      
      // Static assets
      const staticCache = await caches.open('nexfix-v3-static');
      const assets = [
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
      ];
      
      for (const asset of assets) {
        try {
          const response = await fetch(asset);
          if (response.ok) {
            await staticCache.put(asset, response.clone());
          }
        } catch (err) {}
      }
      
      console.log('✅ Cache warming complete');
    };

    registerSW();
  }, []);

  return null;
}
