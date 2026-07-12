import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import itemsData from '../data/items.json';
import generatorsData from '../data/generators.json';
import emailsData from '../data/emails.json';
import greglistBuyers from '../data/gregslistBuyers.json';

export type ItemType = keyof typeof itemsData;

export const ITEM_DATA = itemsData as Record<ItemType, {
  name: { en: string; fr: string };
  price: number;
  courageNeeded: number;
  courageYield: number;
  description: { en: string; fr: string };
}>;

export type GeneratorType = keyof typeof generatorsData;

export const GENERATOR_DATA = generatorsData as Record<GeneratorType, {
  name: { en: string; fr: string };
  cost: number;
  description: { en: string; fr: string };
}>;

// Added back inventory
export interface Inventory {
  paper: number;
  paperclip: number;
  pen: number;
  stapler: number;
  coffee: number;
  cable: number;
  data: number;
  gossip: number;
}

export interface Generators {
  intern: number;
  itGuy: number;
  manager: number;
  hr: number;
}

export interface Ad {
  id: string;
  item: ItemType;
  amount: number;
  expectedReturn: number;
  timeRemaining: number;
}

export interface Email {
  id: string;
  sender: string;
  subject: { en: string; fr: string } | string;
  body: { en: string; fr: string } | string;
  read: boolean;
  timestamp: string;
}

interface GameState {
  cash: number;
  courage: number;
  suspicion: number;
  lastStealTime: number;
  lastPaidTime: number;
  inventory: Inventory;
  generators: Generators;
  activeAds: Ad[];
  emails: Email[];
  
  // Actions
  stealItem: (item: ItemType) => void;
  sellItem: (item: ItemType, amount: number, price: number) => void;
  createAd: (item: ItemType, amount: number) => void;
  buyGenerator: (type: GeneratorType, cost: number) => void;
  performCorporateTask: (cashEarned: number, courageDrain: number) => void;
  readEmail: (id: string) => void;
  tick: () => void;
  reset: () => void;
}

const initialInventory: Inventory = {
  paper: 0,
  paperclip: 0,
  pen: 0,
  stapler: 0,
  coffee: 0,
  cable: 0,
  data: 0,
  gossip: 0,
};

const initialGenerators: Generators = {
  intern: 0,
  itGuy: 0,
  manager: 0,
  hr: 0,
};

// Helper for playing email sounds
const playEmailSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio play prevented", e);
  }
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      cash: 0,
      courage: 0,
      suspicion: 0,
      lastStealTime: 0,
      lastPaidTime: Date.now(),
      inventory: initialInventory,
      generators: initialGenerators,
      activeAds: [],
      emails: [],

      stealItem: (item) =>
        set((state) => {
          if (state.courage < ITEM_DATA[item].courageNeeded) return state;
          
          const now = Date.now();
          const timeSinceLastSteal = now - state.lastStealTime;
          
          let suspicionGain = Math.max(0.5, ITEM_DATA[item].courageNeeded * 2);
          
          if (timeSinceLastSteal < 1000) {
            suspicionGain *= (2000 / (timeSinceLastSteal + 1));
          }
          
          let newSuspicion = state.suspicion + suspicionGain;
          let newInventory = { ...state.inventory, [item]: state.inventory[item] + 1 };
          let newCash = state.cash;
          
          if (newSuspicion >= 100) {
             newSuspicion = 0;
             newInventory = { ...initialInventory };
             newCash = Math.max(0, state.cash * 0.5);
          }
          
          return {
            courage: Math.min(100, state.courage + ITEM_DATA[item].courageYield),
            inventory: newInventory,
            cash: newCash,
            suspicion: newSuspicion,
            lastStealTime: now,
          };
        }),

      sellItem: (item, amount, price) =>
        set((state) => {
          if (state.inventory[item] < amount) return state;
          return {
            inventory: {
              ...state.inventory,
              [item]: state.inventory[item] - amount,
            },
            cash: state.cash + price,
          };
        }),

      createAd: (item, amount) =>
        set((state) => {
          if (state.inventory[item] < amount || amount <= 0) return state;
          const newAd: Ad = {
            id: Math.random().toString(36).substr(2, 9),
            item,
            amount,
            expectedReturn: amount * ITEM_DATA[item].price,
            timeRemaining: 3 + Math.floor(Math.random() * 1497), // 3 to 1500 seconds (25 minutes)
          };
          return {
            inventory: {
              ...state.inventory,
              [item]: state.inventory[item] - amount,
            },
            activeAds: [...state.activeAds, newAd],
          };
        }),

      buyGenerator: (type, cost) =>
        set((state) => {
          if (state.cash < cost) return state;
          return {
            cash: state.cash - cost,
            generators: {
              ...state.generators,
              [type]: state.generators[type] + 1,
            },
          };
        }),

      performCorporateTask: (cashEarned, courageDrain) =>
        set((state) => ({
          cash: state.cash + cashEarned,
          courage: Math.max(0, state.courage - courageDrain),
          suspicion: Math.max(0, state.suspicion - 5),
        })),

      readEmail: (id) => 
        set((state) => ({
          emails: state.emails.map(email => email.id === id ? { ...email, read: true } : email)
        })),

      tick: () =>
        set((state) => {
          let newEmails = [...state.emails];
          let playedSound = false;

          // Process Scripted Emails
          const scriptedEmails: Array<{ id: string; condition: { type: string; threshold?: number }; sender: string; subject: { en: string; fr: string }; body: { en: string; fr: string } }> = (emailsData.composeTemplates as any[]).filter(email => email.id && email.condition);
          scriptedEmails.forEach((scriptedEmail) => {
            // Check if already sent
            if (newEmails.some(e => e.id === scriptedEmail.id)) return;

            let conditionMet = false;
            if (scriptedEmail.condition.type === 'startup') {
              conditionMet = true;
            } else if (scriptedEmail.condition.type === 'courage' && state.courage >= (scriptedEmail.condition.threshold || 0)) {
              conditionMet = true;
            } else if (scriptedEmail.condition.type === 'cash' && state.cash >= (scriptedEmail.condition.threshold || 0)) {
              conditionMet = true;
            }

            if (conditionMet) {
              newEmails.push({
                id: scriptedEmail.id,
                sender: scriptedEmail.sender,
                subject: scriptedEmail.subject,
                body: scriptedEmail.body,
                read: false,
                timestamp: new Date().toISOString()
              });
              playedSound = true;
            }
          });

          // Generators logic - 1 per hour (1/3600 per second tick)
          const internItems = state.generators.intern * (1/3600);
          const itGuyItems = state.generators.itGuy * (1/3600);
          const managerItems = state.generators.manager * (1/3600);
          const hrItems = state.generators.hr * (1/3600);

          const newCoffee = state.inventory.coffee + internItems;
          const newCables = state.inventory.cable + itGuyItems;
          const newData = state.inventory.data + managerItems;
          const newGossip = state.inventory.gossip + hrItems;

          const courageGained = 
            (internItems * ITEM_DATA.coffee.courageYield) +
            (itGuyItems * ITEM_DATA.cable.courageYield) +
            (managerItems * ITEM_DATA.data.courageYield) +
            (hrItems * ITEM_DATA.gossip.courageYield);

          const newCourage = Math.min(100, state.courage + courageGained);

          // Passive cash from gossip (tumblr ad revenue)
          // Let's say 1 gossip = $0.05 per second passive income
          let newCash = state.cash + (state.inventory.gossip * 0.05);

          let newSuspicion = Math.max(0, state.suspicion - 0.1);
          
          const now = Date.now();
          const msPerWeek = 7 * 24 * 60 * 60 * 1000;
          let newGenerators = { ...state.generators };
          let newLastPaidTime = state.lastPaidTime;
          
          if (now - state.lastPaidTime >= msPerWeek) {
            let totalSalary = 0;
            totalSalary += newGenerators.intern * GENERATOR_DATA.intern.cost;
            totalSalary += newGenerators.itGuy * GENERATOR_DATA.itGuy.cost;
            totalSalary += newGenerators.manager * GENERATOR_DATA.manager.cost;
            totalSalary += newGenerators.hr * GENERATOR_DATA.hr.cost;
            
            if (newCash >= totalSalary) {
                newCash -= totalSalary;
                newLastPaidTime = now;
            } else if (totalSalary > 0) {
                newGenerators = { ...initialGenerators };
                newLastPaidTime = now;
                newEmails.push({
                   id: Math.random().toString(36).substr(2, 9),
                   sender: "HR Department <hr@corp.com>",
                   subject: { en: "Notice of Resignation", fr: "Avis de démission" },
                   body: { en: "Your contracted employees have left due to unpaid weekly fees.", fr: "Vos employés contractuels sont partis en raison du non-paiement des frais hebdomadaires." },
                   read: false,
                   timestamp: new Date().toISOString()
                });
                playedSound = true;
            } else {
                newLastPaidTime = now;
            }
          }

          // Process Ads
          let adSold = false;
          const newAds = state.activeAds.map(ad => ({
            ...ad,
            timeRemaining: ad.timeRemaining - 1
          })).filter(ad => {
            if (ad.timeRemaining <= 0) {
              newCash += ad.expectedReturn;
              
              const buyerName = greglistBuyers[Math.floor(Math.random() * greglistBuyers.length)];
              const itemName = ITEM_DATA[ad.item].name.en;
              newEmails.push({
                id: Math.random().toString(36).substr(2, 9),
                sender: `${buyerName} (via greglist) <gregslist-noreply@gregslist.com>`,
                subject: { en: `Your ad for ${ad.amount}x ${itemName} has sold!`, fr: `Votre annonce pour ${ad.amount}x ${itemName} a été vendue !` },
                body: { en: `${buyerName} has purchased your items. $${ad.expectedReturn.toFixed(2)} has been wired to your bank account.`, fr: `${buyerName} a acheté vos articles. ${ad.expectedReturn.toFixed(2)}$ a été déposé sur votre compte bancaire.` },
                read: false,
                timestamp: new Date().toISOString()
              });
              adSold = true;

              return false;
            }
            return true;
          });

          if (adSold || playedSound) {
            playEmailSound();
          }

          return {
            cash: newCash,
            courage: newCourage,
            suspicion: newSuspicion,
            lastPaidTime: newLastPaidTime,
            generators: newGenerators,
            activeAds: newAds,
            emails: newEmails,
            inventory: {
              ...state.inventory,
              coffee: newCoffee,
              cable: newCables,
              data: newData,
              gossip: newGossip,
            },
          };
        }),
        
      reset: () => set({ cash: 0, courage: 0, suspicion: 0, lastStealTime: 0, lastPaidTime: Date.now(), inventory: initialInventory, generators: initialGenerators, activeAds: [], emails: [] }),
    }),
    {
      name: 'corporate-resell-storage-v2',
    }
  )
);
