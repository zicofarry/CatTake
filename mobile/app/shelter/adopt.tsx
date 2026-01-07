import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, ScrollView, Image, TouchableOpacity, Alert, 
  ActivityIndicator, Dimensions, StyleSheet, Platform 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import apiClient, { API_BASE_URL } from '../../api/apiClient';
import CustomPopup from '../../components/CustomPopup';
import ConfirmModal from '../../components/ConfirmModal';

const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://192.168.1.5:3000';

// --- HELPERS ---
const resolveBackendUrl = (path: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

const resolveImageUrl = (path: string) => {
  if (!path || path === 'null') return 'https://via.placeholder.com/150';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/public/')) return `${serverUrl}${path}`;
  if (path.startsWith('profile-')) return `${serverUrl}/public/img/profile/${path}`;
  return `${serverUrl}/public/img/cats/${path}`;
};

export default function ShelterAdoptionDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // --- STATE NOTIFIKASI & HELPER ---
  const [popup, setPopup] = useState({ visible: false, title: '', message: '', type: 'success' as 'success' | 'error' });
  const [confirm, setConfirm] = useState({ visible: false, id: 0, status: '' as 'approved' | 'rejected' });

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return 'MENUNGGU';
    if (s === 'approved') return 'DISETUJUI';
    if (s === 'rejected') return 'DITOLAK';
    return status?.toUpperCase();
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/adopt/my-reports');
      setReports(response.data);
    } catch (error) {
      console.error(error);
      setPopup({ visible: true, title: 'Error', message: 'Gagal mengambil data laporan adopsi', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = (id: number, status: 'approved' | 'rejected') => {
    setConfirm({ visible: true, id, status });
  };

  const processVerification = async () => {
    const { id, status } = confirm;
    setConfirm({ ...confirm, visible: false });
    try {
      await apiClient.patch(`/adopt/verify/${id}`, { status });
      setPopup({ visible: true, title: 'Berhasil', message: 'Status adopsi berhasil diperbarui.', type: 'success' });
      fetchReports();
    } catch (error) {
      setPopup({ visible: true, title: 'Error', message: 'Gagal memproses verifikasi.', type: 'error' });
    }
  };

  const openDocument = async (url: string) => {
    const fullUrl = resolveBackendUrl(url);
    if (fullUrl) {
      await WebBrowser.openBrowserAsync(fullUrl);
    }
  };

  const filteredReports = useMemo(() => {
    if (activeTab === 'pending') {
      return reports.filter(r => r.status === 'pending');
    }
    return reports.filter(r => r.status !== 'pending');
  }, [reports, activeTab]);

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.container}>
      
      {/* HEADER (Gaya Dashboard.tsx) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#3A5F50" />
        </TouchableOpacity>
        <View>
            <Text style={styles.headerTitle}>Dashboard Adopsi</Text>
            <Text style={styles.headerSubtitle}>Verifikasi berkas calon adopter</Text>
        </View>
      </View>

      {/* TABS (Gaya Dashboard.tsx) */}
      <View style={styles.tabContainer}>
          <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'pending' && styles.tabBtnActive]} 
              onPress={() => setActiveTab('pending')}
          >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Menunggu</Text>
                {reports.filter(r => r.status === 'pending').length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{reports.filter(r => r.status === 'pending').length}</Text>
                  </View>
                )}
              </View>
          </TouchableOpacity>
          <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]} 
              onPress={() => setActiveTab('history')}
          >
              <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Riwayat</Text>
          </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {loading ? (
            <ActivityIndicator size="large" color="#EBCD5E" style={{ marginTop: 50 }} />
        ) : filteredReports.length === 0 ? (
            <View style={styles.emptyBox}>
                <FontAwesome name={activeTab === 'pending' ? 'clipboard' : 'history'} size={40} color="#ccc" />
                <Text style={styles.emptyText}>
                  {activeTab === 'pending' ? 'Tidak ada permintaan baru.' : 'Belum ada riwayat.'}
                </Text>
            </View>
        ) : (
            filteredReports.map((report) => (
                <View 
                    key={report.id} 
                    style={[
                      styles.reportCard, 
                      { borderLeftColor: report.status === 'pending' ? '#EBCD5E' : report.status === 'approved' ? '#22c55e' : '#ef4444' }
                    ]}
                >
                    {/* Compact Header */}
                    <TouchableOpacity 
                        onPress={() => setExpandedId(expandedId === report.id ? null : report.id)}
                        style={styles.cardHeader}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeaderLeft}>
                            <Image 
                                source={{ uri: resolveImageUrl(report.adopter.profilePic) }} 
                                style={styles.adopterAvatar} 
                            />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <View style={styles.statusRow}>
                                    <View style={[styles.statusPill, { backgroundColor: report.status === 'pending' ? '#fef9c3' : report.status === 'approved' ? '#dcfce7' : '#fef2f2' }]}>
                                        <Text style={[styles.statusPillText, { color: report.status === 'pending' ? '#a16207' : report.status === 'approved' ? '#15803d' : '#b91c1c' }]}>
                                            {getStatusLabel(report.status)}
                                        </Text>
                                    </View>
                                    <Text style={styles.dateText}>{report.date}</Text>
                                </View>
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    <Text style={{ fontWeight: 'bold' }}>{report.adopter.name}</Text>
                                    <Text style={{ color: '#6b7280', fontSize: 12 }}> ingin adopsi </Text>
                                    <Text style={{ fontWeight: 'bold' }}>{report.catName}</Text>
                                </Text>
                            </View>
                        </View>
                        <FontAwesome name={expandedId === report.id ? 'chevron-up' : 'chevron-down'} size={14} color="#9ca3af" />
                    </TouchableOpacity>

                    {/* Expandable Details (Isi Card Tetap) */}
                    {expandedId === report.id && (
                        <View style={styles.cardExpanded}>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>Data Pelamar</Text>
                            <View style={styles.infoList}>
                                <Text style={styles.infoItem}><Text style={styles.infoLabel}>NIK:</Text> {report.adopter.nik}</Text>
                                <Text style={styles.infoItem}><Text style={styles.infoLabel}>HP:</Text> {report.adopter.phone}</Text>
                                <Text style={styles.infoItem}><Text style={styles.infoLabel}>Pekerjaan:</Text> {report.adopter.job}</Text>
                                <Text style={styles.infoItem}><Text style={styles.infoLabel}>Alamat:</Text> {report.adopter.address}</Text>
                            </View>

                            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Dokumen</Text>
                            <View style={styles.docRow}>
                                {report.adopter.documentUrl && (
                                    <TouchableOpacity onPress={() => openDocument(report.adopter.documentUrl)} style={styles.docBtn}>
                                        <FontAwesome name="file-pdf-o" size={14} color="#ef4444" />
                                        <Text style={styles.docBtnText}>Surat Pernyataan</Text>
                                    </TouchableOpacity>
                                )}
                                {report.adopter.identityUrl && (
                                    <TouchableOpacity onPress={() => openDocument(report.adopter.identityUrl)} style={[styles.docBtn, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]}>
                                        <FontAwesome name="id-card" size={14} color="#3b82f6" />
                                        <Text style={[styles.docBtnText, { color: '#475569' }]}>Foto KTP</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Action Buttons */}
                            {report.status === 'pending' && (
                                <View style={styles.actionRow}>
                                    <TouchableOpacity 
                                        onPress={() => handleVerification(report.id, 'rejected')}
                                        style={styles.rejectBtn}
                                    >
                                        <Text style={styles.rejectBtnText}>Tolak</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => handleVerification(report.id, 'approved')}
                                        style={styles.approveBtn}
                                    >
                                        <Text style={styles.approveBtnText}>Setujui</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            ))
        )}
      </ScrollView>
      <ConfirmModal
        visible={confirm.visible}
        title="Konfirmasi"
        message={`Apakah Anda yakin ingin ${confirm.status === 'approved' ? 'menyetujui' : 'menolak'} adopsi ini?`}
        onConfirm={processVerification}
        onClose={() => setConfirm({ ...confirm, visible: false })}
        type={confirm.status === 'approved' ? 'warning' : 'danger'}
        confirmText="Ya, Proses"
      />

      <CustomPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, visible: false })}
      />
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  
  // Header Style (Dashboard.tsx)
  header: { 
    paddingTop: Platform.OS === 'android' ? 50 : 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 13, color: '#6b7280' },
  
  // Tab Style (Dashboard.tsx)
  tabContainer: { 
    flexDirection: 'row', 
    padding: 15, 
    gap: 10,
    backgroundColor: '#fff' 
  },
  tabBtn: { 
    flex: 1, 
    paddingVertical: 10, 
    borderRadius: 25, 
    alignItems: 'center', 
    backgroundColor: '#f3f4f6' 
  },
  tabBtnActive: { backgroundColor: '#3A5F50' },
  tabText: { fontWeight: '600', color: '#666', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  
  countBadge: { backgroundColor: '#ef4444', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  countText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  content: { padding: 20 },
  emptyBox: { backgroundColor: '#fff', borderRadius: 20, padding: 40, alignItems: 'center', marginTop: 20, elevation: 2 },
  emptyText: { textAlign: 'center', marginTop: 10, color: '#9ca3af', fontStyle: 'italic' },

  // Report Card (Gaya Card Tetap)
  reportCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginBottom: 15, 
    elevation: 2, 
    overflow: 'hidden',
    borderLeftWidth: 4
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15 
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  adopterAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8 },
  statusPillText: { fontSize: 9, fontWeight: 'bold' },
  dateText: { fontSize: 11, color: '#9ca3af' },
  cardTitle: { fontSize: 14, color: '#1f2937' },

  // Expanded Content (Isi Tetap)
  cardExpanded: { paddingHorizontal: 15, paddingBottom: 15 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  infoList: { gap: 4 },
  infoItem: { fontSize: 13, color: '#4b5563' },
  infoLabel: { fontWeight: '600', color: '#374151' },
  
  docRow: { flexDirection: 'row', gap: 8, marginTop: 5 },
  docBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f0fdf4', 
    borderWidth: 1, 
    borderColor: '#dcfce7', 
    padding: 8, 
    borderRadius: 8,
    gap: 6
  },
  docBtnText: { color: '#166534', fontSize: 11, fontWeight: 'bold' },

  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10 },
  rejectBtn: { px: 20, paddingVertical: 8, paddingHorizontal: 24, borderRadius: 10, borderWidth: 1, borderColor: '#fecaca' },
  rejectBtnText: { color: '#dc2626', fontWeight: 'bold', fontSize: 13 },
  approveBtn: { paddingVertical: 8, paddingHorizontal: 24, borderRadius: 10, backgroundColor: '#3A5F50', elevation: 2 },
  approveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});