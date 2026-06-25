'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ActivityCard from '@/components/ActivityCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import ItineraryView from '@/components/ItineraryView';
import { buildMapActivities, type ItineraryRouteItem } from '@/lib/map-activities';
import { compareItineraryTimeBlock } from '@/lib/time-block';
import { computeTripReadiness } from '@/lib/trip-readiness';
import { normalizeActivities, normalizeItineraryItems } from './adapters';
import type { Activity, ChatPlanResponse, ItineraryItem, Tab, Trip } from './types';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });
const GoogleMapView = dynamic(() => import('@/components/GoogleMapView'), { ssr: false });

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('activities');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'city' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualType, setManualType] = useState('place');
  const [manualSuggestedTime, setManualSuggestedTime] = useState('afternoon');
  const [manualDurationMinutes, setManualDurationMinutes] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [isManualAdvancedOpen, setIsManualAdvancedOpen] = useState(false);
  const [creatingManual, setCreatingManual] = useState(false);
  const [fillingDetails, setFillingDetails] = useState(false);
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>('google');
  const [mapFocusTrigger, setMapFocusTrigger] = useState(0);
  const [showItineraryRoute, setShowItineraryRoute] = useState(false);
  const [itineraryDayFilter, setItineraryDayFilter] = useState<'all' | number>('all');
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [scheduleStartDateInput, setScheduleStartDateInput] = useState('');
  const [scheduleDurationDaysInput, setScheduleDurationDaysInput] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [addingDay, setAddingDay] = useState(false);
  const [deletingDay, setDeletingDay] = useState<number | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [planningChat, setPlanningChat] = useState(false);
  const [executingChat, setExecutingChat] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatPreview, setChatPreview] = useState<ChatPlanResponse | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [revokingLink, setRevokingLink] = useState(false);
  const [copyLinkMsg, setCopyLinkMsg] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [weatherByDay, setWeatherByDay] = useState<Record<number, { date: string; weathercode: number; temp_max: number; temp_min: number; emoji: string; label: string }>>({});

  const fetchAll = useCallback(async () => {
    try {
      const [tripRes, activitiesRes, itineraryRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/activities?sortBy=${sortBy}&order=${sortOrder}`),
        fetch(`/api/trips/${tripId}/itinerary`),
      ]);
      const [tripData, activitiesData, itineraryData] = await Promise.all([
        tripRes.json(),
        activitiesRes.json(),
        itineraryRes.json(),
      ]);
      setTrip(tripData);
      setActivities(normalizeActivities(activitiesData));
      setItinerary(normalizeItineraryItems(itineraryData));
      if (tripData?.cities) {
        const cities = JSON.parse(tripData.cities);
        if (cities.length > 0) setSelectedCity(cities[0]);
      }
      if (tripData?.shareToken) setShareToken(tripData.shareToken as string);
    } finally {
      setLoading(false);
    }
  }, [tripId, sortBy, sortOrder]);

  useEffect(() => {
    if (tripId) {
      fetchAll();
    }
  }, [tripId, fetchAll]);

  useEffect(() => {
    if (!manualCity && selectedCity) {
      setManualCity(selectedCity);
    }
  }, [selectedCity, manualCity]);

  useEffect(() => {
    if (!trip || editingSchedule) return;
    setScheduleStartDateInput(trip.startDate || '');
    setScheduleDurationDaysInput(trip.durationDays != null ? String(trip.durationDays) : '');
  }, [trip, editingSchedule]);

  const mapActivities = useMemo(() => buildMapActivities(activities, itinerary), [activities, itinerary]);

  const itineraryRoute = useMemo<ItineraryRouteItem[]>(() => {
    return [...itinerary]
      .sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        const tbCompare = compareItineraryTimeBlock(a.timeBlock, b.timeBlock);
        if (tbCompare !== 0) return tbCompare;
        return a.order - b.order;
      })
      .map((item) => ({
        activityId: item.activity.id,
        day: item.day,
        lat: item.activity.lat,
        lng: item.activity.lng,
      }));
  }, [itinerary]);

  const itineraryDays = useMemo(
    () => [...new Set(itinerary.map((item) => item.day))].sort((a, b) => a - b),
    [itinerary]
  );

  async function handleGenerate() {
    if (!selectedCity) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: selectedCity }),
      });
      if (res.ok) {
        const newActivities = await res.json();
        setActivities(prev => [...normalizeActivities(newActivities), ...prev]);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreateManualActivity(e: React.FormEvent) {
    e.preventDefault();
    setCreatingManual(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'manual',
          title: manualTitle,
          description: manualDescription,
          city: manualCity || selectedCity,
          type: manualType,
          suggestedTime: manualSuggestedTime,
          durationMinutes: manualDurationMinutes ? Number(manualDurationMinutes) : null,
          lat: manualLat ? Number(manualLat) : null,
          lng: manualLng ? Number(manualLng) : null,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setActivities(prev => [created, ...prev]);
        setManualTitle('');
        setManualDescription('');
        setManualDurationMinutes('');
        setManualLat('');
        setManualLng('');
        setIsManualAdvancedOpen(false);
        setIsManualFormOpen(false);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || '無法建立活動，請檢查欄位後再試一次。');
      }
    } finally {
      setCreatingManual(false);
    }
  }

  async function handleFillWithAI() {
    const city = manualCity || selectedCity;
    if (!manualTitle || !city) return;
    setFillingDetails(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/activities/fill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: manualTitle, city }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) setManualDescription(data.description);
        if (data.type) setManualType(data.type);
        if (data.suggestedTime) setManualSuggestedTime(data.suggestedTime);
        if (data.durationMinutes) setManualDurationMinutes(String(data.durationMinutes));
        if (data.lat != null) setManualLat(String(data.lat));
        if (data.lng != null) setManualLng(String(data.lng));
      }
    } finally {
      setFillingDetails(false);
    }
  }

  async function handleApprove(activityId: string) {
    const res = await fetch(`/api/activities/${activityId}/approve`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setActivities(prev => prev.map(p => p.id === activityId ? { ...p, status: 'approved' } : p));
      if (data.itineraryItem) {
        setItinerary(prev => [...prev, ...normalizeItineraryItems([data.itineraryItem])]);
      }
    }
  }

  async function handleReject(activityId: string) {
    const res = await fetch(`/api/activities/${activityId}/reject`, { method: 'POST' });
    if (res.ok) {
      setActivities(prev => prev.map(p => p.id === activityId ? { ...p, status: 'rejected' } : p));
      setItinerary(prev => prev.filter(item => item.activity.id !== activityId));
    }
  }

  async function handleOrganizeItinerary() {
    setOrganizing(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/itinerary`, { method: 'POST' });
      if (res.ok) {
        const organized = await res.json();
        setItinerary(organized);
      }
    } finally {
      setOrganizing(false);
    }
  }

  async function handleReorderItinerary(updates: { id: string; day: number; timeBlock: string; order: number }[]) {
    // Optimistically apply the reorder to the local state
    const updatesById = new Map(updates.map(u => [u.id, u]));
    const reordered = [...itinerary]
      .map(item => {
        const u = updatesById.get(item.id);
        return u ? { ...item, day: u.day, timeBlock: u.timeBlock, order: u.order } : item;
      })
      .sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        const timeBlockCmp = compareItineraryTimeBlock(a.timeBlock, b.timeBlock);
        if (timeBlockCmp !== 0) return timeBlockCmp;
        return a.order - b.order;
      });
    setItinerary(reordered);
    try {
      const res = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        // Revert on API error
        fetchAll();
      }
    } catch {
      // Revert on network error
      fetchAll();
    }
  }

  async function handleAddItineraryDay() {
    setAddingDay(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/itinerary/days`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.trip) {
        setTrip((prev) => (prev ? { ...prev, ...data.trip } : prev));
      } else {
        alert(data.error || '無法新增行程日。');
      }
    } finally {
      setAddingDay(false);
    }
  }

  async function handleDeleteEmptyDay(day: number) {
    setDeletingDay(day);
    try {
      const res = await fetch(`/api/trips/${tripId}/itinerary/days`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.trip) setTrip((prev) => (prev ? { ...prev, ...data.trip } : prev));
        if (Array.isArray(data.itinerary)) setItinerary(data.itinerary);
      } else {
        alert(data.error || '無法刪除行程日。');
      }
    } finally {
      setDeletingDay(null);
    }
  }

  async function handleDeleteTrip() {
    setConfirmDialog({
      message: '要刪除這趟旅程嗎？所有活動與行程都會永久移除。',
      onConfirm: async () => {
        setConfirmDialog(null);
        const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
        if (res.ok) {
          router.push('/');
        } else {
          alert('無法刪除旅程，請再試一次。');
        }
      },
    });
  }

  async function handleDeleteActivity(activityId: string) {
    setConfirmDialog({
      message: '要刪除這個活動嗎？此操作無法復原。',
      onConfirm: async () => {
        setConfirmDialog(null);
        const res = await fetch(`/api/activities/${activityId}`, { method: 'DELETE' });
        if (res.ok) {
          setActivities(prev => prev.filter(p => p.id !== activityId));
          setItinerary(prev => prev.filter(item => item.activity.id !== activityId));
        } else {
          alert('無法刪除活動，請再試一次。');
        }
      },
    });
  }

  async function handleShareTrip(e: React.FormEvent) {
    e.preventDefault();
    setSharing(true);
    setShareMessage('');
    try {
      const res = await fetch(`/api/trips/${tripId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: shareEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShareMessage(`已分享給 ${data.user?.email || shareEmail}`);
        setShareEmail('');
      } else {
        setShareMessage(data.error || '分享旅程失敗');
      }
    } finally {
      setSharing(false);
    }
  }

  async function handleAddGooglePlace(place: {
    placeId: string;
    title: string;
    lat: number;
    lng: number;
    city: string;
    formattedAddress: string;
    types: string[];
  }) {
    const res = await fetch(`/api/trips/${tripId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'google_place',
        placeId: place.placeId,
        title: place.title,
        city: place.city || selectedCity,
        lat: place.lat,
        lng: place.lng,
        formattedAddress: place.formattedAddress,
        types: place.types,
      }),
    });

    if (res.ok) {
      const created = await res.json();
      setActivities((prev) => [created, ...prev]);
      return;
    }

    const data = await res.json().catch(() => ({}));
    alert(data.error || '無法從 Google Maps 加入地點。');
  }

  async function handlePlanChat() {
    if (!chatMessage.trim()) return;
    setPlanningChat(true);
    setChatError('');
    setChatPreview(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/chat/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatMessage.trim(),
          context: {
            selectedCity,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setChatPreview({
          summary: data.summary || '',
          actionPlan: Array.isArray(data.actionPlan) ? data.actionPlan : [],
        });
      } else {
        setChatError(data.error || '無法預覽 AI 助理變更。');
      }
    } finally {
      setPlanningChat(false);
    }
  }

  async function handleConfirmChat() {
    if (!chatPreview) return;
    setExecutingChat(true);
    setChatError('');
    try {
      const res = await fetch(`/api/trips/${tripId}/chat/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionPlan: chatPreview.actionPlan }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.trip) setTrip((prev) => (prev ? { ...prev, ...data.trip } : prev));
        if (Array.isArray(data.activities)) setActivities(normalizeActivities(data.activities));
        if (Array.isArray(data.itinerary)) setItinerary(normalizeItineraryItems(data.itinerary));
        setChatPreview(null);
      } else {
        setChatError(data.error || '無法套用 AI 助理變更。');
      }
    } finally {
      setExecutingChat(false);
    }
  }

  function handleStartEditSchedule() {
    if (!trip) return;
    setScheduleStartDateInput(trip.startDate || '');
    setScheduleDurationDaysInput(trip.durationDays != null ? String(trip.durationDays) : '');
    setEditingSchedule(true);
  }

  async function handleSaveSchedule(e: React.FormEvent) {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: scheduleStartDateInput || '',
          durationDays: scheduleDurationDaysInput || '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTrip((prev) => (prev ? { ...prev, ...data } : prev));
        setEditingSchedule(false);
      } else {
        alert(data.error || '無法更新旅程日期。');
      }
    } finally {
      setSavingSchedule(false);
    }
  }

  async function handleClearSchedule() {
    setSavingSchedule(true);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: '',
          durationDays: '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTrip((prev) => (prev ? { ...prev, ...data } : prev));
        setScheduleStartDateInput('');
        setScheduleDurationDaysInput('');
        setEditingSchedule(false);
      } else {
        alert(data.error || '無法清除旅程日期。');
      }
    } finally {
      setSavingSchedule(false);
    }
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === 'map') {
      setMapFocusTrigger((prev) => prev + 1);
    }
    if (tab === 'itinerary') {
      fetchWeather();
    }
  }

  async function fetchWeather() {
    if (!trip?.startDate || !trip.cities) return;
    const cities: string[] = JSON.parse(trip.cities);
    if (!cities.length) return;
    const primaryCity = cities[0];
    const days = Math.min(Math.max(trip.durationDays ?? 7, 7), 16);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(primaryCity)}&startDate=${trip.startDate}&days=${days}`);
      if (!res.ok) return;
      const data = await res.json() as { forecasts: { date: string; weathercode: number; temp_max: number; temp_min: number; emoji: string; label: string }[] };
      if (!Array.isArray(data.forecasts) || !trip.startDate) return;
      const startDateObj = new Date(`${trip.startDate}T00:00:00Z`);
      const byDay: Record<number, { date: string; weathercode: number; temp_max: number; temp_min: number; emoji: string; label: string }> = {};
      data.forecasts.forEach(f => {
        const fDate = new Date(`${f.date}T00:00:00Z`);
        const diffDays = Math.round((fDate.getTime() - startDateObj.getTime()) / 86400000);
        const day = diffDays + 1;
        if (day >= 1) byDay[day] = f;
      });
      setWeatherByDay(byDay);
    } catch {
      // weather is non-critical, ignore errors
    }
  }

  async function handleGenerateShareLink() {
    setGeneratingLink(true);
    setCopyLinkMsg('');
    try {
      const res = await fetch(`/api/trips/${tripId}/public-link`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json() as { shareToken: string };
        setShareToken(data.shareToken);
      }
    } finally {
      setGeneratingLink(false);
    }
  }

  async function handleRevokeShareLink() {
    setRevokingLink(true);
    setCopyLinkMsg('');
    try {
      const res = await fetch(`/api/trips/${tripId}/public-link`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setShareToken(null);
      }
    } finally {
      setRevokingLink(false);
    }
  }

  function handleCopyShareLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    try {
      navigator.clipboard.writeText(url).then(() => {
        setCopyLinkMsg('已複製');
        setTimeout(() => setCopyLinkMsg(''), 2000);
      }).catch(() => {
        setCopyLinkMsg(url);
      });
    } catch {
      setCopyLinkMsg(url);
    }
  }

  async function handleApproveAll() {
    setApprovingAll(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/activities/approve-all`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.activities)) {
          setActivities((prev) =>
            prev.map((a) => {
              const updated = (data.activities as Activity[]).find((u) => u.id === a.id);
              return updated ?? a;
            })
          );
        }
        if (Array.isArray(data.itineraryItems)) {
          setItinerary((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = normalizeItineraryItems(data.itineraryItems).filter(
              (item) => !existingIds.has(item.id)
            );
            return [...prev, ...newItems];
          });
        }
      }
    } finally {
      setApprovingAll(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 spinner-gradient"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">找不到旅程</p>
        <Link href="/" className="text-stone-700 hover:underline mt-4 inline-block">← 返回旅程</Link>
      </div>
    );
  }

  const cities: string[] = JSON.parse(trip.cities);
  const tripSchedule = trip.startDate || trip.durationDays
    ? [
      trip.startDate ?? null,
      trip.durationDays ? `${trip.durationDays} 天` : null,
    ].filter(Boolean).join(' · ')
    : '彈性日期';
  const canEdit = trip.currentRole === 'owner';
  const pendingCount = activities.filter((a) => a.status === 'pending').length;
  const approvedCount = activities.filter((a) => a.status === 'approved').length;
  const filteredActivities = activities.filter((activity) => {
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || activity.title.toLowerCase().includes(q) || activity.description.toLowerCase().includes(q) || activity.city.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
  const arrangedMapCount = mapActivities.filter((activity) => activity.isArranged).length;
  const conciergeReadiness = computeTripReadiness({
    destinationCount: cities.length,
    hasSchedule: Boolean(trip.startDate || trip.durationDays),
    activitiesCount: activities.length,
    approvedCount,
    itineraryItemsCount: itinerary.length,
    mappedArrangedCount: arrangedMapCount,
    hasShareLink: Boolean(shareToken),
  });
  const maxItineraryDay = itinerary.reduce((max, item) => Math.max(max, item.day), 0);
  const hasOverRangeDays = typeof trip.durationDays === 'number' && trip.durationDays > 0 && maxItineraryDay > trip.durationDays;
  const incompleteReadinessItems = conciergeReadiness.checklist.filter((item) => !item.complete).slice(0, 2);
  const readinessIsComplete = conciergeReadiness.score === 100;
  const readinessIsLow = conciergeReadiness.score < 50;
  const readinessStageLabel: Record<string, string> = {
    Briefing: '簡報中',
    Curation: '整理中',
    Flow: '排程中',
    Logistics: '路線確認',
    'Guest-ready': '可分享',
  };
  const readinessItemLabel: Record<string, string> = {
    'trip-frame': '補上日期或天數',
    'signature-shortlist': '建立靈感清單',
    'curated-approvals': '核准合適靈感',
    'day-flow': '排進每日行程',
    'route-confidence': '確認地圖路線',
    'shared-dossier': '建立分享連結',
  };
  const readinessNextStepCopy: Record<string, string> = {
    'Set dates or trip duration so the itinerary can be paced with confidence.': '補上日期或天數，行程節奏才有可信基準。',
    'Curate signature experiences before shaping the day-by-day flow.': '先建立代表目的地的靈感清單。',
    'Approve the best-fit experiences and remove distractions from the shortlist.': '核准最合適的靈感，移除干擾。',
    'Arrange approved experiences into a graceful day-by-day rhythm.': '把已核准的靈感排成每日節奏。',
    'Confirm mapped route confidence before sharing the dossier.': '分享前先確認地圖與路線信心。',
    'Generate a read-only share link for traveler handoff.': '建立唯讀分享連結，準備交付旅伴。',
    'Ready for final concierge review and traveler handoff.': '已可進行最後檢查並分享給旅伴。',
  };
  const readinessNextStep = readinessNextStepCopy[conciergeReadiness.nextStep] ?? conciergeReadiness.nextStep;
  const statusFilterOptions = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待審核' },
    { value: 'approved', label: '已核准' },
    { value: 'rejected', label: '已排除' },
  ];
  const activityTypeOptions = [
    { value: 'place', label: '景點' },
    { value: 'food', label: '餐飲' },
  ];
  const timeBlockOptions = [
    { value: 'morning', label: '上午' },
    { value: 'lunch', label: '午餐' },
    { value: 'afternoon', label: '下午' },
    { value: 'dinner', label: '晚餐' },
    { value: 'night', label: '夜間' },
  ];

  return (
    <div className="bg-[#fbfaf7] text-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-5">
          <Link href="/" className="inline-flex rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-bold text-stone-600 shadow-sm transition-colors hover:bg-stone-50">← 返回旅程</Link>
        </div>

        <section className="mb-6 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-stone-500">
                <span>{cities.length} 個目的地</span>
                <span>·</span>
                <span>{cities.join(' · ')}</span>
              </div>
              <h1 className="mt-3 max-w-4xl font-serif text-5xl font-bold tracking-tight text-stone-950 sm:text-6xl">
                {trip.name}
              </h1>

              {editingSchedule ? (
                <form onSubmit={handleSaveSchedule} className="mt-5 flex flex-col gap-3 rounded-3xl border border-stone-200 bg-stone-50 p-4 sm:flex-row sm:items-end">
                  <div>
                    <label htmlFor="schedule-start-date" className="mb-1 block text-xs font-bold text-stone-500">開始日期</label>
                    <input
                      id="schedule-start-date"
                      type="date"
                      value={scheduleStartDateInput}
                      onChange={(e) => setScheduleStartDateInput(e.target.value)}
                      className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="schedule-duration-days" className="mb-1 block text-xs font-bold text-stone-500">天數</label>
                    <input
                      id="schedule-duration-days"
                      type="number"
                      min={1}
                      step={1}
                      value={scheduleDurationDaysInput}
                      onChange={(e) => setScheduleDurationDaysInput(e.target.value)}
                      placeholder="例如 5"
                      className="w-36 rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingSchedule}
                      className="rounded-full bg-[#7a3f18] px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-[#653314] disabled:opacity-50"
                    >
                      {savingSchedule ? '儲存中...' : '儲存'}
                    </button>
                    <button
                      type="button"
                      disabled={savingSchedule}
                      onClick={() => setEditingSchedule(false)}
                      className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      disabled={savingSchedule}
                      onClick={handleClearSchedule}
                      className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-500 hover:text-stone-800 disabled:opacity-50"
                    >
                      清除
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-bold text-stone-700">{tripSchedule}</span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={handleStartEditSchedule}
                      className="text-sm font-bold text-stone-700 underline-offset-4 hover:underline"
                    >
                      編輯日期
                    </button>
                  )}
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTabChange('itinerary')}
                  className="rounded-full bg-[#7a3f18] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#653314]"
                >
                  開啟行程
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('activities')}
                  className="rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-black text-stone-700 shadow-sm transition hover:bg-stone-50"
                >
                  檢視靈感
                </button>
              </div>
            </div>

            <div className="flex shrink-0 justify-end">
              <button
                type="button"
                aria-label="旅程設定"
                onClick={() => setIsSettingsOpen((open) => !open)}
                className="grid h-11 w-11 place-items-center rounded-full border border-stone-200 bg-white text-lg text-stone-700 shadow-sm transition hover:bg-stone-50"
              >
                ⚙️
              </button>
            </div>
          </div>

          <div className="mt-7 border-t border-stone-100 pt-5">
            {readinessIsComplete ? (
              <div data-testid="readiness-complete-actions" className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-black">已備好可分享</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="rounded-full bg-white px-4 py-2 text-xs font-black text-emerald-800 shadow-sm ring-1 ring-emerald-100"
                  >
                    複製連結
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="rounded-full border border-emerald-200 bg-emerald-600 px-4 py-2 text-xs font-black text-white"
                  >
                    傳給旅伴
                  </button>
                </div>
              </div>
            ) : (
              <div data-testid={readinessIsLow ? 'readiness-todo' : 'readiness-progress'} className={`rounded-2xl border px-4 py-3 ${readinessIsLow ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-stone-50'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-stone-950">{readinessStageLabel[conciergeReadiness.stage] ?? conciergeReadiness.stage} · {conciergeReadiness.score}%</p>
                    <p className="mt-1 text-sm leading-6 text-stone-600">{readinessNextStep}</p>
                  </div>
                  {incompleteReadinessItems.length > 0 && (
                    <div className="text-sm text-stone-600">
                      <span className="font-bold text-stone-900">需補：</span>
                      {incompleteReadinessItems.map((item) => readinessItemLabel[item.id] ?? item.label).join('、')}
                    </div>
                  )}
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className={`h-full rounded-full ${readinessIsLow ? 'bg-[#7a3f18]' : 'bg-stone-900'}`} style={{ width: `${conciergeReadiness.score}%` }} />
                </div>
              </div>
            )}
          </div>
        </section>

        {isSettingsOpen && (
          <section className="mb-6 rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-stone-950">旅程設定</h2>
              <button type="button" onClick={() => setIsSettingsOpen(false)} className="rounded-full border border-stone-200 px-3 py-1 text-sm font-bold text-stone-500 hover:bg-stone-50">關閉</button>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <Link
                href={`/trips/${tripId}/preferences`}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-100"
              >
                偏好設定
              </Link>

              {trip.currentRole === 'owner' && (
                <div className="space-y-3 lg:col-span-1">
                  <form onSubmit={handleShareTrip} className="space-y-2">
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="輸入 Email 分享"
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                    />
                    <button
                      type="submit"
                      disabled={sharing}
                      className="w-full rounded-full bg-[#7a3f18] px-4 py-2 text-sm font-black text-white hover:bg-[#653314] disabled:opacity-50"
                    >
                      {sharing ? '分享中...' : '分享'}
                    </button>
                    {shareMessage && <span className="text-sm text-stone-500">{shareMessage}</span>}
                  </form>
                  {shareToken ? (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-50"
                      >
                        複製公開連結
                      </button>
                      <button
                        type="button"
                        onClick={handleRevokeShareLink}
                        disabled={revokingLink}
                        className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-500 transition-colors hover:text-stone-800 disabled:opacity-50"
                      >
                        {revokingLink ? '撤銷中...' : '撤銷連結'}
                      </button>
                      {copyLinkMsg && <span className="text-xs font-bold text-emerald-600">{copyLinkMsg}</span>}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerateShareLink}
                      disabled={generatingLink}
                      className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-50"
                    >
                      {generatingLink ? '建立中...' : '建立公開連結'}
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {conciergeReadiness.checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border px-3 py-2 text-sm ${item.complete ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-stone-50 text-stone-500'}`}
                    title={item.detail}
                  >
                    <span className="font-black">{item.complete ? '✓' : '○'} {readinessItemLabel[item.id] ?? item.label}</span>
                  </div>
                ))}
              </div>

              {trip.currentRole === 'owner' && (
                <button
                  type="button"
                  onClick={handleDeleteTrip}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-500 transition-colors hover:text-stone-900"
                >
                  刪除旅程
                </button>
              )}
            </div>
          </section>
        )}

        <section data-testid="planning-pipeline" className="mb-6 rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm font-black text-stone-700">
            <span>{activities.length} 個靈感</span>
            <span className="text-stone-300">→</span>
            <span>{approvedCount} 已核准</span>
            <span className="text-stone-300">→</span>
            <span>{itinerary.length} 已排程</span>
            <span className="text-stone-300">→</span>
            <span>{arrangedMapCount} 已上圖</span>
          </div>
        </section>

        <div className="mb-0 rounded-t-[1.5rem] border border-b-0 border-stone-200 bg-white p-2 shadow-sm">
          <div className="flex flex-wrap gap-1">
            {(['activities', 'itinerary', 'map', ...(canEdit ? (['ai'] as Tab[]) : [])] as Tab[]).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`px-5 py-2 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                {tab === 'activities' ? (
                  <span className="flex items-center gap-1.5">
                    靈感
                    {pendingCount > 0 && (
                      <span data-testid="activities-tab-badge" className="rounded-full bg-stone-200 px-1.5 py-0.5 text-xs font-bold leading-none text-stone-900">
                        {pendingCount}
                      </span>
                    )}
                  </span>
                ) : tab === 'itinerary' ? '行程' : tab === 'map' ? '地圖' : 'AI 助理'}
              </button>
            ))}
          </div>
        </div>

      {activeTab === 'activities' && (
        <div>
          <div className="mb-6 rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                aria-label="選擇城市"
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-800 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !canEdit}
                className="rounded-full bg-[#7a3f18] px-5 py-2 text-sm font-black text-white shadow-sm transition hover:bg-[#653314] disabled:opacity-50"
              >
                {generating ? '產生中...' : '產生靈感'}
              </button>
              {canEdit && pendingCount > 0 && (
                <button
                  type="button"
                  onClick={handleApproveAll}
                  disabled={approvingAll}
                  className="rounded-full border border-stone-200 bg-white px-5 py-2 text-sm font-black text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
                >
                  {approvingAll ? '核准中...' : `全部核准（${pendingCount}）`}
                </button>
              )}
              <div className="flex flex-1 flex-wrap gap-2 lg:justify-end">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜尋活動"
                  className="w-44 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-900 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'createdAt' | 'title' | 'city' | 'status')}
                  aria-label="排序欄位"
                  className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                >
                  <option value="createdAt">建立時間</option>
                  <option value="title">名稱</option>
                  <option value="city">城市</option>
                  <option value="status">狀態</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
                  aria-label="排序方向"
                  className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                >
                  <option value="desc">新到舊</option>
                  <option value="asc">舊到新</option>
                </select>
                {statusFilterOptions.map(status => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setFilterStatus(status.value)}
                    className={`rounded-full px-3 py-2 text-xs font-bold transition-colors ${
                      filterStatus === status.value
                        ? 'bg-stone-900 text-white'
                        : 'border border-stone-200 bg-white text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="mb-6 overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setIsManualFormOpen(prev => !prev)}
                aria-expanded={isManualFormOpen}
                aria-controls="manual-activity-form"
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-stone-50"
              >
                <span>
                  <span className="block text-sm font-black text-stone-800">手動新增活動</span>
                  <span className="mt-0.5 block text-xs text-stone-500">快速補上一個想去的地點</span>
                </span>
                <span className="text-sm text-stone-500">{isManualFormOpen ? '▾' : '▸'}</span>
              </button>
              {isManualFormOpen && (
                <form
                  id="manual-activity-form"
                  onSubmit={handleCreateManualActivity}
                  className="border-t border-stone-100 px-4 pb-4 pt-4"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      value={manualTitle}
                      onChange={e => setManualTitle(e.target.value)}
                      required
                      placeholder="活動名稱"
                      className="rounded-2xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                    />
                    <input
                      value={manualCity}
                      onChange={e => setManualCity(e.target.value)}
                      required
                      placeholder="城市"
                      className="rounded-2xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                    />
                    <textarea
                      value={manualDescription}
                      onChange={e => setManualDescription(e.target.value)}
                      required
                      placeholder="描述"
                      className="rounded-2xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100 md:col-span-2"
                      rows={2}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManualAdvancedOpen(prev => !prev)}
                    aria-expanded={isManualAdvancedOpen}
                    aria-controls="manual-activity-advanced"
                    className="mt-3 text-xs font-bold text-stone-600 underline-offset-4 hover:underline"
                  >
                    {isManualAdvancedOpen ? '隱藏進階欄位' : '顯示進階欄位'}
                  </button>
                  {isManualAdvancedOpen && (
                    <div id="manual-activity-advanced" className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <select
                        value={manualType}
                        onChange={e => setManualType(e.target.value)}
                        aria-label="活動類型"
                        className="rounded-2xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                      >
                        {activityTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <select
                        value={manualSuggestedTime}
                        onChange={e => setManualSuggestedTime(e.target.value)}
                        aria-label="建議時段"
                        className="rounded-2xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                      >
                        {timeBlockOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={manualDurationMinutes}
                        onChange={e => setManualDurationMinutes(e.target.value)}
                        placeholder="停留分鐘（選填）"
                        className="rounded-2xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                      />
                      <input
                        type="number"
                        step="any"
                        value={manualLat}
                        onChange={e => setManualLat(e.target.value)}
                        placeholder="緯度（選填）"
                        className="rounded-2xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                      />
                      <input
                        type="number"
                        step="any"
                        value={manualLng}
                        onChange={e => setManualLng(e.target.value)}
                        placeholder="經度（選填）"
                        className="rounded-2xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                      />
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={creatingManual}
                      className="rounded-full bg-[#7a3f18] px-4 py-2 text-sm font-black text-white hover:bg-[#653314] disabled:opacity-50"
                    >
                      {creatingManual ? '儲存中...' : '新增活動'}
                    </button>
                    <button
                      type="button"
                      onClick={handleFillWithAI}
                      disabled={fillingDetails || !manualTitle}
                      className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
                    >
                      {fillingDetails ? '補齊中...' : '用 AI 補齊'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {filteredActivities.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-3 text-5xl">💡</div>
              <p className="text-lg text-stone-500">尚無活動</p>
              <p className="mt-1 text-sm text-stone-400">先產生或手動新增靈感。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={canEdit ? handleDeleteActivity : undefined}
                  canEdit={canEdit}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'itinerary' && (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOrganizeItinerary}
              disabled={organizing || itinerary.length === 0 || !canEdit}
              className="rounded-full bg-[#7a3f18] px-5 py-2 text-sm font-black text-white shadow-sm transition hover:bg-[#653314] disabled:opacity-50"
            >
              {organizing ? '整理中...' : 'AI 整理行程'}
            </button>
            {canEdit && !trip.durationDays && (
              <button
                type="button"
                onClick={handleAddItineraryDay}
                disabled={addingDay}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
              >
                {addingDay ? '新增中...' : '+ 新增天數'}
              </button>
            )}
            {hasOverRangeDays && (
              <p className="text-xs text-amber-700 mt-2">
                有些行程日超過目前設定的 {trip.durationDays} 天；可保留，或把項目拖回範圍內。
              </p>
            )}
          </div>
          <ItineraryView
            items={itinerary}
            schedule={{
              startDate: trip.startDate,
              durationDays: trip.durationDays,
              itineraryVisibleDays: trip.itineraryVisibleDays,
            }}
            weatherByDay={weatherByDay}
            onReorder={canEdit ? handleReorderItinerary : undefined}
            onDeleteEmptyDay={canEdit && !trip.durationDays ? handleDeleteEmptyDay : undefined}
            deletingDay={deletingDay}
          />
        </div>
      )}

      {activeTab === 'map' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setMapProvider('google')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mapProvider === 'google' ? 'bg-stone-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Google Maps（測試）
            </button>
            <button
              type="button"
              onClick={() => setMapProvider('leaflet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mapProvider === 'leaflet' ? 'bg-stone-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Leaflet（舊版）
            </button>
          </div>
          {itinerary.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => setShowItineraryRoute((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showItineraryRoute ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {showItineraryRoute ? '🗺 路線：開' : '🗺 路線：關'}
              </button>
              {showItineraryRoute && itineraryDays.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setItineraryDayFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      itineraryDayFilter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    全部天數
                  </button>
                  {itineraryDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setItineraryDayFilter(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        itineraryDayFilter === day ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      第 {day} 天
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
          <p className="text-sm text-gray-500 mb-4">
            顯示 {arrangedMapCount} 個已排程、{mapActivities.length - arrangedMapCount} 個未排程活動（已排除不顯示）
          </p>
          {mapProvider === 'google' ? (
            <GoogleMapView
              activities={mapActivities}
              canEdit={canEdit}
              onAddPlace={handleAddGooglePlace}
              focusTrigger={mapFocusTrigger}
              itineraryRoute={itineraryRoute}
              showItineraryRoute={showItineraryRoute}
              itineraryDayFilter={itineraryDayFilter}
            />
          ) : (
            mapActivities.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-5xl mb-3">🗺️</div>
                <p className="text-gray-500">產生活動後即可在地圖查看。</p>
              </div>
            ) : (
              <MapView
                activities={mapActivities}
                itineraryRoute={itineraryRoute}
                showItineraryRoute={showItineraryRoute}
                itineraryDayFilter={itineraryDayFilter}
              />
            )
          )}
        </div>
      )}

      {activeTab === 'ai' && canEdit && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-900">AI 行程助理（測試）</h2>
          <p className="text-xs text-stone-600 mt-1">用自然語言描述想調整的內容；先預覽，再確認套用。</p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="請 AI 助理調整，例如：在東京新增壽司活動並整理行程"
              className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
            />
            <button
              type="button"
              onClick={handlePlanChat}
              disabled={planningChat || !chatMessage.trim()}
              className="bg-[#7a3f18] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#653314] disabled:opacity-50"
            >
              {planningChat ? '預覽中...' : '預覽變更'}
            </button>
          </div>
          {chatError && <p className="text-sm text-red-600 mt-2">{chatError}</p>}
          {chatPreview && (
            <div className="mt-3 rounded-lg border border-stone-200 bg-white p-3">
              <p className="text-sm text-gray-700">{chatPreview.summary || '已準備套用規劃變更。'}</p>
              <ul className="mt-2 text-xs text-gray-600 list-disc pl-4 space-y-1">
                {chatPreview.actionPlan.map((action) => (
                  <li key={`${action.type}-${JSON.stringify(action)}`}>
                    <span className="font-medium">{action.type}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirmChat}
                  disabled={executingChat}
                  className="bg-[#7a3f18] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#653314] disabled:opacity-50"
                >
                  {executingChat ? '套用中...' : '確認套用'}
                </button>
                <button
                  type="button"
                  onClick={() => setChatPreview(null)}
                  disabled={executingChat}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {confirmDialog && (
        <ConfirmDialog
          open={true}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
      </div>
    </div>
  );
}
