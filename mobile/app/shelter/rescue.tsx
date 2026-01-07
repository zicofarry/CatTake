import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  ActivityIndicator, Modal, FlatList, Alert, RefreshControl, Dimensions, Platform 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient, { API_BASE_URL } from '../../api/apiClient';

const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://192.168.1.5:3000';

function resolveImageUrl(path: string | null) {
  if (!path || path === 'NULL') return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('report-')) return `${serverUrl}/public/img/report_cat/${path}`;
  if (path.startsWith('profile-') || path.startsWith('driver-')) return `${serverUrl}/public/img/profile/${path}`;
  return `${serverUrl}/public/img/${path}`;
}

export default function ShelterRescuePage() {
  const router = useRouter();
  
  // State Tabs
  const [activeTab, setActiveTab] = useState<'incoming' | 'tasks'>('incoming');
  
  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [incomingReports, setIncomingReports] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  // Modal State
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resIncoming, resTasks, resDrivers] = await Promise.all([
        apiClient.get('/rescue/incoming'),
        apiClient.get('/rescue/my-tasks'),
        apiClient.get('/rescue/drivers')
      ]);
      
      setIncomingReports(resIncoming.data);
      setMyTasks(resTasks.data);
      setDrivers(resDrivers.data);
    } catch (error) {
      console.error("Gagal ambil data rescue:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openAssignModal = (reportId: number) => {
    setSelectedReportId(reportId);
    setShowDriverModal(true);
  };

  const assignDriver = async (driverId: number) => {
    if (!selectedReportId) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.post('/rescue/accept', {
        reportId: selectedReportId,
        driverId: driverId
      });
      
      Alert.alert("Berhasil", "Driver telah ditugaskan!");
      setShowDriverModal(false);
      fetchData(); 
      setActiveTab('tasks'); 
    } catch (error: any) {
      Alert.alert("Gagal", error.response?.data?.error || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Text style={styles.headerTitle}>Rescue Center</Text>
            <Text style={styles.headerSubtitle}>Manajemen Laporan Penyelamatan</Text>
        </View>
      </View>

      {/* TABS (Gaya Dashboard.tsx) */}
      <View style={styles.tabContainer}>
          <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'incoming' && styles.tabBtnActive]} 
              onPress={() => setActiveTab('incoming')}
          >
              <Text style={[styles.tabText, activeTab === 'incoming' && styles.tabTextActive]}>
                  Permintaan {incomingReports.length > 0 && <Text style={{color: '#ef4444'}}>●</Text>}
              </Text>
          </TouchableOpacity>
          <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'tasks' && styles.tabBtnActive]} 
              onPress={() => setActiveTab('tasks')}
          >
              <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>Tugas Berjalan</Text>
          </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3A5F50" />}
      >
        {isLoading ? (
            <ActivityIndicator size="large" color="#EBCD5E" style={{marginTop: 50}} />
        ) : (
            <>
                {/* === TAB 1: PERMINTAAN MASUK === */}
                {activeTab === 'incoming' && (
                    <>
                        {incomingReports.length === 0 ? (
                            <Text style={styles.emptyText}>Tidak ada laporan baru saat ini.</Text>
                        ) : (
                            incomingReports.map((report) => (
                                <View key={report.id} style={styles.reportCard}>
                                    <View style={styles.cardHighlight} />
                                    <View style={styles.cardBody}>
                                        <View style={styles.cardHeaderRow}>
                                            <Image source={{ uri: resolveImageUrl(report.photo) || undefined }} style={styles.reportImage} />
                                            <View style={{flex:1}}>
                                                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                                    <Text style={styles.reportId}>Laporan #{report.id}</Text>
                                                    <View style={styles.dateBadge}>
                                                        <Text style={styles.dateText}>{new Date(report.created_at).toLocaleDateString()}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.infoRow}><Ionicons name="person" size={12} color="#666" /><Text style={styles.infoText}>{report.full_name || 'Anonim'}</Text></View>
                                                <View style={styles.infoRow}><Ionicons name="location" size={12} color="#ef4444" /><Text style={styles.infoText} numberOfLines={1}>{report.location}</Text></View>
                                            </View>
                                        </View>
                                        <Text style={styles.descText} numberOfLines={3}>"{report.description}"</Text>
                                        <TouchableOpacity style={styles.assignBtn} onPress={() => openAssignModal(report.id)}>
                                            <Text style={styles.assignBtnText}>Pilih Driver & Terima</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}

                {/* === TAB 2: TUGAS BERJALAN === */}
                {activeTab === 'tasks' && (
                    <>
                        {myTasks.length === 0 ? (
                            <Text style={styles.emptyText}>Belum ada tugas yang sedang berjalan.</Text>
                        ) : (
                            myTasks.map((task) => (
                                <View key={task.assignment_id} style={styles.taskCard}>
                                    <View style={styles.taskHeader}>
                                        <View style={[styles.statusPill, task.assignment_status === 'completed' ? styles.bgGreen : task.assignment_status === 'in_transit' ? styles.bgYellow : styles.bgBlue]}>
                                            <Text style={[styles.statusText, task.assignment_status === 'completed' ? styles.textGreen : task.assignment_status === 'in_transit' ? styles.textYellow : styles.textBlue]}>
                                                {/* PERBAIKAN: Menggunakan pemetaan bahasa Indonesia */}
                                                {task.assignment_status === 'assigned' ? 'DITUGASKAN' : 
                                                 task.assignment_status === 'in_transit' ? 'DIJEMPUT' : 'SELESAI'}
                                            </Text>
                                        </View>
                                        <View style={{flexDirection:'row', alignItems:'center', gap:4}}><Ionicons name="car" size={12} color="#666" /><Text style={styles.driverName}>{task.driver_name}</Text></View>
                                    </View>
                                    <View style={styles.taskBody}>
                                        <Image source={{ uri: resolveImageUrl(task.photo) || undefined }} style={styles.taskImage} />
                                        <View style={{flex:1, justifyContent:'center'}}>
                                            <Text style={styles.taskLoc} numberOfLines={1}>{task.location}</Text>
                                            <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.taskFooter}><Text style={{fontSize:10, color:'#999'}}>ID Tracking: {task.tracking_id}</Text></View>
                                </View>
                            ))
                        )}
                    </>
                )}
            </>
        )}
      </ScrollView>

      {/* MODAL PILIH DRIVER (Gaya Dashboard.tsx) */}
      <Modal visible={showDriverModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeaderModal}>
                    <Text style={styles.modalTitle}>Tugaskan Driver</Text>
                    <TouchableOpacity onPress={() => setShowDriverModal(false)}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
                {isSubmitting && <ActivityIndicator size="small" color="#EBCD5E" style={{marginBottom:10}} />}
                <FlatList 
                    data={drivers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => (
                        <TouchableOpacity style={[styles.driverItem, !item.is_available && {opacity: 0.5}]} onPress={() => item.is_available && assignDriver(item.id)} disabled={!item.is_available || isSubmitting}>
                            <Image source={{ uri: resolveImageUrl(item.profile_picture) || 'https://via.placeholder.com/50' }} style={styles.driverAvatar} />
                            <View style={{flex:1}}>
                                <Text style={styles.itemDriverName}>{item.full_name}</Text>
                                <Text style={[styles.itemDriverStatus, item.is_available ? {color:'#059669'} : {color:'#dc2626'}]}>{item.is_available ? '● Siap' : '● Sibuk'}</Text>
                            </View>
                            {item.is_available && <Ionicons name="chevron-forward" size={20} color="#3A5F50" />}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>

    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  
  header: { 
    paddingTop: Platform.OS === 'android' ? 50 : 60, 
    paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#fff', 
    flexDirection: 'row', alignItems: 'center', gap: 15, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 13, color: '#6b7280' },

  tabContainer: { flexDirection: 'row', padding: 15, gap: 10, backgroundColor: '#fff' },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 25, alignItems: 'center', backgroundColor: '#f3f4f6' },
  tabBtnActive: { backgroundColor: '#3A5F50' },
  tabText: { fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },

  content: { padding: 20 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#9ca3af', fontStyle: 'italic' },

  reportCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, flexDirection: 'row', overflow: 'hidden', elevation: 4 },
  cardHighlight: { width: 8, backgroundColor: '#EBCD5E' },
  cardBody: { flex: 1, padding: 15 },
  cardHeaderRow: { flexDirection: 'row', gap: 15, marginBottom: 12 },
  reportImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#eee' },
  reportId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  dateBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  dateText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { fontSize: 12, color: '#555' },
  descText: { fontSize: 13, color: '#666', fontStyle: 'italic', marginBottom: 15 },
  assignBtn: { backgroundColor: '#EBCD5E', padding: 12, borderRadius: 12, alignItems: 'center' },
  assignBtnText: { color: '#1f2937', fontWeight: 'bold', fontSize: 14 },

  taskCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 15, padding: 15, elevation: 3 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 10 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  bgGreen: { backgroundColor: '#dcfce7' }, textGreen: { color: '#166534' },
  bgYellow: { backgroundColor: '#fef9c3' }, textYellow: { color: '#854d0e' },
  bgBlue: { backgroundColor: '#dbeafe' }, textBlue: { color: '#1e40af' },
  driverName: { fontSize: 12, color: '#333', fontWeight: '600' },
  taskBody: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  taskImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#eee' },
  taskLoc: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  taskDesc: { fontSize: 12, color: '#888' },
  taskFooter: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '80%' },
  modalHeaderModal: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  driverItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 12 },
  driverAvatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#eee' },
  itemDriverName: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  itemDriverStatus: { fontSize: 12, fontWeight: '600' }
});