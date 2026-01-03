import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  ActivityIndicator, Modal, FlatList, Alert, RefreshControl, Dimensions 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient, { API_BASE_URL } from '../../api/apiClient';

const { width } = Dimensions.get('window');
// Pastikan ini IP Laptop (cek ipconfig)
const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://192.168.1.5:3000';

// Helper untuk URL Gambar
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
  
  // Modal State (Assign Driver)
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Ambil 3 data sekaligus: Laporan Masuk, Tugas Saya, List Driver
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

  // --- LOGIC ASSIGN DRIVER ---
  const openAssignModal = (reportId: number) => {
    setSelectedReportId(reportId);
    setShowDriverModal(true);
  };

  const assignDriver = async (driverId: number) => {
    if (!selectedReportId) return;
    
    setIsSubmitting(true);
    try {
      // Kirim JSON biasa (bukan FormData, jadi aman)
      await apiClient.post('/rescue/accept', {
        reportId: selectedReportId,
        driverId: driverId
      });
      
      Alert.alert("Berhasil", "Driver telah ditugaskan!");
      setShowDriverModal(false);
      
      // Refresh data & pindah ke tab tugas
      fetchData(); 
      setActiveTab('tasks'); 
    } catch (error: any) {
      Alert.alert("Gagal", error.response?.data?.error || "Terjadi kesalahan saat assign driver.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.container}>
      
      {/* Background Gradient Hijau */}
      <LinearGradient colors={['#cfe3d4', '#3A5F50']} style={styles.bgGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}/>
      
      {/* HEADER */}
      <View style={styles.headerArea}>
        <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#3A5F50" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Rescue Center</Text>
            <View style={{width: 40}} /> 
        </View>

        {/* FLOATING TABS */}
        <View style={styles.floatingTabs}>
            <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'incoming' && styles.tabBtnActive]} 
                onPress={() => setActiveTab('incoming')}
            >
                <Text style={[styles.tabText, activeTab === 'incoming' && styles.tabTextActive]}>
                    Permintaan {incomingReports.length > 0 && <Text style={{color: '#ef4444', fontSize:10}}>●</Text>}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'tasks' && styles.tabBtnActive]} 
                onPress={() => setActiveTab('tasks')}
            >
                <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>Tugas Berjalan</Text>
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {isLoading ? (
            <ActivityIndicator size="large" color="#fff" style={{marginTop: 50}} />
        ) : (
            <>
                {/* === TAB 1: PERMINTAAN MASUK === */}
                {activeTab === 'incoming' && (
                    <>
                        {incomingReports.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Ionicons name="shield-checkmark" size={50} color="#ccc" />
                                <Text style={styles.emptyText}>Semua aman, tidak ada laporan baru.</Text>
                            </View>
                        ) : (
                            incomingReports.map((report) => (
                                <View key={report.id} style={styles.reportCard}>
                                    <View style={styles.cardHighlight} />
                                    <View style={styles.cardBody}>
                                        {/* Info Header */}
                                        <View style={styles.cardHeaderRow}>
                                            <Image 
                                                source={{ uri: resolveImageUrl(report.photo) || undefined }} 
                                                style={styles.reportImage} 
                                            />
                                            <View style={{flex:1}}>
                                                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                                    <Text style={styles.reportId}>#{report.id}</Text>
                                                    <View style={styles.dateBadge}>
                                                        <Text style={styles.dateText}>{new Date(report.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</Text>
                                                    </View>
                                                </View>
                                                
                                                <View style={styles.infoRow}>
                                                    <Ionicons name="person" size={12} color="#666" />
                                                    <Text style={styles.infoText}>{report.full_name || report.reporter_name || 'Anonim'}</Text>
                                                </View>
                                                <View style={styles.infoRow}>
                                                    <Ionicons name="location" size={12} color="#ef4444" />
                                                    <Text style={styles.infoText} numberOfLines={1}>{report.location}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        
                                        {/* Deskripsi */}
                                        <Text style={styles.descText} numberOfLines={3}>"{report.description}"</Text>
                                        
                                        {/* Tombol Assign */}
                                        <TouchableOpacity 
                                            style={styles.assignBtn} 
                                            onPress={() => openAssignModal(report.id)}
                                        >
                                            <Text style={styles.assignBtnText}>Pilih Driver & Terima</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}

                {/* === TAB 2: TUGAS SAYA (TANPA TRACKING) === */}
                {activeTab === 'tasks' && (
                    <>
                        {myTasks.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyText}>Belum ada tugas yang diambil.</Text>
                            </View>
                        ) : (
                            myTasks.map((task) => (
                                <View key={task.assignment_id} style={styles.taskCard}>
                                    {/* Header Status */}
                                    <View style={styles.taskHeader}>
                                        <View style={[styles.statusPill, 
                                            task.assignment_status === 'completed' ? styles.bgGreen : 
                                            task.assignment_status === 'in_transit' ? styles.bgYellow : styles.bgBlue
                                        ]}>
                                            <Text style={[styles.statusText,
                                                task.assignment_status === 'completed' ? styles.textGreen : 
                                                task.assignment_status === 'in_transit' ? styles.textYellow : styles.textBlue
                                            ]}>
                                                {task.assignment_status === 'assigned' ? 'DITUGASKAN' : 
                                                 task.assignment_status === 'in_transit' ? 'DIJEMPUT' : 'SELESAI'}
                                            </Text>
                                        </View>
                                        <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
                                            <Ionicons name="car" size={12} color="#666" />
                                            <Text style={styles.driverName}>{task.driver_name}</Text>
                                        </View>
                                    </View>

                                    {/* Detail Tugas */}
                                    <View style={styles.taskBody}>
                                        <Image source={{ uri: resolveImageUrl(task.photo) || undefined }} style={styles.taskImage} />
                                        <View style={{flex:1, justifyContent:'center'}}>
                                            <Text style={styles.taskLoc} numberOfLines={1}>{task.location}</Text>
                                            <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
                                        </View>
                                    </View>

                                    {/* Info Kaki (Tanpa Tombol Tracking) */}
                                    <View style={styles.taskFooter}>
                                        <Text style={{fontSize:10, color:'#999'}}>
                                            ID Tracking: {task.tracking_id}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}
            </>
        )}
      </ScrollView>

      {/* MODAL PILIH DRIVER */}
      <Modal visible={showDriverModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Tugaskan Driver</Text>
                    <TouchableOpacity onPress={() => setShowDriverModal(false)}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                {isSubmitting && <ActivityIndicator size="small" color="#EBCD5E" style={{marginBottom:10}} />}

                <FlatList 
                    data={drivers}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{paddingBottom: 20}}
                    renderItem={({item}) => (
                        <TouchableOpacity 
                            style={[styles.driverItem, !item.is_available && {opacity: 0.5}]} 
                            onPress={() => item.is_available && assignDriver(item.id)}
                            disabled={!item.is_available || isSubmitting}
                        >
                            <Image 
                                source={{ uri: resolveImageUrl(item.profile_picture) || 'https://via.placeholder.com/50' }} 
                                style={styles.driverAvatar} 
                            />
                            <View style={{flex:1}}>
                                <Text style={styles.itemDriverName}>{item.full_name}</Text>
                                <Text style={[styles.itemDriverStatus, item.is_available ? {color:'#059669'} : {color:'#dc2626'}]}>
                                    {item.is_available ? '● Siap Bertugas' : '● Sedang Sibuk'}
                                </Text>
                            </View>
                            {item.is_available && <Ionicons name="chevron-forward" size={20} color="#3A5F50" />}
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={{padding:20, alignItems:'center'}}>
                            <Text style={{color:'#999'}}>Tidak ada driver.</Text>
                        </View>
                    }
                />
            </View>
        </View>
      </Modal>

    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  
  // Header
  headerArea: { paddingTop: 50, paddingBottom: 10, paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { backgroundColor: 'white', padding: 8, borderRadius: 20, shadowColor:'#000', elevation:2 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', textShadowColor: 'rgba(0,0,0,0.2)', textShadowRadius: 4 },
  
  // Tabs
  floatingTabs: { 
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', 
    padding: 6, borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 25 },
  tabBtnActive: { backgroundColor: '#EBCD5E' },
  tabText: { color: '#666', fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },

  scrollContent: { padding: 20, paddingBottom: 100 },
  
  // Empty State
  emptyCard: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: 40, alignItems: 'center' },
  emptyText: { marginTop: 10, color: '#555', fontSize: 16, textAlign:'center' },

  // CARD LAPORAN (Incoming)
  reportCard: { 
    backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, flexDirection: 'row', 
    overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 
  },
  cardHighlight: { width: 8, backgroundColor: '#EBCD5E' },
  cardBody: { flex: 1, padding: 15 },
  cardHeaderRow: { flexDirection: 'row', gap: 15, marginBottom: 12 },
  reportImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#eee' },
  reportId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  dateBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  dateText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { fontSize: 12, color: '#555' },
  descText: { fontSize: 13, color: '#666', fontStyle: 'italic', marginBottom: 15, lineHeight: 18 },
  
  assignBtn: { backgroundColor: '#EBCD5E', padding: 12, borderRadius: 12, alignItems: 'center', shadowColor:'#EBCD5E', shadowOpacity:0.3, elevation:2 },
  assignBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // CARD TUGAS (Tasks)
  taskCard: { 
    backgroundColor: '#fff', borderRadius: 20, marginBottom: 15, padding: 15,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 10 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  bgGreen: { backgroundColor: '#dcfce7' }, textGreen: { color: '#166534' },
  bgYellow: { backgroundColor: '#fef9c3' }, textYellow: { color: '#854d0e' },
  bgBlue: { backgroundColor: '#dbeafe' }, textBlue: { color: '#1e40af' },
  driverName: { fontSize: 12, color: '#333', fontWeight: '600' },
  
  taskBody: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  taskImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#eee' },
  taskLoc: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  taskDesc: { fontSize: 12, color: '#888' },
  taskFooter: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: '#fff', borderRadius: 25, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  driverItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 12 },
  driverAvatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#eee' },
  itemDriverName: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  itemDriverStatus: { fontSize: 12, fontWeight: '600' }
});